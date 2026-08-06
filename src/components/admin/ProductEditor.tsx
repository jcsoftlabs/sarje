'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updateProduct, type ActionState } from '@/lib/admin/actions';
import type { AdminProduct } from '@/lib/admin/queries';

const initial: ActionState = {};
const labelCls = 'overline-text';
const fieldStyle = { color: '#3A3A3A' } as const;

export default function ProductEditor({ product }: { product: AdminProduct }) {
  const [state, action, pending] = useActionState(updateProduct, initial);

  return (
    <form action={action} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <input type="hidden" name="id" value={product.id} />

      {/* Left: image preview */}
      <div>
        {product.images[0] && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={product.images[0].url} alt={product.name} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
        )}
        <p className="body-refined mt-3" style={{ fontSize: '0.72rem', color: '#aaa' }}>
          Slug : {product.slug}
        </p>
      </div>

      {/* Right: fields */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelCls} style={{ color: '#999' }}>Nom</label>
            <input name="name" defaultValue={product.name} className="input-luxury" style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#999' }}>Catégorie</label>
            <input name="category" defaultValue={product.category} className="input-luxury" style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#999' }}>Prix (USD)</label>
            <input name="price" type="number" step="0.01" defaultValue={(product.priceCents / 100).toFixed(2)} className="input-luxury" style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#999' }}>Statut</label>
            <select name="status" defaultValue={product.status} className="input-luxury" style={fieldStyle}>
              <option value="active">Actif</option>
              <option value="draft">Brouillon</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls} style={{ color: '#999' }}>Description</label>
          <textarea name="description" defaultValue={product.description ?? ''} rows={3} className="input-luxury" style={{ ...fieldStyle, resize: 'vertical' }} />
        </div>

        <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
          <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} />
          <span className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A' }}>Mettre en vedette (page d&apos;accueil)</span>
        </label>

        {/* Variant stock */}
        <div>
          <p className={labelCls} style={{ color: '#999', marginBottom: 12 }}>Stock par variante</p>
          <div className="flex flex-col gap-3">
            {product.variants.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-4" style={{ borderBottom: '1px solid #f0eee9', paddingBottom: 10 }}>
                <span className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A' }}>{v.name}</span>
                <input
                  name={`stock-${v.id}`}
                  type="number"
                  min={0}
                  defaultValue={v.stock}
                  style={{ width: 90, textAlign: 'center', border: '1px solid rgba(58,58,58,0.2)', padding: '6px 8px', fontFamily: 'var(--font-body)', color: '#3A3A3A' }}
                />
              </div>
            ))}
            {product.variants.length === 0 && (
              <p className="body-refined" style={{ fontSize: '0.8rem', color: '#aaa' }}>Aucune variante.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={pending} className="btn-primary" style={pending ? { opacity: 0.6 } : undefined}>
            <span>{pending ? 'Enregistrement…' : 'Enregistrer'}</span>
          </button>
          <Link href="/admin/products" className="nav-link" style={{ color: '#666' }}>Retour</Link>
          {state.ok && <span className="body-refined" style={{ color: '#7a9a6a', fontSize: '0.8rem' }}>✓ Enregistré</span>}
          {state.error && <span className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.8rem' }}>{state.error}</span>}
        </div>
      </div>
    </form>
  );
}
