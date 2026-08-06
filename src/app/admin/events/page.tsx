export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminEvents } from '@/lib/admin/queries';
import { formatDate } from '@/lib/format';

export default async function AdminEventsPage() {
  const events = await getAdminEvents();

  return (
    <div>
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Billetterie</p>
          <h1 className="heading-lg">Événements</h1>
        </div>
        <p className="body-refined" style={{ color: '#999', fontSize: '0.8rem' }}>{events.length} événements</p>
      </div>

      <div className="flex flex-col gap-4">
        {events.map((e) => {
          const sold = e.tiers.reduce((n, t) => n + t.sold, 0);
          const capacity = e.tiers.reduce((n, t) => n + t.capacity, 0);
          return (
            <Link key={e.id} href={`/admin/events/${e.id}`} className="flex flex-wrap items-center justify-between gap-4 p-6" style={{ background: '#fff', borderLeft: '3px solid #C9A84C' }}>
              <div>
                <p className="font-display" style={{ fontSize: '1.3rem', color: '#080808' }}>{e.title}</p>
                <p className="body-refined" style={{ fontSize: '0.78rem', color: '#888' }}>{formatDate(e.startsAt)} — {e.location}</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Billets vendus</p>
                  <p className="body-refined" style={{ color: '#3A3A3A' }}>{sold} / {capacity}</p>
                </div>
                <span className="overline-text" style={{ color: '#eb1e7a' }}>Modifier →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
