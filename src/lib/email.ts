import 'server-only';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { formatPrice, formatDate } from './format';
import { ticketToken } from './tickets';

const resend = new Resend(process.env.RESEND_API_KEY);

// sarje.com is verified in Resend — send from a branded address.
const FROM = process.env.RESEND_FROM ?? 'Sarje <commandes@sarje.com>';

const LOGO_URL =
  'https://res.cloudinary.com/tdqpx8gd/image/upload/w_280,c_fit,f_png,q_auto/sarje/brand/logo.png';

interface OrderEmailItem {
  name: string;
  subtitle?: string | null;
  image?: string | null;
  quantity: number;
  unitPriceCents: number;
}

interface OrderEmailTicket {
  code: string;
  eventTitle: string;
  tierName?: string | null;
  date?: string | null;
}

interface OrderEmailInput {
  to: string;
  orderNumber: string;
  firstName?: string | null;
  items: OrderEmailItem[];
  tickets?: OrderEmailTicket[];
  totalCents: number;
  currency: string;
}

// Hosted QR image (renders in email clients; the code is also shown as text).
function qrImage(code: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=0&data=${encodeURIComponent(code)}`;
}

// Downscale Cloudinary images to a crisp email thumbnail; leave others as-is.
function thumb(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // f_jpg (not f_auto): email clients render JPEG reliably, WebP/AVIF not always.
    return url.replace('/upload/', '/upload/w_160,h_200,c_fill,q_auto,f_jpg/');
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
      <div style="text-align:center;margin-bottom:8px;">
        <img src="${LOGO_URL}" alt="Sarje" width="132" style="width:132px;height:auto;display:inline-block;" />
      </div>
      <p style="letter-spacing:0.35em;text-transform:uppercase;font-size:11px;color:#C9A84C;margin:0;text-align:center;">Haute Couture</p>
      <h1 style="font-family:Georgia,serif;font-weight:300;color:#080808;font-size:28px;margin:16px 0;">Merci ${order.firstName ?? ''}.</h1>
      <p style="color:#555;font-size:14px;line-height:1.7;">Votre commande <strong>${order.orderNumber}</strong> est confirmée. Nos ateliers la préparent avec le plus grand soin.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">${rows}
        <tr>
          <td colspan="2" style="padding:18px 0;font-family:Georgia,serif;font-size:18px;color:#080808;">Total</td>
          <td style="padding:18px 0;text-align:right;font-family:Georgia,serif;font-size:18px;color:#C9A84C;">${formatPrice(order.totalCents, order.currency)}</td>
        </tr>
      </table>
      ${
        order.tickets && order.tickets.length > 0
          ? `<div style="margin-top:12px;">
              <p style="letter-spacing:0.25em;text-transform:uppercase;font-size:11px;color:#C9A84C;margin:0 0 12px;">Vos billets</p>
              ${order.tickets
                .map(
                  (t) => `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;background:#faf7f2;"><tr>
                    <td style="padding:14px;width:96px;vertical-align:middle;"><img src="${qrImage(ticketToken(t.code))}" alt="${t.code}" width="80" height="80" style="width:80px;height:80px;display:block;background:#fff;" /></td>
                    <td style="padding:14px;vertical-align:middle;">
                      <div style="font-family:Georgia,serif;font-size:15px;color:#080808;">${t.eventTitle}</div>
                      ${t.tierName ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#999;margin-top:2px;">${t.tierName}</div>` : ''}
                      ${t.date ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#999;margin-top:2px;">${t.date}</div>` : ''}
                      <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#C9A84C;letter-spacing:0.08em;margin-top:6px;">${t.code}</div>
                    </td>
                  </tr></table>`,
                )
                .join('')}
              <p style="color:#aaa;font-size:11px;">Présentez ces QR codes à l'entrée. Ils sont joints à cet email (à enregistrer sur votre téléphone) et disponibles dans votre compte.</p>
            </div>`
          : ''
      }
      <p style="color:#999;font-size:12px;margin-top:16px;">Sarje — Miami · Port-au-Prince</p>
    </div>
  </div>`;

  // Attach each ticket's QR as a PNG so the client can save it to their phone.
  const attachments = await Promise.all(
    (order.tickets ?? []).map(async (t) => ({
      filename: `billet-${t.code}.png`,
      content: (await QRCode.toBuffer(ticketToken(t.code), { width: 600, margin: 1 })).toString('base64'),
    })),
  );

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: order.to,
      subject: `Votre commande Sarje ${order.orderNumber}`,
      html,
      ...(attachments.length > 0 ? { attachments } : {}),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'email failed' };
  }
}

/* ─── Admin: new order alert ─────────────────────────────────────── */
export async function sendNewOrderNotification(input: {
  to: string[];
  orderNumber: string;
  customer: string;
  email: string;
  items: { name: string; quantity: number }[];
  totalCents: number;
  currency: string;
  shippingLabel?: string | null;
}): Promise<void> {
  if (input.to.length === 0) return;
  const lines = input.items.map((i) => `${i.quantity} × ${i.name}`).join('<br>');
  const html = `
  <div style="font-family:Helvetica,Arial;max-width:520px;margin:0 auto;padding:24px;">
    <h2 style="font-family:Georgia,serif;color:#080808;">Nouvelle commande — ${input.orderNumber}</h2>
    <p style="color:#333;font-size:14px;">Client : <strong>${input.customer}</strong> (${input.email})</p>
    <p style="color:#333;font-size:14px;">${lines}</p>
    <p style="color:#333;font-size:14px;">Livraison : ${input.shippingLabel ?? '—'}</p>
    <p style="font-family:Georgia,serif;font-size:18px;color:#C9A84C;">Total : ${formatPrice(input.totalCents, input.currency)}</p>
    <p style="font-size:12px;color:#999;">Gérez cette commande dans le tableau de bord Sarje.</p>
  </div>`;
  try {
    await resend.emails.send({ from: FROM, to: input.to, subject: `🛍️ Nouvelle commande ${input.orderNumber} — ${formatPrice(input.totalCents, input.currency)}`, html });
  } catch {
    /* non-fatal */
  }
}

/* ─── Client: shipping / tracking notification ───────────────────── */
export async function sendShippingNotification(input: {
  to: string;
  orderNumber: string;
  firstName?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: Date | null;
}): Promise<void> {
  const track = input.trackingUrl
    ? `<a href="${input.trackingUrl}" style="color:#eb1e7a;">Suivre mon colis</a>`
    : input.trackingNumber
      ? `Numéro de suivi : <strong>${input.trackingNumber}</strong>`
      : '';
  const html = `
  <div style="background:#FAF7F2;padding:40px 0;font-family:Helvetica,Arial;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-top:3px solid #eb1e7a;padding:40px;">
      <div style="text-align:center;margin-bottom:8px;"><img src="${LOGO_URL}" width="132" style="width:132px;height:auto;"/></div>
      <p style="letter-spacing:.35em;text-transform:uppercase;font-size:11px;color:#C9A84C;text-align:center;margin:0;">Expédition</p>
      <h1 style="font-family:Georgia,serif;font-weight:300;color:#080808;font-size:26px;margin:16px 0;">Votre commande est en route${input.firstName ? `, ${input.firstName}` : ''}.</h1>
      <p style="color:#555;font-size:14px;line-height:1.7;">La commande <strong>${input.orderNumber}</strong> a été expédiée${input.shippedAt ? ` le ${formatDate(input.shippedAt)}` : ''}${input.carrier ? ` via ${input.carrier}` : ''}.</p>
      ${track ? `<p style="color:#333;font-size:14px;margin-top:16px;">${track}</p>` : ''}
      <p style="color:#999;font-size:12px;margin-top:24px;">Sarje — Miami · Port-au-Prince</p>
    </div>
  </div>`;
  try {
    await resend.emails.send({ from: FROM, to: input.to, subject: `Votre commande Sarje ${input.orderNumber} est expédiée`, html });
  } catch {
    /* non-fatal */
  }
}
