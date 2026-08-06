'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X, ScanLine } from 'lucide-react';
import { useCart, cartCount } from '@/lib/store/cart';

const Navbar = () => {
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');
  const count = mounted ? cartCount(items) : 0;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const dark = scrolled || !isHome;

  const navLinks = [
    { to: '/shop', label: 'Collection' },
    { to: '/events', label: 'Événements' },
    { to: '/scanner', label: 'Scanner' },
  ];

  // The admin area has its own chrome (sidebar) — no storefront navbar there.
  if (isAdmin) return null;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: dark ? 'rgba(250,247,242,0.97)' : 'transparent',
          backdropFilter: dark ? 'blur(20px)' : 'none',
          borderBottom: dark ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 40px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          {/* Top stripe */}
          <div
            className="hidden lg:flex items-center justify-between py-2"
            style={{
              borderBottom: dark ? '1px solid rgba(201,168,76,0.15)' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="overline-text" style={{ color: dark ? '#9a7a38' : 'rgba(250,247,242,0.8)' }}>
              Maison de Haute Couture — Miami · Port-au-Prince
            </span>
            <div className="flex items-center gap-6">
              <Link href="/profile" className="nav-link" style={{ color: dark ? '#3A3A3A' : 'rgba(250,247,242,0.8)' }}>
                Mon Compte
              </Link>
              <Link href="/cart" className="nav-link flex items-center gap-1.5" style={{ color: dark ? '#3A3A3A' : 'rgba(250,247,242,0.8)' }}>
                Panier
                {count > 0 && (
                  <span className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-medium" style={{ background: '#eb1e7a' }}>
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Main nav */}
          <div className="relative flex items-center h-24 lg:h-28 px-6 lg:px-0">
            <div className="hidden lg:flex items-center gap-10 flex-1" style={{ paddingLeft: 'clamp(1.5rem, 3vw, 4rem)' }}>
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className="nav-link group"
                  style={{ color: dark ? '#2A2A2A' : 'rgba(255,255,255,0.92)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              {isHome && !scrolled ? (
                <span
                  className="font-script text-white select-none transition-all duration-500"
                  style={{ fontSize: '2.8rem', textShadow: '0 2px 24px rgba(0,0,0,0.4)', lineHeight: 1, whiteSpace: 'nowrap' }}
                >
                  Sarje
                </span>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/logo_sarje.PNG"
                  alt="Sarje — Accueil"
                  className="transition-all duration-500"
                  style={{ height: scrolled ? '80px' : '100px', width: 'auto', display: 'block' }}
                />
              )}
            </Link>

            {/* Right icons */}
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-end" style={{ paddingRight: 'clamp(1.5rem, 3vw, 4rem)' }}>
              <Link href="/scanner" className="nav-link flex items-center gap-1.5" style={{ color: dark ? '#3A3A3A' : 'rgba(250,247,242,0.9)' }}>
                <ScanLine size={14} aria-hidden="true" />
                <span>Scanner</span>
              </Link>
              <Link href="/profile" className="p-1.5 transition-colors" aria-label="Mon compte" style={{ color: dark ? '#3A3A3A' : 'rgba(250,247,242,0.9)' }}>
                <User size={16} strokeWidth={1.5} aria-hidden="true" />
              </Link>
              <Link href="/cart" className="relative p-1.5 transition-colors" aria-label={`Panier${count > 0 ? `, ${count} article${count > 1 ? 's' : ''}` : ''}`} style={{ color: dark ? '#3A3A3A' : 'rgba(250,247,242,0.9)' }}>
                <ShoppingBag size={16} strokeWidth={1.5} aria-hidden="true" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-medium" style={{ background: '#eb1e7a' }}>
                    {count}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 transition-colors ml-auto"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              style={{ color: dark ? '#080808' : '#FAF7F2' }}
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.5} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col pt-24 px-8 pb-8 transition-all duration-500"
        style={{
          background: '#080808',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        <div className="flex flex-col gap-8 mt-8">
          <Link href="/" className="font-display text-4xl text-white font-light" onClick={() => setMenuOpen(false)}>
            Accueil
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className="font-display text-4xl text-white font-light border-b pb-4"
              style={{ borderColor: 'rgba(201,168,76,0.2)' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/profile" className="font-display text-4xl text-white font-light border-b pb-4" style={{ borderColor: 'rgba(201,168,76,0.2)' }} onClick={() => setMenuOpen(false)}>
            Mon Compte
          </Link>
          <Link href="/cart" className="font-display text-4xl text-white font-light" onClick={() => setMenuOpen(false)}>
            Panier {count > 0 && <span style={{ color: '#eb1e7a' }}>({count})</span>}
          </Link>
        </div>
        <div className="mt-auto">
          <p className="overline-text" style={{ color: 'rgba(201,168,76,0.6)' }}>Sarje — Haute Couture</p>
        </div>
      </div>
    </>
  );
};

export default Navbar;
