export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/queries';
import { formatDate } from '@/lib/format';
import TicketTiers from '@/components/events/TicketTiers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Événement introuvable' };
  return {
    title: event.title,
    description: event.description ?? undefined,
    openGraph: { images: event.imageUrl ? [event.imageUrl] : [] },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <div style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      {/* Hero */}
      <section className="relative" style={{ height: '52vh', minHeight: 380 }}>
        {event.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.35) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-12 pb-14 max-w-screen-xl mx-auto w-full">
          <p className="overline-text mb-3" style={{ color: '#C9A84C' }}>{formatDate(event.startsAt)}</p>
          <h1 className="heading-xl text-white" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>{event.title}</h1>
          <p className="body-refined mt-3" style={{ color: 'rgba(250,247,242,0.75)' }}>
            {event.venue ? `${event.venue} — ` : ''}{event.location}
          </p>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>À Propos</p>
          <div className="line-gold mb-8" style={{ width: 80 }} />
          {event.description && (
            <p className="body-refined" style={{ color: '#555', fontSize: '0.95rem' }}>{event.description}</p>
          )}
        </div>

        <div>
          <p className="overline-text mb-6" style={{ color: '#C9A84C' }}>Billetterie</p>
          <TicketTiers event={event} />
        </div>
      </div>
    </div>
  );
}
