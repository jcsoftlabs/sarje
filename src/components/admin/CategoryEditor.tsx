'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { updateCollection, deleteCollection, type ActionState } from '@/lib/admin/actions';
import ImageUploader from './ImageUploader';
import type { AdminCollection } from '@/lib/admin/queries';

export default function CategoryEditor({ category }: { category: AdminCollection }) {
  const [state, action, pending] = useActionState(updateCollection, {} as ActionState);
  const [hero, setHero] = useState<{ url: string; publicId: string }>({
    url: category.heroImageUrl ?? '',
    publicId: category.heroImagePublicId ?? '',
  });
  const fieldStyle = { color: '#3A3A3A' } as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Photo + preview */}
      <div style={{ background: '#fff', padding: '1.75rem' }}>
        <p className="overline-text mb-5" style={{ color: '#999' }}>Photo de la catégorie</p>
        <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f4f1ec', overflow: 'hidden', marginBottom: 16 }}>
          {hero.url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,0.7), transparent 60%)' }} />
              <p className="font-display" style={{ position: 'absolute', bottom: 16, left: 20, color: '#fff', fontSize: '1.6rem' }}>{category.name}</p>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="body-refined" style={{ color: '#bbb', fontSize: '0.8rem' }}>Aucune photo — aperçu ici</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ImageUploader folder="sarje/collections" onUploaded={(url, publicId) => setHero({ url, publicId })} label={hero.url ? 'Changer la photo' : 'Ajouter une photo'} />
          {hero.url && (
            <button type="button" onClick={() => setHero({ url: '', publicId: '' })} className="nav-link" style={{ color: '#c88' }}>Retirer</button>
          )}
        </div>
      </div>

      {/* Fields */}
      <form action={action} style={{ background: '#fff', padding: '1.75rem' }} className="flex flex-col gap-6">
        <input type="hidden" name="id" value={category.id} />
        <input type="hidden" name="heroImageUrl" value={hero.url} />
        <input type="hidden" name="heroImagePublicId" value={hero.publicId} />

        <label className="flex flex-col gap-1">
          <span className="overline-text" style={{ color: '#999' }}>Nom</span>
          <input name="name" defaultValue={category.name} className="input-luxury" style={fieldStyle} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="overline-text" style={{ color: '#999' }}>Description</span>
          <textarea name="description" defaultValue={category.description ?? ''} rows={3} className="input-luxury" style={{ ...fieldStyle, resize: 'vertical' }} />
        </label>
        <p className="body-refined" style={{ fontSize: '0.72rem', color: '#aaa' }}>Slug : {category.slug}</p>
        <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
          <input type="checkbox" name="isFeatured" defaultChecked={category.isFeatured} />
          <span className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A' }}>Mettre en avant</span>
        </label>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={pending} className="btn-primary" style={pending ? { opacity: 0.6 } : undefined}>
            <span>{pending ? 'Enregistrement…' : 'Enregistrer'}</span>
          </button>
          <Link href="/admin/categories" className="nav-link" style={{ color: '#666' }}>Retour</Link>
          {state.ok && <span className="body-refined" style={{ color: '#7a9a6a', fontSize: '0.8rem' }}>✓ Enregistré</span>}
          {state.error && <span className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.8rem' }}>{state.error}</span>}
        </div>
      </form>

      {/* Delete */}
      <form action={deleteCollection}>
        <input type="hidden" name="id" value={category.id} />
        <button type="submit" className="nav-link" style={{ color: '#c88' }}>Supprimer cette catégorie</button>
      </form>
    </div>
  );
}
