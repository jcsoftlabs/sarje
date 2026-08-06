export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminOrders } from '@/lib/admin/queries';
import { updateOrderStatus } from '@/lib/admin/actions';
import { formatPrice, formatDate } from '@/lib/format';

const STATUSES = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];
const statusColor: Record<string, string> = {
  pending: '#C9A84C',
  paid: '#7a9a6a',
  fulfilled: '#4a7ab5',
  cancelled: '#aaa',
  refunded: '#eb1e7a',
};

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Ventes</p>
          <h1 className="heading-lg">Commandes</h1>
        </div>
        <p className="body-refined" style={{ color: '#999', fontSize: '0.8rem' }}>{orders.length} commandes</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20" style={{ background: '#fff' }}>
          <p className="body-refined" style={{ color: '#999' }}>Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                {['Commande', 'Date', 'Client', 'Articles', 'Total', 'Statut', ''].map((h, i) => (
                  <th key={i} className="overline-text" style={{ textAlign: 'left', padding: '14px 16px', color: '#999', fontSize: '0.6rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f2f0ec' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/orders/${o.id}`} className="body-refined" style={{ color: '#080808', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{o.orderNumber}</Link>
                  </td>
                  <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#888' }}>{formatDate(o.createdAt)}</td>
                  <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#666' }}>{o.email}</td>
                  <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#666' }}>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#C9A84C' }}>{formatPrice(o.totalCents, o.currency)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="overline-text" style={{ color: statusColor[o.status] ?? '#666', fontSize: '0.6rem' }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status} style={{ border: '1px solid rgba(58,58,58,0.2)', padding: '4px 6px', fontSize: '0.72rem', fontFamily: 'var(--font-body)', color: '#3A3A3A' }}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="submit" className="overline-text" style={{ color: '#eb1e7a', fontSize: '0.6rem', background: 'none', border: 'none', cursor: 'pointer' }}>OK</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
