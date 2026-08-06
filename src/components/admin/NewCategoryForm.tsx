'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createCollection, type ActionState } from '@/lib/admin/actions';

export default function NewCategoryForm() {
  const [state, action, pending] = useActionState(createCollection, {} as ActionState);
  return (
    <form action={action} style={{ background: '#fff', padding: '1.75rem', maxWidth: 480 }} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1">
        <span className="overline-text" style={{ color: '#999' }}>Nom de la catégorie</span>
        <input name="name" className="input-luxury" style={{ color: '#3A3A3A' }} placeholder="Robes de Soirée…" required />
      </label>
      {state.error && <p className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.8rem' }}>{state.error}</p>}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary" style={pending ? { opacity: 0.6 } : undefined}>
          <span>{pending ? 'Création…' : 'Créer & continuer'}</span>
        </button>
        <Link href="/admin/categories" className="nav-link" style={{ color: '#666' }}>Annuler</Link>
      </div>
    </form>
  );
}
