export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShoppingBag, Ticket as TicketIcon, MapPin, FileText } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { getOrdersForUser, getTicketsForUser } from '@/lib/queries';
import { logoutAction } from '@/lib/auth/actions';
import { formatPrice, formatDate } from '@/lib/format';
import TicketQR from '@/components/checkout/TicketQR';
import { ticketToken } from '@/lib/tickets';

export const metadata = { title: 'Mon Compte' };

const orderStatusLabel: Record<string, { t: string; c: string }> = {
  pending: { t: 'En attente', c: '#C9A84C' },
  paid: { t: 'Payée', c: '#7a9a6a' },
  fulfilled: { t: 'Expédiée', c: '#4a7ab5' },
  cancelled: { t: 'Annulée', c: '#aaa' },
  refunded: { t: 'Remboursée', c: '#eb1e7a' },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [orders, tickets] = await Promise.all([getOrdersForUser(user.id), getTicketsForUser(user.id)]);
  const validTickets = tickets.filter((t) => t.status === 'valid');
  const lastCity = (orders[0]?.shippingAddress as Record<string, string> | null)?.city;

  const cards = [
    { icon: ShoppingBag, label: 'Commandes', value: `${orders.length}`, href: '#commandes' },
    { icon: TicketIcon, label: 'Billets valides', value: `${validTickets.length}`, href: '#billets' },
    { icon: MapPin, label: 'Adresse', value: lastCity ?? '—', href: '#commandes' },
    { icon: FileText, label: 'Factures', value: 'Disponibles', href: '#commandes' },
  ];

  return (
    <div style={{ background: '#F4F1EC', paddingBottom: '100px', minHeight: '80vh' }}>
      <div className="max-w-screen-lg mx-auto px-6 lg:px-12 pt-14">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div>
            <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Espace Client</p>
            <h1 className="heading-lg">Bonjour, {user.firstName ?? 'Cliente'}</h1>
            <p className="body-refined mt-2" style={{ color: '#777', fontSize: '0.85rem' }}>{user.email}</p>
          </div>
          <div className="flex items-center gap-5 pt-2">
            <form action={logoutAction}>
              <button type="submit" className="nav-link" style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>Déconnexion</button>
            </form>
          </div>
        </div>

        {/* Quick cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.label} href={c.href} className="p-6 block transition-transform" style={{ background: '#fff' }}>
                <Icon size={20} strokeWidth={1.4} style={{ color: '#C9A84C' }} />
                <p className="overline-text mt-4" style={{ color: '#999' }}>{c.label}</p>
                <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 300, color: '#080808', marginTop: 2 }}>{c.value}</p>
              </a>
            );
          })}
        </div>

        {/* Tickets */}
        {tickets.length > 0 && (
          <div id="billets" className="mb-16" style={{ scrollMarginTop: 120 }}>
            <div className="divider-gold mb-8" style={{ justifyContent: 'flex-start' }}>
              <h2 className="heading-md">Mes Billets</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tickets.map((t) => {
                const used = t.status === 'used';
                return (
                  <div key={t.id} className="qr-ticket flex items-center gap-5 p-5" style={used ? { opacity: 0.5 } : undefined}>
                    <TicketQR code={ticketToken(t.code)} />
                    <div>
                      <p className="overline-text mb-1" style={{ color: used ? '#aaa' : '#C9A84C' }}>{t.tier?.name ?? 'Billet'}</p>
                      <p className="font-display" style={{ fontSize: '1.1rem', color: '#080808' }}>{t.event.title}</p>
                      <p className="body-refined" style={{ fontSize: '0.72rem', color: '#888' }}>{formatDate(t.event.startsAt)} — {t.event.location}</p>
                      <p className="body-refined" style={{ fontSize: '0.66rem', color: used ? '#c88' : '#bbb', letterSpacing: '0.08em', marginTop: 4 }}>{used ? 'Utilisé' : t.code}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders */}
        <div id="commandes" style={{ scrollMarginTop: 120 }}>
          <div className="divider-gold mb-8" style={{ justifyContent: 'flex-start' }}>
            <h2 className="heading-md">Mes Commandes</h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20" style={{ background: '#fff' }}>
              <p className="body-refined mb-6" style={{ color: '#888' }}>Vous n&apos;avez pas encore de commande.</p>
              <Link href="/shop" className="btn-gold"><span>Découvrir la Collection</span></Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => {
                const st = orderStatusLabel[order.status] ?? { t: order.status, c: '#666' };
                const count = order.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <div key={order.id} style={{ background: '#fff' }}>
                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4" style={{ background: '#faf7f2', borderBottom: '1px solid #eee' }}>
                      <div className="flex flex-wrap gap-x-8 gap-y-1">
                        <div>
                          <p className="overline-text" style={{ color: '#aaa', fontSize: '0.55rem' }}>Commande</p>
                          <p className="body-refined" style={{ fontSize: '0.8rem', color: '#3A3A3A', letterSpacing: '0.03em' }}>{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="overline-text" style={{ color: '#aaa', fontSize: '0.55rem' }}>Date</p>
                          <p className="body-refined" style={{ fontSize: '0.8rem', color: '#3A3A3A' }}>{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="overline-text" style={{ color: '#aaa', fontSize: '0.55rem' }}>Total</p>
                          <p className="body-refined" style={{ fontSize: '0.8rem', color: '#C9A84C' }}>{formatPrice(order.totalCents, order.currency)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="overline-text" style={{ color: st.c, fontSize: '0.6rem' }}>{st.t}</span>
                        <Link href={`/invoice/${order.orderNumber}`} className="nav-link flex items-center gap-1" style={{ color: '#eb1e7a' }}>
                          <FileText size={13} /> Facture
                        </Link>
                      </div>
                    </div>
                    <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        {order.items.slice(0, 3).map((it) => (
                          <p key={it.id} className="body-refined" style={{ fontSize: '0.82rem', color: '#555' }}>{it.quantity} × {it.nameSnapshot}</p>
                        ))}
                        {order.items.length > 3 && <p className="body-refined" style={{ fontSize: '0.75rem', color: '#aaa' }}>+ {order.items.length - 3} autre(s)</p>}
                      </div>
                      <span className="body-refined" style={{ fontSize: '0.72rem', color: '#bbb' }}>{count} article{count > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
