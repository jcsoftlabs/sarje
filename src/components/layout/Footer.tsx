'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

const footerLinks = [
  { to: '/shop', label: 'La Collection' },
  { to: '/events', label: 'Événements' },
  { to: '/profile', label: 'Mon Compte' },
  { to: '/cart', label: 'Panier' },
  { to: '/scanner', label: 'Scanner Billets' },
];

const collections = ['Robes de Soirée', 'Prêt-à-Porter', 'Accessoires', 'Couture sur Mesure', 'Printemps 2026'];

const linkStyle: CSSProperties = {
  color: 'rgba(250,247,242,0.5)',
  fontSize: '0.82rem',
  textDecoration: 'none',
  fontFamily: 'var(--font-body)',
  fontWeight: 300,
  lineHeight: 1.6,
  display: 'block',
  transition: 'color 0.3s',
};

const Footer = () => {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer style={{ background: '#080808' }} className="text-white">

      {/* ── Logo divider ─────────────────────────────────────── */}
      <div
        className="flex items-center justify-center py-10"
        style={{
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          paddingLeft: 'clamp(1.5rem, 5vw, 4rem)',
          paddingRight: 'clamp(1.5rem, 5vw, 4rem)',
        }}
      >
        <div className="flex items-center gap-6">
          <span style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5))', flexShrink: 0 }} />
          <img
            src="/logo_sarje.PNG"
            alt="Sarje"
            style={{
              height: 64,
              width: 'auto',
              filter: 'brightness(0) invert(1) sepia(1) hue-rotate(290deg) saturate(3)',
            }}
          />
          <span style={{ width: 60, height: 1, background: 'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)', flexShrink: 0 }} />
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'clamp(2rem, 4vw, 3rem)',
        }}
      >
        {/* Brand */}
        <div>
          <p className="overline-text mb-5" style={{ color: '#C9A84C' }}>La Maison</p>
          <p style={{ color: 'rgba(250,247,242,0.5)', fontSize: '0.82rem', lineHeight: 1.8, fontFamily: 'var(--font-body)', fontWeight: 300, marginBottom: '1.5rem' }}>
            Sarje est une maison de mode et haute couture internationale, fondée entre Miami et Port-au-Prince.
            Chaque pièce est confectionnée avec une attention extrême aux détails.
          </p>
          <div className="flex items-center gap-4">
            {[
              { Icon: InstagramIcon, label: 'Instagram' },
              { Icon: FacebookIcon, label: 'Facebook' },
              { Icon: YoutubeIcon, label: 'YouTube' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={`Sarje sur ${label}`}
                style={{ color: 'rgba(250,247,242,0.45)', transition: 'color 0.3s' }}
                onMouseOver={e => (e.currentTarget.style.color = '#C9A84C')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(250,247,242,0.45)')}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="overline-text mb-5" style={{ color: '#C9A84C' }}>Navigation</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {footerLinks.map(link => (
              <Link
                key={link.to}
                href={link.to}
                style={linkStyle}
                onMouseOver={e => (e.currentTarget.style.color = '#C9A84C')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(250,247,242,0.5)')}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Collections */}
        <div>
          <p className="overline-text mb-5" style={{ color: '#C9A84C' }}>Collections</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {collections.map(cat => (
              <Link
                key={cat}
                href="/shop"
                style={linkStyle}
                onMouseOver={e => (e.currentTarget.style.color = '#C9A84C')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(250,247,242,0.5)')}
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div>
          <p className="overline-text mb-5" style={{ color: '#C9A84C' }}>Contact</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Mail size={14} strokeWidth={1.5} style={{ color: '#eb1e7a', flexShrink: 0, marginTop: 3 }} />
              <p style={{ color: 'rgba(250,247,242,0.5)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', fontWeight: 300 }}>contact@sarje.com</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Phone size={14} strokeWidth={1.5} style={{ color: '#eb1e7a', flexShrink: 0, marginTop: 3 }} />
              <p style={{ color: 'rgba(250,247,242,0.5)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.7 }}>
                +1 (305) 000-0000<br />+509 0000-0000
              </p>
            </div>

            {/* Newsletter */}
            <div style={{ marginTop: '0.5rem' }}>
              <p className="overline-text mb-3" style={{ color: 'rgba(201,168,76,0.6)', fontSize: '0.6rem' }}>Newsletter</p>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,168,76,0.3)', paddingBottom: '0.25rem' }}>
                <input
                  type="email"
                  placeholder="Votre email"
                  aria-label="Votre adresse email pour la newsletter"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    letterSpacing: '0.05em',
                    minWidth: 0,
                  }}
                />
                <button type="submit" aria-label="S'inscrire à la newsletter" style={{ color: '#C9A84C', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem', flexShrink: 0 }}>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '1.5rem clamp(1.5rem, 5vw, 4rem)',
          borderTop: '1px solid rgba(201,168,76,0.12)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <p style={{ color: 'rgba(250,247,242,0.3)', fontSize: '0.65rem', letterSpacing: '0.15em', fontFamily: 'var(--font-body)' }}>
          © 2026 SARJE HAUTE COUTURE — TOUS DROITS RÉSERVÉS
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {['Confidentialité', 'CGV', 'Mentions légales'].map(label => (
            <a
              key={label}
              href="#"
              style={{ color: 'rgba(250,247,242,0.3)', fontSize: '0.65rem', letterSpacing: '0.12em', textDecoration: 'none', fontFamily: 'var(--font-body)' }}
              onMouseOver={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(250,247,242,0.3)')}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

    </footer>
  );
};

export default Footer;
