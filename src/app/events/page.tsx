export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEvents } from '@/lib/queries';
import { formatPrice, formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Événements & Défilés',
  description: 'Fashion shows et défilés Sarje — Miami, Port-au-Prince, New York. Réservez vos billets.',
};

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div style={{ background: '#FAF7F2' }}>
      <section className="relative flex items-center justify-center text-center" style={{ minHeight: '38vh', background: '#080808' }}>
        <div className="relative z-10 px-6 py-16">
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>Invitations Exclusives</p>
          <h1 className="heading-xl text-white">Événements &amp; Défilés</h1>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 max-w-screen-xl mx-auto">
        {events.length === 0 && (
          <div className="text-center py-20">
            <p className="script-title mb-4">Bientôt</p>
            <p className="body-refined" style={{ color: '#888' }}>De nouveaux défilés seront annoncés prochainement.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            const minPrice = Math.min(...event.tiers.map((t) => t.priceCents));
            return (
              <Link key={event.id} href={`/events/${event.slug}`} className="event-poster group" style={{ height: 520, display: 'block', textDecoration: 'none' }}>
                <div className="relative w-full h-full">
                  {event.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={event.imageUrl} alt={event.title} className="event-poster-img absolute inset-0 w-full h-full" />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.92) 30%, rgba(8,8,8,0.15) 100%)' }} />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <p className="overline-text mb-3" style={{ color: '#C9A84C' }}>{formatDate(event.startsAt)}</p>
                    <h3 className="font-display text-white font-light mb-2" style={{ fontSize: '1.7rem', lineHeight: 1.1 }}>{event.title}</h3>
                    <p className="body-refined mb-5" style={{ color: 'rgba(250,247,242,0.6)', fontSize: '0.78rem' }}>{event.location}</p>
                    <span className="overline-text" style={{ color: '#eb1e7a', fontSize: '0.6rem' }}>
                      À partir de {formatPrice(minPrice, event.tiers[0]?.currency)} → Réserver
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
