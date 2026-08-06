export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getOrdersForUser } from '@/lib/queries';
import { logoutAction } from '@/lib/auth/actions';
import { formatPrice, formatDate } from '@/lib/format';

export const metadata = { title: 'Mon Compte' };

const orderStatusLabel: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  fulfilled: 'Expédiée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const orders = await getOrdersForUser(user.id);

  return (
    <div style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-16">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div>
            <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Espace Client</p>
            <h1 className="heading-lg">Bonjour, {user.firstName ?? 'Cliente'}</h1>
            <p className="body-refined mt-2" style={{ color: '#666', fontSize: '0.85rem' }}>{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <Link href="/admin" className="btn-dark" style={{ padding: '0.7rem 1.8rem' }}>
                <span>Administration</span>
              </Link>
            )}
            <form action={logoutAction}>
              <button type="submit" className="btn-gold" style={{ padding: '0.7rem 1.8rem' }}>
                <span>Déconnexion</span>
              </button>
            </form>
          </div>
        </div>

        {/* Orders */}
        <div className="divider-gold mb-10" style={{ justifyContent: 'flex-start' }}>
          <h2 className="heading-md">Mes Commandes</h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20" style={{ background: '#fff', border: '1px solid #eee' }}>
            <p className="body-refined mb-6" style={{ color: '#888' }}>Vous n&apos;avez pas encore de commande.</p>
            <Link href="/shop" className="btn-gold"><span>Découvrir la Collection</span></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div key={order.id} className="p-6 lg:p-8" style={{ background: '#fff', borderTop: '2px solid #C9A84C' }}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="overline-text" style={{ color: '#C9A84C' }}>Commande {order.orderNumber}</p>
                    <p className="body-refined" style={{ fontSize: '0.78rem', color: '#888' }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="overline-text" style={{ color: '#3A3A3A' }}>{orderStatusLabel[order.status] ?? order.status}</p>
                    <p className="font-display" style={{ fontSize: '1.4rem', color: '#C9A84C' }}>
                      {formatPrice(order.totalCents, order.currency)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {order.items.map((it) => (
                    <p key={it.id} className="body-refined" style={{ fontSize: '0.82rem', color: '#555' }}>
                      {it.quantity} × {it.nameSnapshot}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
