import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockProducts } from '../data/mockData';

// Re-runs whenever `key` changes so newly-rendered cards (e.g. after a filter
// switch) get observed and revealed instead of staying invisible.
function useReveal(key?: unknown) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.visible)'));
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
  }, [key]);
}

const categories = ['Tous', 'Robes', 'Prêt-à-Porter', 'Accessoires', 'Couture sur Mesure'];

const Shop = () => {
  const [activeFilter, setActiveFilter] = useState('Tous');
  useReveal(activeFilter);

  const filteredProducts = activeFilter === 'Tous'
    ? mockProducts
    : mockProducts.filter(p => p.category === activeFilter);

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
      {/* Hero Banner */}
      <section className="relative flex items-center justify-center text-center" style={{ height: '35vh', background: '#080808' }}>
        <div className="absolute inset-0">
           <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.4) 100%)' }} />
        </div>
        <div className="relative z-10 px-4 reveal">
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>Printemps — Été 2026</p>
          <h1 className="heading-xl text-white">La Collection</h1>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-6 px-6 lg:px-12 border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        <div className="max-w-screen-xl mx-auto flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="px-6 py-2 rounded-full whitespace-nowrap transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                background: activeFilter === cat ? '#eb1e7a' : 'transparent',
                color: activeFilter === cat ? '#fff' : '#3A3A3A',
                border: activeFilter === cat ? '1px solid #eb1e7a' : '1px solid rgba(58,58,58,0.2)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 px-6 lg:px-12 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map((product, i) => (
            <Link
              key={product.id}
              to={`/shop/${product.id}`}
              className={`product-card group reveal reveal-delay-${(i % 4) + 1}`}
              style={{ aspectRatio: '3/4', display: 'block' }}
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
                  <p className="font-display text-white text-2xl font-light">{product.name}</p>
                  <p className="body-refined text-white mt-1" style={{ color: 'rgba(250,247,242,0.8)' }}>
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 reveal">
            <p className="script-title mb-4">Aucune pièce</p>
            <p className="body-refined">Aucune pièce disponible dans cette catégorie pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;
