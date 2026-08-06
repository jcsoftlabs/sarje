'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createProduct, type ActionState } from '@/lib/admin/actions';

export default function NewProductForm() {
  const [state, action, pending] = useActionState(createProduct, {} as ActionState);
  const fieldStyle = { color: '#3A3A3A' } as const;

  return (
    <form action={action} style={{ background: '#fff', padding: '1.75rem', maxWidth: 520 }} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1">
        <span className="overline-text" style={{ color: '#999' }}>Nom du produit</span>
        <input name="name" className="input-luxury" style={fieldStyle} required />
      </label>
      <label className="flex flex-col gap-1">
        <span className="overline-text" style={{ color: '#999' }}>Catégorie</span>
        <input name="category" className="input-luxury" style={fieldStyle} placeholder="Robes, Prêt-à-Porter, Accessoires…" required />
      </label>
      <label className="flex flex-col gap-1">
        <span className="overline-text" style={{ color: '#999' }}>Prix (USD)</span>
        <input name="price" type="number" step="0.01" min="0" className="input-luxury" style={fieldStyle} required />
      </label>
      {state.error && <p className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.8rem' }}>{state.error}</p>}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary" style={pending ? { opacity: 0.6 } : undefined}>
          <span>{pending ? 'Création…' : 'Créer & continuer'}</span>
        </button>
        <Link href="/admin/products" className="nav-link" style={{ color: '#666' }}>Annuler</Link>
      </div>
      <p className="body-refined" style={{ fontSize: '0.75rem', color: '#aaa' }}>
        Le produit sera créé en <strong>brouillon</strong> — vous ajouterez ensuite les photos et variantes.
      </p>
    </form>
  );
}
