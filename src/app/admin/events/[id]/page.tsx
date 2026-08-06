export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAdminEvents } from '@/lib/admin/queries';
import EventEditor from '@/components/admin/EventEditor';

export default async function AdminEventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await getAdminEvents();
  const event = events.find((e) => e.id === id);
  if (!event) notFound();

  return (
    <div>
      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Modifier</p>
      <h1 className="heading-lg mb-10">{event.title}</h1>
      <EventEditor event={event} />
    </div>
  );
}
