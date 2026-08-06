'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  CalendarDays,
  Truck,
  Users,
  Store,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';

const items = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/categories', label: 'Catégories', icon: FolderTree },
  { href: '/admin/events', label: 'Événements', icon: CalendarDays },
  { href: '/admin/shipping', label: 'Livraisons', icon: Truck },
  { href: '/admin/customers', label: 'Clients', icon: Users },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((it) => {
        const active = isActive(it.href, it.exact);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 transition-colors"
            style={{
              color: active ? '#fff' : 'rgba(250,247,242,0.6)',
              background: active ? 'rgba(235,30,122,0.14)' : 'transparent',
              borderLeft: active ? '2px solid #eb1e7a' : '2px solid transparent',
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              letterSpacing: '0.03em',
            }}
          >
            <Icon size={17} strokeWidth={1.5} style={{ color: active ? '#eb1e7a' : 'rgba(201,168,76,0.7)' }} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );

  const inner = (
    <div className="flex flex-col h-full" style={{ background: '#0c0c0c' }}>
      <div className="px-6 py-7" style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}>
        <Link href="/admin" className="font-script text-white" style={{ fontSize: '2rem', lineHeight: 1 }}>
          Sarje
        </Link>
        <p className="overline-text mt-1" style={{ color: 'rgba(201,168,76,0.7)', fontSize: '0.55rem' }}>Administration</p>
      </div>

      <div className="flex-1 py-5 overflow-y-auto">{nav}</div>

      <div className="px-4 py-5" style={{ borderTop: '1px solid rgba(201,168,76,0.14)' }}>
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5" style={{ color: 'rgba(250,247,242,0.6)', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>
          <Store size={16} strokeWidth={1.5} style={{ color: 'rgba(201,168,76,0.7)' }} />
          Voir la boutique
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-3 px-4 py-2.5 w-full text-left" style={{ color: 'rgba(250,247,242,0.6)', fontSize: '0.78rem', fontFamily: 'var(--font-body)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={16} strokeWidth={1.5} style={{ color: 'rgba(201,168,76,0.7)' }} />
            Déconnexion
          </button>
        </form>
        <p className="body-refined px-4 mt-3" style={{ color: 'rgba(250,247,242,0.3)', fontSize: '0.65rem' }}>{email}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4" style={{ background: '#0c0c0c' }}>
        <Link href="/admin" className="font-script text-white" style={{ fontSize: '1.5rem' }}>Sarje</Link>
        <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu admin" style={{ color: '#fff' }}>
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block" style={{ width: 250, flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        {inner}
      </aside>

      {/* Mobile drawer */}
      <div
        className="lg:hidden fixed inset-0 z-50 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.5)', opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none' }}
        onClick={() => setOpen(false)}
      >
        <div
          style={{ width: 260, height: '100%', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-3" style={{ background: '#0c0c0c' }}>
            <button onClick={() => setOpen(false)} aria-label="Fermer" style={{ color: 'rgba(250,247,242,0.7)' }}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div style={{ height: 'calc(100% - 48px)' }}>{inner}</div>
        </div>
      </div>
    </>
  );
}
