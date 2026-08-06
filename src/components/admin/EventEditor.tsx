'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updateEvent, type ActionState } from '@/lib/admin/actions';
import type { AdminEvent } from '@/lib/admin/queries';

const initial: ActionState = {};

// Format a Date to the value a datetime-local input expects.
function toLocalInput(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventEditor({ event }: { event: AdminEvent }) {
  const [state, action, pending] = useActionState(updateEvent, initial);
  const fieldStyle = { color: '#3A3A3A' } as const;

  return (
    <form action={action} className="flex flex-col gap-8" style={{ maxWidth: 640 }}>
      <input type="hidden" name="id" value={event.id} />

      <div>
        <label className="overline-text" style={{ color: '#999' }}>Titre</label>
        <input name="title" defaultValue={event.title} className="input-luxury" style={fieldStyle} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="overline-text" style={{ color: '#999' }}>Lieu</label>
          <input name="location" defaultValue={event.location} className="input-luxury" style={fieldStyle} />
        </div>
        <div>
          <label className="overline-text" style={{ color: '#999' }}>Date &amp; heure</label>
          <input name="startsAt" type="datetime-local" defaultValue={toLocalInput(event.startsAt)} className="input-luxury" style={fieldStyle} />
        </div>
        <div>
          <label className="overline-text" style={{ color: '#999' }}>Statut</label>
          <select name="status" defaultValue={event.status} className="input-luxury" style={fieldStyle}>
            <option value="active">Actif</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
        <label className="flex items-center gap-3 mt-6" style={{ cursor: 'pointer' }}>
          <input type="checkbox" name="isFeatured" defaultChecked={event.isFeatured} />
          <span className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A' }}>En vedette</span>
        </label>
      </div>

      {/* Tiers */}
      <div>
        <p className="overline-text" style={{ color: '#999', marginBottom: 12 }}>Tarifs</p>
        <div className="flex flex-col gap-4">
          {event.tiers.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-4" style={{ borderBottom: '1px solid #f0eee9', paddingBottom: 12 }}>
              <span className="body-refined" style={{ flex: 1, minWidth: 120, fontSize: '0.85rem', color: '#3A3A3A' }}>{t.name}</span>
              <label className="body-refined" style={{ fontSize: '0.7rem', color: '#999' }}>
                Prix $
                <input name={`price-${t.id}`} type="number" step="0.01" defaultValue={(t.priceCents / 100).toFixed(2)} style={{ width: 90, marginLeft: 6, border: '1px solid rgba(58,58,58,0.2)', padding: '6px 8px', color: '#3A3A3A' }} />
              </label>
              <label className="body-refined" style={{ fontSize: '0.7rem', color: '#999' }}>
                Capacité
                <input name={`capacity-${t.id}`} type="number" min={0} defaultValue={t.capacity} style={{ width: 80, marginLeft: 6, border: '1px solid rgba(58,58,58,0.2)', padding: '6px 8px', color: '#3A3A3A' }} />
              </label>
              <span className="overline-text" style={{ color: '#aaa', fontSize: '0.55rem' }}>{t.sold} vendus</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary" style={pending ? { opacity: 0.6 } : undefined}>
          <span>{pending ? 'Enregistrement…' : 'Enregistrer'}</span>
        </button>
        <Link href="/admin/events" className="nav-link" style={{ color: '#666' }}>Retour</Link>
        {state.ok && <span className="body-refined" style={{ color: '#7a9a6a', fontSize: '0.8rem' }}>✓ Enregistré</span>}
        {state.error && <span className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.8rem' }}>{state.error}</span>}
      </div>
    </form>
  );
}
