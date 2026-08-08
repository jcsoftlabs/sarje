'use server';

import { z } from 'zod';
import { randomBytes, randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  orders,
  orderItems,
  productVariants,
  ticketTiers,
  tickets,
  shippingMethods,
} from '@/db/schema';
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square';
import { getCurrentUser } from '@/lib/auth/session';
import { sendOrderConfirmation } from '@/lib/email';

const itemSchema = z.object({
  kind: z.enum(['product', 'ticket']),
  refId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

const checkoutSchema = z.object({
  sourceId: z.string().min(1),
  contact: z.object({
    email: z.string().email(),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    phone: z.string().trim().optional(),
  }),
  shipping: z.object({
    line1: z.string().trim().min(1),
    line2: z.string().trim().optional(),
    city: z.string().trim().min(1),
    region: z.string().trim().optional(),
    postalCode: z.string().trim().min(1),
    country: z.string().trim().default('US'),
  }),
  shippingMethodId: z.string().uuid().optional(),
  items: z.array(itemSchema).min(1),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutResult = { ok: true; orderNumber: string } | { ok: false; error: string };

interface ResolvedLine {
  kind: 'product' | 'ticket';
  refId: string;
  quantity: number;
  unitPriceCents: number;
  name: string;
  subtitle: string | null;
  image: string | null;
  productId?: string;
  variantId?: string;
  eventId?: string;
  tierId?: string;
}

function orderNumber() {
  return `SARJE-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
}
function ticketCode() {
  return `SRJ-${randomBytes(5).toString('hex').toUpperCase()}`;
}

export async function placeOrder(raw: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Informations de commande invalides.' };
  const input = parsed.data;

  // 1) Recompute every line from the DB — never trust client prices.
  const lines: ResolvedLine[] = [];
  for (const item of input.items) {
    if (item.kind === 'product') {
      const variant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, item.refId),
        with: { product: { with: { images: { limit: 1 } } } },
      });
      if (!variant || variant.product.status !== 'active')
        return { ok: false, error: 'Une pièce de votre panier n’est plus disponible.' };
      if (variant.stock < item.quantity)
        return { ok: false, error: `Stock insuffisant pour ${variant.product.name}.` };
      lines.push({
        kind: 'product',
        refId: item.refId,
        quantity: item.quantity,
        unitPriceCents: variant.priceCents ?? variant.product.priceCents,
        name: variant.product.name,
        subtitle: variant.name,
        image: variant.product.images[0]?.url ?? null,
        productId: variant.productId,
        variantId: variant.id,
      });
    } else {
      const tier = await db.query.ticketTiers.findFirst({
        where: eq(ticketTiers.id, item.refId),
        with: { event: true },
      });
      if (!tier) return { ok: false, error: 'Un billet de votre panier n’est plus disponible.' };
      if (tier.capacity - tier.sold < item.quantity)
        return { ok: false, error: `Plus assez de places pour ${tier.name}.` };
      lines.push({
        kind: 'ticket',
        refId: item.refId,
        quantity: item.quantity,
        unitPriceCents: tier.priceCents,
        name: tier.event.title,
        subtitle: tier.name,
        image: tier.event.imageUrl ?? null,
        eventId: tier.eventId,
        tierId: tier.id,
      });
    }
  }

  const subtotalCents = lines.reduce((n, l) => n + l.unitPriceCents * l.quantity, 0);

  // Shipping — resolve the chosen method server-side (never trust the client).
  // Ticket-only orders don't ship.
  const hasPhysical = lines.some((l) => l.kind === 'product');
  let shippingCents = 0;
  let shippingLabel: string | null = null;
  if (hasPhysical && input.shippingMethodId) {
    const method = await db.query.shippingMethods.findFirst({
      where: eq(shippingMethods.id, input.shippingMethodId),
    });
    if (!method || !method.active) {
      return { ok: false, error: 'Mode de livraison indisponible.' };
    }
    // Re-validate the destination zone and order-value tier server-side.
    const norm = (input.shipping.country || '').trim().toUpperCase();
    const countryOk = !method.countries || method.countries.split(',').includes(norm);
    const minOk = method.minSubtotalCents == null || subtotalCents >= method.minSubtotalCents;
    const maxOk = method.maxSubtotalCents == null || subtotalCents <= method.maxSubtotalCents;
    if (!countryOk || !minOk || !maxOk) {
      return { ok: false, error: 'Ce mode de livraison ne s’applique pas à votre commande.' };
    }
    const freeApplies = method.freeOverCents != null && subtotalCents >= method.freeOverCents;
    shippingCents = freeApplies ? 0 : method.priceCents;
    shippingLabel = method.name;
  }

  const totalCents = subtotalCents + shippingCents;
  const currency = 'USD';

  // 2) Charge via Square.
  let squarePaymentId: string | undefined;
  try {
    const resp = await squareClient.payments.create({
      sourceId: input.sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: { amount: BigInt(totalCents), currency: 'USD' },
      locationId: SQUARE_LOCATION_ID,
      buyerEmailAddress: input.contact.email,
      note: 'Commande Sarje',
    });
    const payment = resp.payment;
    const status = payment?.status ?? '';
    if (!payment || !['COMPLETED', 'APPROVED'].includes(status)) {
      return { ok: false, error: 'Le paiement n’a pas pu être confirmé.' };
    }
    squarePaymentId = payment.id ?? undefined;
  } catch (e) {
    const msg =
      (e as { errors?: { detail?: string }[] })?.errors?.[0]?.detail ??
      (e instanceof Error ? e.message : 'Paiement refusé.');
    return { ok: false, error: msg };
  }

  // 3) Persist the order atomically.
  const user = await getCurrentUser();
  const number = orderNumber();

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: number,
        userId: user?.id ?? null,
        email: input.contact.email,
        status: 'paid',
        subtotalCents,
        shippingCents,
        totalCents,
        currency,
        shippingAddress: { ...input.shipping, ...input.contact, shippingMethod: shippingLabel },
        squarePaymentId,
      })
      .returning();

    for (const l of lines) {
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: l.productId ?? null,
        variantId: l.variantId ?? null,
        eventId: l.eventId ?? null,
        tierId: l.tierId ?? null,
        kind: l.kind,
        nameSnapshot: l.name,
        imageSnapshot: l.image,
        unitPriceCents: l.unitPriceCents,
        quantity: l.quantity,
      });

      if (l.kind === 'product' && l.variantId) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${l.quantity}` })
          .where(eq(productVariants.id, l.variantId));
      } else if (l.kind === 'ticket' && l.tierId && l.eventId) {
        await tx
          .update(ticketTiers)
          .set({ sold: sql`${ticketTiers.sold} + ${l.quantity}` })
          .where(eq(ticketTiers.id, l.tierId));
        for (let i = 0; i < l.quantity; i++) {
          await tx.insert(tickets).values({
            code: ticketCode(),
            orderId: order.id,
            eventId: l.eventId,
            tierId: l.tierId,
            attendeeName: `${input.contact.firstName} ${input.contact.lastName}`,
            status: 'valid',
          });
        }
      }
    }
  });

  // 4) Confirmation email (non-fatal).
  await sendOrderConfirmation({
    to: input.contact.email,
    orderNumber: number,
    firstName: input.contact.firstName,
    items: lines.map((l) => ({
      name: l.name,
      subtitle: l.subtitle,
      image: l.image,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
    })),
    totalCents,
    currency,
  });

  return { ok: true, orderNumber: number };
}
