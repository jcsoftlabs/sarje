import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { mockProducts, mockEvents } from '../data/mockData';

// Reveal on scroll hook
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => observer.observe(el));
    // Safety net: if the observer or animation clock stalls, never leave content hidden.
    const fallback = window.setTimeout(() => {
      els.forEach(el => el.classList.add('visible'));
    }, 2500);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);
}

const Home = () => {
  useReveal();

  const featuredProducts = mockProducts.slice(0, 6);
  const featuredEvents = mockEvents.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative" style={{ height: '100vh', minHeight: 640 }}>
        <div className="absolute inset-0">
          <img
            src={mockProducts[0].image}
            alt="Sarje — Haute Couture"
            className="w-full h-full object-cover"
          />
          {/* Strong gradient overlays for text legibility */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.55) 60%, rgba(8,8,8,0.3) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.75) 0%, transparent 55%)' }} />
          {/* Fuchsia glow accent matching logo */}
          <div className="absolute bottom-0 left-0" style={{ width: '40vw', height: '40vh', background: 'radial-gradient(ellipse at bottom left, rgba(235,30,122,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-start justify-end"
             style={{ padding: '0 5vw 10vh', paddingTop: 0 }}>
          <div className="reveal">
            <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>Printemps — Été 2026</p>
          </div>
          <div className="reveal reveal-delay-1">
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(2.4rem, 6vw, 5.5rem)',
              lineHeight: 1.05,
              color: '#fff',
              marginBottom: '0.1em',
              letterSpacing: '-0.01em',
            }}>
              L'Art de la
            </h1>
            <div style={{
              fontFamily: 'var(--font-script)',
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              color: '#eb1e7a',
              lineHeight: 1.0,
              marginBottom: '1.5rem',
            }}>
              Couture
            </div>
          </div>
          <div className="reveal reveal-delay-2" style={{ maxWidth: 'min(520px, 90vw)' }}>
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.92rem', fontWeight: 400, lineHeight: 1.8, marginBottom: '2.5rem', fontFamily: 'var(--font-body)' }}>
              Chaque pièce Sarje est une œuvre façonnée à la main — de Miami à Port-au-Prince —
              alliant héritage caribéen et exigence du luxe international.
            </p>
          </div>
          <div className="reveal reveal-delay-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link to="/shop" className="btn-primary">
              <span>Découvrir la Collection</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/events" className="btn-outline">
              <span>Voir les Événements</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator — pinned to the right edge so it never collides with
            the left-aligned hero CTAs; hidden on short/narrow viewports. */}
        <div className="hidden md:flex absolute bottom-8 right-8 flex-col items-center gap-2 pointer-events-none">
          <span className="overline-text" style={{ color: 'rgba(250,247,242,0.4)', fontSize: '0.55rem' }}>Défiler</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(201,168,76,0.6), transparent)' }} />
        </div>
      </section>

      {/* ── ABOUT STRIP ──────────────────────────────────────── */}
      <section style={{ background: '#080808', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 lg:gap-6 justify-items-center">
          {[
            { num: '2019', label: 'Année de fondation' },
            { num: '200+', label: 'Créations exclusives' },
            { num: '2', label: 'Maisons — US & Haïti' },
            { num: '100%', label: 'Fait Main' },
          ].map((item, i) => (
            <div key={i} className="reveal text-center flex flex-col items-center justify-center w-full" style={{ transitionDelay: `${i * 0.1}s` }}>
              <p className="font-display text-white" style={{ fontSize: '2.5rem', fontWeight: 300 }}>{item.num}</p>
              <p className="overline-text mt-1 text-center max-w-full" style={{ color: 'rgba(201,168,76,0.6)', wordWrap: 'break-word' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COLLECTION ───────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 max-w-screen-xl mx-auto">
        <div className="reveal text-center mb-16">
          <p className="overline-text mb-4">Nouvelles Pièces</p>
          <div className="divider-gold">
            <h2 className="heading-lg">La Collection Printemps</h2>
          </div>
          <p className="body-refined mt-4 mx-auto" style={{ maxWidth: 500, color: '#888', fontSize: '0.82rem' }}>
            Des silhouettes audacieuses, des tissus d'exception. Chaque pièce raconte une histoire.
          </p>
        </div>

        {/* Editorial grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {featuredProducts.map((product, i) => {
            const isFeatured = i === 0;
            return (
              <Link
                key={product.id}
                to={`/shop/${product.id}`}
                className={`product-card group ${isFeatured ? 'row-span-2 col-span-1' : ''}`}
                style={{ aspectRatio: isFeatured ? '3/4' : '4/5' }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-card-img"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
                <div className="product-card-overlay">
                  <div>
                    <p className="overline-text mb-1" style={{ color: '#C9A84C' }}>{product.category}</p>
                    <p className="font-display text-white text-xl font-light">{product.name}</p>
                    <p className="body-refined text-white mt-1" style={{ color: 'rgba(250,247,242,0.7)', fontSize: '0.8rem' }}>
                      À partir de <span style={{ color: '#C9A84C' }}>${product.price.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="reveal text-center mt-14">
          <Link to="/shop" className="btn-gold">
            <span>Voir Toute la Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section className="overflow-hidden" style={{ background: '#080808' }}>
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden" style={{ minHeight: 500 }}>
            <img
              src={mockProducts[3].image}
              alt="L'atelier Sarje"
              className="w-full h-full object-cover"
              style={{ minHeight: 500 }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 70%, #080808)' }} />
          </div>
          {/* Text */}
          <div className="flex flex-col justify-center px-8 lg:px-16 py-16">
            <div className="reveal">
              <p className="overline-text mb-6" style={{ color: '#C9A84C' }}>Notre Histoire</p>
              <h2 className="heading-lg text-white mb-4">Une Maison fondée sur<br />deux cultures.</h2>
              <div className="line-gold mb-6" />
              <p className="body-refined mb-6" style={{ color: 'rgba(250,247,242,0.55)', fontSize: '0.85rem' }}>
                Sarje est née du désir de tisser ensemble l'héritage créatif d'Haïti et le savoir-faire du luxe 
                international. Fondée à Miami avec un atelier à Port-au-Prince, la maison crée des vêtements 
                qui transcendent les frontières.
              </p>
              <p className="script-title mb-8" style={{ fontSize: '1.8rem', color: '#eb1e7a' }}>
                "Chaque fil, une histoire."
              </p>
              <Link to="/shop" className="btn-gold">
                <span>Découvrir la Maison</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ───────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 max-w-screen-xl mx-auto">
        <div className="reveal text-center mb-16">
          <p className="overline-text mb-4">Fashion Shows & Défilés</p>
          <div className="divider-gold">
            <h2 className="heading-lg">Prochains Événements</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="event-poster group"
              style={{ height: 480, display: 'block', textDecoration: 'none' }}
            >
              <div className="relative w-full h-full">
                <img src={event.image} alt={event.title} className="event-poster-img absolute inset-0 w-full h-full" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.92) 30%, rgba(8,8,8,0.2) 100%)' }} />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <p className="overline-text mb-3" style={{ color: '#C9A84C' }}>
                    {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="font-display text-white font-light mb-2" style={{ fontSize: '1.6rem', lineHeight: 1.1 }}>{event.title}</h3>
                  <p className="body-refined mb-5" style={{ color: 'rgba(250,247,242,0.6)', fontSize: '0.78rem' }}>{event.location}</p>
                  <span className="overline-text" style={{ color: '#eb1e7a', fontSize: '0.6rem' }}>
                    À partir de ${Math.min(...event.ticketTiers.map(t => t.price))} → Réserver
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-32" style={{ background: '#eb1e7a' }}>
        {/* Logo as watermark — evokes brand identity */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img src="/logo_sarje.PNG" alt="" aria-hidden="true"
               style={{ width: '55vw', opacity: 0.07, filter: 'brightness(0) invert(1)', userSelect: 'none' }} />
        </div>
        {/* Subtle petal shape top right */}
        <div className="absolute top-0 right-0" style={{ width: '30vw', height: '30vw', background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="relative reveal text-center px-6">
          <p className="overline-text mb-6" style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.4em' }}>Couture sur Mesure</p>
          <h2 className="heading-xl text-white mb-6" style={{ maxWidth: '14ch', margin: '0 auto 1.5rem' }}>
            Votre vision,<br />notre art.
          </h2>
          <p className="body-refined mb-10 mx-auto" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 400, fontSize: '0.9rem' }}>
            Chaque cliente mérite une pièce unique. Prenez rendez-vous avec nos ateliers à Miami ou Port-au-Prince.
          </p>
          <Link to="/shop" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.9)', color: '#fff', fontWeight: 500 }}>
            <span>Prendre Rendez-vous</span>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
