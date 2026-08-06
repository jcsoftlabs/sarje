'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/store/cart';
import type { ProductDetail } from '@/lib/queries';

export default function ProductPurchase({ product }: { product: ProductDetail }) {
  const add = useCart((s) => s.add);

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[],
    [product.variants],
  );
  const colors = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[],
    [product.variants],
  );

  const [size, setSize] = useState<string>(sizes.length === 1 ? sizes[0] : '');
  const [color, setColor] = useState<string>(colors.length === 1 ? colors[0] : '');
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (v) => (!sizes.length || v.size === size) && (!colors.length || v.color === color),
      ),
    [product.variants, size, color, sizes.length, colors.length],
  );

  const priceCents = selectedVariant?.priceCents ?? product.priceCents;
  const outOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;
  const image = product.images[0]?.url ?? '';

  const handleAdd = () => {
    if (sizes.length && !size) return toast.error('Veuillez sélectionner une taille.');
    if (colors.length && !color) return toast.error('Veuillez sélectionner une couleur.');
    if (sizes.length + colors.length > 0 && !selectedVariant)
      return toast.error('Cette combinaison est indisponible.');
    if (outOfStock) return toast.error('Cette pièce est en rupture de stock.');

    add({
      kind: 'product',
      refId: selectedVariant?.id ?? product.id,
      slug: product.slug,
      name: product.name,
      subtitle: [size, color].filter(Boolean).join(' · ') || undefined,
      image,
      priceCents,
      currency: product.currency,
      size: size || undefined,
      color: color || undefined,
      quantity,
    });
    toast.success("Ajouté à votre panier d'exception.");
  };

  const swatch = (
    label: string,
    values: string[],
    value: string,
    setValue: (v: string) => void,
  ) =>
    values.length > 0 && (
      <div className="mb-8">
        <p className="overline-text mb-4" style={{ color: '#3A3A3A' }}>{label}</p>
        <div className="flex flex-wrap gap-3">
          {values.map((v) => (
            <button
              key={v}
              onClick={() => setValue(v)}
              className="px-4 py-2 border transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                borderColor: value === v ? '#eb1e7a' : 'rgba(58,58,58,0.2)',
                color: value === v ? '#eb1e7a' : '#3A3A3A',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <>
      <p className="font-display mb-10" style={{ color: '#C9A84C', fontSize: '2.5rem' }}>
        {formatPrice(priceCents, product.currency)}
      </p>
      <div className="line-gold mb-10" style={{ width: '100px' }} />

      {swatch('Couleur', colors, color, setColor)}
      {swatch('Taille', sizes, size, setSize)}

      {selectedVariant && (
        <p className="body-refined mb-6" style={{ fontSize: '0.78rem', color: outOfStock ? '#eb1e7a' : '#7a9a6a' }}>
          {outOfStock ? 'Rupture de stock' : `En stock — ${selectedVariant.stock} disponible(s)`}
        </p>
      )}

      <div className="flex gap-4 mb-8">
        <div className="flex items-center border" style={{ borderColor: 'rgba(58,58,58,0.2)' }}>
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-3" style={{ color: '#3A3A3A' }} aria-label="Diminuer la quantité">−</button>
          <span className="w-8 text-center font-body" style={{ color: '#3A3A3A' }}>{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="px-4 py-3" style={{ color: '#3A3A3A' }} aria-label="Augmenter la quantité">+</button>
        </div>
        <button onClick={handleAdd} disabled={outOfStock} className="btn-primary flex-1 justify-center" style={outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
          <span>{outOfStock ? 'Indisponible' : 'Ajouter au Panier'}</span>
        </button>
      </div>
    </>
  );
}
