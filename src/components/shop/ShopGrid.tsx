'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { ProductWithImages } from '@/lib/queries';

export default function ShopGrid({ products }: { products: ProductWithImages[] }) {
  const categories = ['Tous', ...Array.from(new Set(products.map((p) => p.category)))];
  const [active, setActive] = useState('Tous');

  const filtered = active === 'Tous' ? products : products.filter((p) => p.category === active);

  return (
    <>
      {/* Filter bar */}
      <section className="py-6 px-6 lg:px-12 border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        <div className="max-w-screen-xl mx-auto flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="px-6 py-2 rounded-full whitespace-nowrap transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                background: active === cat ? '#eb1e7a' : 'transparent',
                color: active === cat ? '#fff' : '#3A3A3A',
                border: active === cat ? '1px solid #eb1e7a' : '1px solid rgba(58,58,58,0.2)',
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
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="product-card group"
              style={{ aspectRatio: '3/4', display: 'block' }}
            >
              {product.images[0] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="product-card-img"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
              )}
              <div className="product-card-overlay">
                <div>
                  <p className="overline-text mb-1" style={{ color: '#C9A84C' }}>{product.category}</p>
                  <p className="font-display text-white text-2xl font-light">{product.name}</p>
                  <p className="body-refined text-white mt-1" style={{ color: 'rgba(250,247,242,0.8)' }}>
                    {formatPrice(product.priceCents, product.currency)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="script-title mb-4">Aucune pièce</p>
            <p className="body-refined">Aucune pièce disponible dans cette catégorie pour le moment.</p>
          </div>
        )}
      </section>
    </>
  );
}
