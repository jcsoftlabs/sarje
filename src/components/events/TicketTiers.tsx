'use client';

import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/store/cart';
import type { EventWithTiers } from '@/lib/queries';

export default function TicketTiers({ event }: { event: EventWithTiers }) {
  const add = useCart((s) => s.add);

  const reserve = (tier: EventWithTiers['tiers'][number]) => {
    const remaining = tier.capacity - tier.sold;
    if (remaining <= 0) return toast.error('Ce tarif est complet.');
    add({
      kind: 'ticket',
      refId: tier.id,
      slug: event.slug,
      name: event.title,
      subtitle: tier.name,
      image: event.imageUrl ?? '',
      priceCents: tier.priceCents,
      currency: tier.currency,
      quantity: 1,
    });
    toast.success(`Billet ${tier.name} ajouté au panier.`);
  };

  return (
    <div className="flex flex-col gap-4">
      {event.tiers.map((tier) => {
        const remaining = tier.capacity - tier.sold;
        const soldOut = remaining <= 0;
        return (
          <div
            key={tier.id}
            className="ticket-card flex items-center justify-between gap-4 p-6"
          >
            <div>
              <p className="font-display" style={{ fontSize: '1.3rem', color: '#080808' }}>{tier.name}</p>
              {tier.description && (
                <p className="body-refined" style={{ fontSize: '0.8rem', color: '#666' }}>{tier.description}</p>
              )}
              <p className="overline-text mt-1" style={{ color: soldOut ? '#eb1e7a' : 'rgba(201,168,76,0.9)' }}>
                {soldOut ? 'Complet' : `${remaining} places restantes`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-display" style={{ fontSize: '1.5rem', color: '#C9A84C' }}>
                {formatPrice(tier.priceCents, tier.currency)}
              </p>
              <button
                onClick={() => reserve(tier)}
                disabled={soldOut}
                className="btn-dark"
                style={soldOut ? { opacity: 0.4, cursor: 'not-allowed', padding: '0.6rem 1.6rem' } : { padding: '0.6rem 1.6rem' }}
              >
                <span>{soldOut ? 'Complet' : 'Réserver'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
