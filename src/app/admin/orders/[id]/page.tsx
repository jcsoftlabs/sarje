export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminOrder } from '@/lib/admin/queries';
import { formatPrice, formatDate } from '@/lib/format';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const addr = (order.shippingAddress ?? {}) as Record<string, string>;

  return (
    <div>
      <Link href="/admin/orders" className="nav-link" style={{ color: '#666' }}>← Commandes</Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mt-4 mb-10">
        <div>
          <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>{order.status}</p>
          <h1 className="heading-lg">{order.orderNumber}</h1>
          <p className="body-refined mt-2" style={{ color: '#888', fontSize: '0.8rem' }}>{formatDate(order.createdAt)}</p>
        </div>
        <p className="font-display" style={{ fontSize: '2rem', color: '#C9A84C' }}>{formatPrice(order.totalCents, order.currency)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2" style={{ background: '#fff', padding: '2rem' }}>
          <p className="overline-text mb-5" style={{ color: '#999' }}>Articles</p>
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between gap-4 py-3" style={{ borderBottom: '1px solid #f2f0ec' }}>
              <span className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A' }}>{it.quantity} × {it.nameSnapshot}</span>
              <span className="body-refined" style={{ fontSize: '0.85rem', color: '#C9A84C' }}>{formatPrice(it.unitPriceCents * it.quantity, order.currency)}</span>
            </div>
          ))}
          {order.tickets.length > 0 && (
            <div className="mt-6">
              <p className="overline-text mb-3" style={{ color: '#999' }}>Billets émis</p>
              {order.tickets.map((t) => (
                <p key={t.id} className="body-refined" style={{ fontSize: '0.78rem', color: '#666' }}>
                  {t.code} — {t.event.title} ({t.tier?.name}) · {t.status}
                </p>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', padding: '2rem' }}>
          <p className="overline-text mb-5" style={{ color: '#999' }}>Livraison</p>
          <div className="body-refined" style={{ fontSize: '0.82rem', color: '#3A3A3A', lineHeight: 1.9 }}>
            <p>{addr.firstName} {addr.lastName}</p>
            <p>{order.email}</p>
            {addr.phone && <p>{addr.phone}</p>}
            <p style={{ marginTop: 8 }}>{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>{addr.city} {addr.region} {addr.postalCode}</p>
            <p>{addr.country}</p>
          </div>
          {order.squarePaymentId && (
            <p className="body-refined mt-6" style={{ fontSize: '0.68rem', color: '#bbb', letterSpacing: '0.05em' }}>Square : {order.squarePaymentId}</p>
          )}
        </div>
      </div>
    </div>
  );
}
