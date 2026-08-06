export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDashboardStats } from '@/lib/admin/queries';
import { formatPrice } from '@/lib/format';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'Revenu (payé)', value: formatPrice(stats.revenueCents), href: '/admin/orders', accent: true },
    { label: 'Commandes', value: String(stats.orders), href: '/admin/orders' },
    { label: 'Produits', value: String(stats.products), href: '/admin/products' },
    { label: 'Événements', value: String(stats.events), href: '/admin/events' },
    { label: 'Clients', value: String(stats.customers), href: '/admin' },
  ];

  return (
    <div>
      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Vue d&apos;ensemble</p>
      <h1 className="heading-lg mb-12">Tableau de bord</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="p-8 block transition-transform"
            style={{ background: '#fff', borderTop: `2px solid ${c.accent ? '#eb1e7a' : '#C9A84C'}` }}
          >
            <p className="overline-text mb-3" style={{ color: '#999' }}>{c.label}</p>
            <p className="font-display" style={{ fontSize: '2rem', fontWeight: 300, color: c.accent ? '#eb1e7a' : '#080808' }}>
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/admin/products" className="btn-dark" style={{ padding: '0.8rem 2rem' }}><span>Gérer les produits</span></Link>
        <Link href="/admin/orders" className="btn-gold" style={{ padding: '0.8rem 2rem' }}><span>Voir les commandes</span></Link>
      </div>
    </div>
  );
}
