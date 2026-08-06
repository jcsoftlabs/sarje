import { NextResponse } from 'next/server';
import { WebhooksHelper } from 'square';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ?? '';
const NOTIFICATION_URL =
  process.env.SQUARE_WEBHOOK_URL ?? 'https://www.sarje.com/api/square/webhook';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-square-hmacsha256-signature') ?? '';

  // Verify the request genuinely comes from Square.
  let valid = false;
  try {
    valid = await WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey: SIGNATURE_KEY,
      notificationUrl: NOTIFICATION_URL,
    });
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const type: string = event?.type ?? '';
  const obj = event?.data?.object ?? {};

  try {
    // Payment lifecycle → reconcile order status.
    if (type.startsWith('payment.') && obj.payment?.id) {
      const status: string = obj.payment.status ?? '';
      const mapped =
        status === 'COMPLETED' ? 'paid' : status === 'CANCELED' || status === 'FAILED' ? 'cancelled' : null;
      if (mapped) {
        await db.update(orders).set({ status: mapped }).where(eq(orders.squarePaymentId, obj.payment.id));
      }
    }

    // Refund → mark the order refunded.
    if (type.startsWith('refund.') && obj.refund?.paymentId && obj.refund.status === 'COMPLETED') {
      await db.update(orders).set({ status: 'refunded' }).where(eq(orders.squarePaymentId, obj.refund.paymentId));
    }
  } catch {
    // Acknowledge anyway so Square doesn't retry forever on our transient errors.
  }

  return NextResponse.json({ received: true });
}
