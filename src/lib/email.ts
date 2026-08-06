import 'server-only';
import { Resend } from 'resend';
import { formatPrice } from './format';

const resend = new Resend(process.env.RESEND_API_KEY);

// Until a domain is verified in Resend, sending is limited to onboarding@resend.dev.
const FROM = process.env.RESEND_FROM ?? 'Sarje <onboarding@resend.dev>';

interface OrderEmailInput {
  to: string;
  orderNumber: string;
  firstName?: string | null;
  items: { name: string; subtitle?: string | null; quantity: number; unitPriceCents: number }[];
  totalCents: number;
  currency: string;
}

export async function sendOrderConfirmation(order: OrderEmailInput): Promise<{ ok: boolean; error?: string }> {
  const rows = order.items
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#2A2A2A;font-family:Georgia,serif;">
            ${it.quantity} × ${it.name}${it.subtitle ? ` <span style="color:#999;">— ${it.subtitle}</span>` : ''}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#C9A84C;font-family:Georgia,serif;">
            ${formatPrice(it.unitPriceCents * it.quantity, order.currency)}
          </td>
        </tr>`,
    )
    .join('');

  const html = `
  <div style="background:#FAF7F2;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-top:3px solid #eb1e7a;padding:40px;">
      <p style="letter-spacing:0.35em;text-transform:uppercase;font-size:11px;color:#C9A84C;">Sarje — Haute Couture</p>
      <h1 style="font-family:Georgia,serif;font-weight:300;color:#080808;font-size:28px;margin:16px 0;">Merci ${order.firstName ?? ''}.</h1>
      <p style="color:#555;font-size:14px;line-height:1.7;">Votre commande <strong>${order.orderNumber}</strong> est confirmée. Nos ateliers la préparent avec le plus grand soin.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">${rows}
        <tr>
          <td style="padding:16px 0;font-family:Georgia,serif;font-size:18px;color:#080808;">Total</td>
          <td style="padding:16px 0;text-align:right;font-family:Georgia,serif;font-size:18px;color:#C9A84C;">${formatPrice(order.totalCents, order.currency)}</td>
        </tr>
      </table>
      <p style="color:#999;font-size:12px;">Sarje — Miami · Port-au-Prince</p>
    </div>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: order.to,
      subject: `Votre commande Sarje ${order.orderNumber}`,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'email failed' };
  }
}
