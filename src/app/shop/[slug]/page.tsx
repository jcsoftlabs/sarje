export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries';
import ProductPurchase from '@/components/shop/ProductPurchase';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Pièce introuvable' };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: { images: product.images[0]?.url ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.slug, 3);
  const image = product.images[0]?.url;

  return (
    <div style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pt-10">
        {/* Image */}
        <div className="relative">
          <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
            {image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={image} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center py-10 lg:py-20 lg:sticky lg:top-28 lg:h-fit">
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>{product.category}</p>
          <h1 className="heading-lg mb-6">{product.name}</h1>
          {product.description && (
            <p className="body-refined mb-8" style={{ color: '#555', fontSize: '0.95rem' }}>{product.description}</p>
          )}

          <ProductPurchase product={product} />

          <Link href="/events" className="btn-gold justify-center w-full">
            <span>Couture sur Mesure — Prendre Rendez-vous</span>
          </Link>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 mt-32">
          <div className="divider-gold mb-12">
            <h2 className="heading-md">Pièces Similaires</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link key={p.id} href={`/shop/${p.slug}`} className="product-card group" style={{ aspectRatio: '3/4', display: 'block' }}>
                {p.images[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={p.images[0].url} alt={p.name} className="product-card-img absolute inset-0 w-full h-full" />
                )}
                <div className="product-card-overlay">
                  <div>
                    <p className="overline-text mb-1" style={{ color: '#C9A84C' }}>{p.category}</p>
                    <p className="font-display text-white text-xl font-light">{p.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
