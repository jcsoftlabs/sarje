'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { products, productVariants, orders, events, ticketTiers } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/admin';

export interface ActionState {
  ok?: boolean;
  error?: string;
}

const toCents = (v: FormDataEntryValue | null) => Math.round(parseFloat(String(v ?? '0')) * 100);
const toInt = (v: FormDataEntryValue | null) => parseInt(String(v ?? '0'), 10) || 0;

/* ─── Products ───────────────────────────────────────────────────── */
export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const schema = z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1),
    category: z.string().trim().min(1),
    description: z.string().trim().optional(),
    price: z.number().nonnegative(),
    status: z.enum(['draft', 'active', 'archived']),
    isFeatured: z.boolean(),
  });
  const parsed = schema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description') || undefined,
    price: parseFloat(String(formData.get('price') ?? '')),
    status: formData.get('status'),
    isFeatured: formData.get('isFeatured') === 'on',
  });
  if (!parsed.success) return { error: 'Champs produit invalides.' };
  const p = parsed.data;

  await db
    .update(products)
    .set({
      name: p.name,
      category: p.category,
      description: p.description ?? null,
      priceCents: Math.round(p.price * 100),
      status: p.status,
      isFeatured: p.isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(products.id, p.id));

  // Variant stock — fields named stock-<variantId>.
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('stock-')) {
      const variantId = key.slice(6);
      await db.update(productVariants).set({ stock: toInt(value) }).where(eq(productVariants.id, variantId));
    }
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${p.id}`);
  return { ok: true };
}

/* ─── Orders ─────────────────────────────────────────────────────── */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  const allowed = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'] as const;
  if (!id || !(allowed as readonly string[]).includes(status)) return;
  await db.update(orders).set({ status: status as (typeof allowed)[number], updatedAt: new Date() }).where(eq(orders.id, id));
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
}

/* ─── Events & tiers ─────────────────────────────────────────────── */
export async function updateEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Événement introuvable.' };

  const name = String(formData.get('title') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const startsAtRaw = String(formData.get('startsAt') ?? '');
  const status = String(formData.get('status') ?? 'active') as 'draft' | 'active' | 'archived';
  if (!name || !location) return { error: 'Titre et lieu requis.' };

  await db
    .update(events)
    .set({
      title: name,
      location,
      startsAt: startsAtRaw ? new Date(startsAtRaw) : undefined,
      status,
      isFeatured: formData.get('isFeatured') === 'on',
      updatedAt: new Date(),
    })
    .where(eq(events.id, id));

  // Tiers — price-<tierId> and capacity-<tierId>.
  const tierIds = new Set<string>();
  for (const key of formData.keys()) {
    if (key.startsWith('price-')) tierIds.add(key.slice(6));
    if (key.startsWith('capacity-')) tierIds.add(key.slice(9));
  }
  for (const tid of tierIds) {
    await db
      .update(ticketTiers)
      .set({ priceCents: toCents(formData.get(`price-${tid}`)), capacity: toInt(formData.get(`capacity-${tid}`)) })
      .where(eq(ticketTiers.id, tid));
  }

  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${id}`);
  return { ok: true };
}
