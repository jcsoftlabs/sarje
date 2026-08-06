import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';

export const metadata = { title: 'Administration' };

const nav = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/products', label: 'Produits' },
  { href: '/admin/orders', label: 'Commandes' },
  { href: '/admin/events', label: 'Événements' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div style={{ background: '#FAF7F2', minHeight: '70vh' }}>
      {/* Admin bar */}
      <div style={{ background: '#080808' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8 flex-wrap">
            <span className="overline-text" style={{ color: '#C9A84C' }}>Sarje · Admin</span>
            <nav className="flex items-center gap-6 flex-wrap">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="nav-link"
                  style={{ color: 'rgba(250,247,242,0.85)' }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <span className="body-refined" style={{ color: 'rgba(250,247,242,0.5)', fontSize: '0.75rem' }}>
              {admin.email}
            </span>
            <Link href="/" className="nav-link" style={{ color: 'rgba(250,247,242,0.85)' }}>
              ↗ Boutique
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-12">{children}</div>
    </div>
  );
}
