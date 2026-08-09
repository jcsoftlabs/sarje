export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminOrder } from '@/lib/admin/queries';
import { updateFulfillment } from '@/lib/admin/actions';
import { formatPrice, formatDate } from '@/lib/format';

const cell = { border: '1px solid rgba(58,58,58,0.2)', padding: '9px 11px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#3A3A3A', width: '100%' } as const;

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

      {/* Fulfillment / tracking */}
      <div className="mt-10" style={{ background: '#fff', padding: '2rem' }}>
        <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Suivi &amp; expédition</p>
        {order.shippedAt && (
          <p className="body-refined mb-4" style={{ fontSize: '0.78rem', color: '#7a9a6a' }}>Expédiée le {formatDate(order.shippedAt)}</p>
        )}
        <form action={updateFulfillment} className="flex flex-col gap-4" style={{ maxWidth: 560 }}>
          <input type="hidden" name="id" value={order.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Transporteur</span>
              <input name="carrier" defaultValue={order.carrier ?? ''} placeholder="DHL, FedEx, USPS…" style={cell} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>N° de suivi</span>
              <input name="trackingNumber" defaultValue={order.trackingNumber ?? ''} style={cell} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Lien de suivi (URL)</span>
            <input name="trackingUrl" defaultValue={order.trackingUrl ?? ''} placeholder="https://…" style={cell} />
          </label>
          <div className="flex items-center justify-between flex-wrap gap-4">
            {!order.shippedAt ? (
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input type="checkbox" name="markShipped" />
                <span className="body-refined" style={{ fontSize: '0.82rem', color: '#3A3A3A' }}>Marquer comme expédiée &amp; notifier le client par email</span>
              </label>
            ) : (
              <span className="body-refined" style={{ fontSize: '0.78rem', color: '#999' }}>Client déjà notifié de l&apos;expédition.</span>
            )}
            <button type="submit" className="btn-dark" style={{ padding: '0.7rem 1.6rem' }}><span>Enregistrer</span></button>
          </div>
        </form>
      </div>
    </div>
  );
}
