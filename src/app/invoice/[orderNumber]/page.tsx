export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { getOrderByNumber } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth/session';
import { formatPrice, formatDate } from '@/lib/format';
import PrintButton from '@/components/PrintButton';

export const metadata = { title: 'Facture' };

const LOGO = 'https://res.cloudinary.com/tdqpx8gd/image/upload/w_240,c_fit,f_png,q_auto/sarje/brand/logo.png';

export default async function InvoicePage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();
  // Only the buyer or an admin may view the invoice.
  if (order.userId !== user.id && user.role !== 'admin') notFound();

  const addr = (order.shippingAddress ?? {}) as Record<string, string>;
  const paymentLine = order.paymentBrand
    ? `${order.paymentBrand}${order.paymentLast4 ? ` •••• ${order.paymentLast4}` : ''}`
    : 'Carte';

  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '0' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 40px' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Sarje" style={{ width: 110, height: 'auto' }} />
            <p className="body-refined" style={{ fontSize: '0.72rem', color: '#888', marginTop: 8, lineHeight: 1.6 }}>
              Sarje — Maison de Haute Couture<br />Miami · Port-au-Prince<br />commandes@sarje.com
            </p>
          </div>
          <div className="text-right">
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 300, color: '#080808' }}>Facture</h1>
            <p className="body-refined" style={{ fontSize: '0.8rem', color: '#555' }}>N° {order.orderNumber}</p>
            <p className="body-refined" style={{ fontSize: '0.8rem', color: '#888' }}>{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Facturé à</p>
            <div className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A', lineHeight: 1.8 }}>
              <p>{addr.firstName} {addr.lastName}</p>
              <p>{order.email}</p>
              <p style={{ marginTop: 6 }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p>{addr.city} {addr.region} {addr.postalCode}</p>
              <p>{addr.country}</p>
            </div>
          </div>
          <div>
            <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Paiement</p>
            <div className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A', lineHeight: 1.8 }}>
              <p>Moyen : {paymentLine}</p>
              <p>Statut : {order.status === 'paid' || order.status === 'fulfilled' ? 'Payée' : order.status}</p>
              {order.squarePaymentId && <p style={{ color: '#999', fontSize: '0.72rem', marginTop: 4 }}>Réf. Square : {order.squarePaymentId}</p>}
            </div>
          </div>
        </div>

        {/* Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #080808' }}>
              <th className="overline-text" style={{ textAlign: 'left', padding: '10px 0', color: '#888', fontSize: '0.6rem' }}>Article</th>
              <th className="overline-text" style={{ textAlign: 'center', padding: '10px 0', color: '#888', fontSize: '0.6rem' }}>Qté</th>
              <th className="overline-text" style={{ textAlign: 'right', padding: '10px 0', color: '#888', fontSize: '0.6rem' }}>P.U.</th>
              <th className="overline-text" style={{ textAlign: 'right', padding: '10px 0', color: '#888', fontSize: '0.6rem' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} style={{ borderBottom: '1px solid #eee' }}>
                <td className="body-refined" style={{ padding: '12px 0', fontSize: '0.85rem', color: '#3A3A3A' }}>{it.nameSnapshot}</td>
                <td className="body-refined" style={{ padding: '12px 0', fontSize: '0.85rem', color: '#3A3A3A', textAlign: 'center' }}>{it.quantity}</td>
                <td className="body-refined" style={{ padding: '12px 0', fontSize: '0.85rem', color: '#3A3A3A', textAlign: 'right' }}>{formatPrice(it.unitPriceCents, order.currency)}</td>
                <td className="body-refined" style={{ padding: '12px 0', fontSize: '0.85rem', color: '#3A3A3A', textAlign: 'right' }}>{formatPrice(it.unitPriceCents * it.quantity, order.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div style={{ width: 260 }}>
            <div className="flex justify-between py-1"><span className="body-refined" style={{ color: '#888', fontSize: '0.82rem' }}>Sous-total</span><span className="body-refined" style={{ fontSize: '0.82rem' }}>{formatPrice(order.subtotalCents, order.currency)}</span></div>
            <div className="flex justify-between py-1"><span className="body-refined" style={{ color: '#888', fontSize: '0.82rem' }}>Livraison</span><span className="body-refined" style={{ fontSize: '0.82rem' }}>{order.shippingCents === 0 ? 'Offerte' : formatPrice(order.shippingCents, order.currency)}</span></div>
            {order.taxCents > 0 && <div className="flex justify-between py-1"><span className="body-refined" style={{ color: '#888', fontSize: '0.82rem' }}>Taxes</span><span className="body-refined" style={{ fontSize: '0.82rem' }}>{formatPrice(order.taxCents, order.currency)}</span></div>}
            <div className="flex justify-between py-3 mt-2" style={{ borderTop: '2px solid #080808' }}>
              <span className="font-display" style={{ fontSize: '1.3rem' }}>Total</span>
              <span className="font-display" style={{ fontSize: '1.3rem', color: '#C9A84C' }}>{formatPrice(order.totalCents, order.currency)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="body-refined" style={{ fontSize: '0.7rem', color: '#bbb' }}>Merci pour votre confiance. — Sarje</p>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
