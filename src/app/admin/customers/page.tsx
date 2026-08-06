export const dynamic = 'force-dynamic';

import { getAdminCustomers } from '@/lib/admin/queries';
import { formatPrice, formatDate } from '@/lib/format';

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div>
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Clientèle</p>
          <h1 className="heading-lg">Clients</h1>
        </div>
        <p className="body-refined" style={{ color: '#999', fontSize: '0.8rem' }}>{customers.length} comptes</p>
      </div>

      <div style={{ background: '#fff', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Client', 'Email', 'Rôle', 'Commandes', 'Total dépensé', 'Inscription'].map((h, i) => (
                <th key={i} className="overline-text" style={{ textAlign: 'left', padding: '14px 16px', color: '#999', fontSize: '0.6rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f2f0ec' }}>
                <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#080808' }}>
                  {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#666' }}>{c.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="overline-text" style={{ color: c.role === 'admin' ? '#eb1e7a' : '#999', fontSize: '0.55rem' }}>{c.role}</span>
                </td>
                <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#3A3A3A' }}>{c.orders}</td>
                <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#C9A84C' }}>{formatPrice(c.spentCents, 'USD')}</td>
                <td className="body-refined" style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#999' }}>{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
