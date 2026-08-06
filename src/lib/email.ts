import 'server-only';
import { Resend } from 'resend';
import { formatPrice } from './format';

const resend = new Resend(process.env.RESEND_API_KEY);

// sarje.com is verified in Resend — send from a branded address.
const FROM = process.env.RESEND_FROM ?? 'Sarje <commandes@sarje.com>';

interface OrderEmailItem {
  name: string;
  subtitle?: string | null;
  image?: string | null;
  quantity: number;
  unitPriceCents: number;
}

interface OrderEmailInput {
  to: string;
  orderNumber: string;
  firstName?: string | null;
  items: OrderEmailItem[];
  totalCents: number;
  currency: string;
}

// Downscale Cloudinary images to a crisp email thumbnail; leave others as-is.
function thumb(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_160,h_200,c_fill,q_auto,f_auto/');
  }
  return url;
}

export async function sendOrderConfirmation(order: OrderEmailInput): Promise<{ ok: boolean; error?: string }> {
  const rows = order.items
    .map((it) => {
      const img = thumb(it.image);
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eee;width:72px;vertical-align:top;">
            ${
              img
                ? `<img src="${img}" alt="" width="64" height="80" style="width:64px;height:80px;object-fit:cover;display:block;border:1px solid #eee;" />`
                : ''
            }
          </td>
          <td style="padding:14px 12px;border-bottom:1px solid #eee;vertical-align:top;">
            <div style="font-family:Georgia,serif;font-size:15px;color:#080808;">${it.name}</div>
            ${it.subtitle ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#999;margin-top:3px;">${it.subtitle}</div>` : ''}
            <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#bbb;margin-top:3px;">Quantité : ${it.quantity}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #eee;text-align:right;vertical-align:top;font-family:Georgia,serif;font-size:15px;color:#C9A84C;white-space:nowrap;">
            ${formatPrice(it.unitPriceCents * it.quantity, order.currency)}
          </td>
        </tr>`;
    })
    .join('');

  const html = `
  <div style="background:#FAF7F2;padding:40px 0;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-top:3px solid #eb1e7a;padding:40px;">
      <p style="letter-spacing:0.35em;text-transform:uppercase;font-size:11px;color:#C9A84C;margin:0;">Sarje — Haute Couture</p>
      <h1 style="font-family:Georgia,serif;font-weight:300;color:#080808;font-size:28px;margin:16px 0;">Merci ${order.firstName ?? ''}.</h1>
      <p style="color:#555;font-size:14px;line-height:1.7;">Votre commande <strong>${order.orderNumber}</strong> est confirmée. Nos ateliers la préparent avec le plus grand soin.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">${rows}
        <tr>
          <td colspan="2" style="padding:18px 0;font-family:Georgia,serif;font-size:18px;color:#080808;">Total</td>
          <td style="padding:18px 0;text-align:right;font-family:Georgia,serif;font-size:18px;color:#C9A84C;">${formatPrice(order.totalCents, order.currency)}</td>
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
