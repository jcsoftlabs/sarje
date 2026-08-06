export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getAllProducts } from '@/lib/queries';
import ShopGrid from '@/components/shop/ShopGrid';

export const metadata: Metadata = {
  title: 'La Collection',
  description: 'La collection Printemps — Été 2026 de Sarje. Haute couture, prêt-à-porter et accessoires faits main.',
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div style={{ background: '#FAF7F2' }}>
      {/* Hero */}
      <section className="relative flex items-center justify-center text-center" style={{ height: '35vh', background: '#080808' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.4) 100%)' }} />
        <div className="relative z-10 px-4">
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>Printemps — Été 2026</p>
          <h1 className="heading-xl text-white">La Collection</h1>
        </div>
      </section>

      <ShopGrid products={products} />
    </div>
  );
}
