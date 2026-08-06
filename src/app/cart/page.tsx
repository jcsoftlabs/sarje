'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Plus, Minus } from 'lucide-react';
import { useCart, cartCount, cartSubtotal } from '@/lib/store/cart';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { items, remove, setQuantity } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ minHeight: '50vh' }} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-40" style={{ background: '#FAF7F2' }}>
        <p className="script-title mb-6">Votre panier est vide</p>
        <p className="body-refined mb-10 text-gray-500">Découvrez nos créations exclusives.</p>
        <Link href="/shop" className="btn-gold">
          <span>Parcourir la Collection</span>
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const currency = items[0]?.currency ?? 'USD';

  return (
    <div style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-16">
        <div className="mb-16">
          <h1 className="heading-lg mb-2">Mon Panier</h1>
          <p className="overline-text" style={{ color: '#C9A84C' }}>{cartCount(items)} Article(s)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {items.map((item, index) => {
              const href = item.kind === 'ticket' ? `/events/${item.slug}` : `/shop/${item.slug}`;
              return (
                <div key={`${item.refId}-${index}`} className="flex gap-6 pb-8 border-b" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                  <Link href={href} className="block w-24 sm:w-32 flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                    {item.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </Link>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="overline-text mb-1" style={{ color: '#C9A84C' }}>
                          {item.kind === 'ticket' ? 'Billet' : 'Pièce'}
                        </p>
                        <Link href={href} className="font-display text-xl sm:text-2xl" style={{ color: '#080808', textDecoration: 'none' }}>
                          {item.name}
                        </Link>
                      </div>
                      <button onClick={() => remove(index)} className="p-2" style={{ color: '#888' }} aria-label={`Retirer ${item.name}`}>
                        <X size={18} strokeWidth={1.5} />
                      </button>
                    </div>

                    {item.subtitle && (
                      <p className="body-refined mb-auto" style={{ color: '#666', fontSize: '0.85rem' }}>{item.subtitle}</p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border" style={{ borderColor: 'rgba(58,58,58,0.2)' }}>
                        <button onClick={() => setQuantity(index, item.quantity - 1)} className="p-2" style={{ color: '#3A3A3A' }} aria-label="Diminuer">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                        <button onClick={() => setQuantity(index, item.quantity + 1)} className="p-2" style={{ color: '#3A3A3A' }} aria-label="Augmenter">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-display text-xl" style={{ color: '#C9A84C' }}>
                        {formatPrice(item.priceCents * item.quantity, item.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <div className="p-8 sticky top-28" style={{ background: '#fff', borderTop: '2px solid #C9A84C' }}>
              <h2 className="heading-md mb-8">Résumé</h2>
              <div className="flex justify-between mb-4">
                <span className="body-refined text-gray-600">Sous-total</span>
                <span className="font-body text-lg">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between mb-8 pb-8 border-b" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                <span className="body-refined text-gray-600">Livraison</span>
                <span className="body-refined text-gray-500 italic" style={{ fontSize: '0.75rem' }}>Calculée au paiement</span>
              </div>
              <div className="flex justify-between mb-10">
                <span className="font-display text-2xl">Total</span>
                <span className="font-display text-2xl" style={{ color: '#C9A84C' }}>{formatPrice(subtotal, currency)}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full justify-center">
                <span>Passer la Commande</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
