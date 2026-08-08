'use client';

import { useActionState, useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Trash2, Plus, GripVertical } from 'lucide-react';
import {
  updateProduct,
  addProductImage,
  deleteProductImage,
  addVariant,
  deleteVariant,
  reorderProductImages,
  deleteProduct,
  type ActionState,
} from '@/lib/admin/actions';
import ImageUploader from './ImageUploader';
import type { AdminProduct } from '@/lib/admin/queries';

const initial: ActionState = {};
const fieldStyle = { color: '#3A3A3A' } as const;

export default function ProductEditor({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProduct, initial);
  const [busy, startTransition] = useTransition();
  const [nv, setNv] = useState({ size: '', color: '', sku: '', stock: '0', price: '' });

  // Local copy of images so drag-and-drop reordering feels instant.
  const [imgs, setImgs] = useState(product.images);
  useEffect(() => setImgs(product.images), [product.images]);
  const dragFrom = useRef<number | null>(null);

  const refresh = () => router.refresh();

  const onDrop = (to: number) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from === null || from === to) return;
    const next = [...imgs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImgs(next);
    startTransition(async () => {
      await reorderProductImages(product.id, next.map((x) => x.id));
      refresh();
    });
  };

  const handleUploaded = (url: string, publicId: string) =>
    startTransition(async () => {
      await addProductImage(product.id, url, publicId);
      refresh();
    });

  const removeImage = (imageId: string) =>
    startTransition(async () => {
      await deleteProductImage(imageId, product.id);
      refresh();
    });

  const removeVariant = (variantId: string) =>
    startTransition(async () => {
      await deleteVariant(variantId, product.id);
      refresh();
    });

  const createVariant = () =>
    startTransition(async () => {
      await addVariant(product.id, {
        size: nv.size.trim(),
        color: nv.color.trim(),
        sku: nv.sku.trim(),
        stock: parseInt(nv.stock, 10) || 0,
        price: nv.price ? parseFloat(nv.price) : undefined,
      });
      setNv({ size: '', color: '', sku: '', stock: '0', price: '' });
      refresh();
    });

  const cellInput = { border: '1px solid rgba(58,58,58,0.2)', padding: '7px 9px', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#3A3A3A' } as const;

  return (
    <div className="flex flex-col gap-12">
      {/* ── Photos ── */}
      <section style={{ background: '#fff', padding: '1.75rem' }}>
        <div className="flex items-center justify-between mb-5">
          <p className="overline-text" style={{ color: '#999' }}>Photos</p>
          {imgs.length > 1 && <p className="body-refined" style={{ color: '#bbb', fontSize: '0.7rem' }}>Glissez pour réordonner · la 1ʳᵉ est la principale</p>}
        </div>
        <div className="flex flex-wrap gap-4 mb-5">
          {imgs.map((img, i) => (
            <div
              key={img.id}
              className="relative"
              style={{ width: 120 }}
              draggable
              onDragStart={() => (dragFrom.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" style={{ width: 120, height: 150, objectFit: 'cover', display: 'block', cursor: 'grab' }} />
              {i === 0 && (
                <span className="overline-text" style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(8,8,8,0.75)', color: '#fff', padding: '2px 6px', fontSize: '0.5rem' }}>Principale</span>
              )}
              <span style={{ position: 'absolute', bottom: 6, right: 6, color: '#fff', opacity: 0.7 }}><GripVertical size={14} /></span>
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                disabled={busy}
                aria-label="Supprimer la photo"
                className="absolute flex items-center justify-center"
                style={{ top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#080808', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {imgs.length === 0 && (
            <p className="body-refined" style={{ color: '#bbb', fontSize: '0.8rem' }}>Aucune photo.</p>
          )}
        </div>
        <ImageUploader folder="sarje/products" onUploaded={handleUploaded} label="Ajouter une photo" />
      </section>

      {/* ── Détails ── */}
      <form action={action} style={{ background: '#fff', padding: '1.75rem' }} className="flex flex-col gap-8">
        <input type="hidden" name="id" value={product.id} />
        <p className="overline-text" style={{ color: '#999' }}>Détails</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#999' }}>Nom</span>
            <input name="name" defaultValue={product.name} className="input-luxury" style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#999' }}>Catégorie</span>
            <input name="category" defaultValue={product.category} className="input-luxury" style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#999' }}>Prix (USD)</span>
            <input name="price" type="number" step="0.01" defaultValue={(product.priceCents / 100).toFixed(2)} className="input-luxury" style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#999' }}>Statut</span>
            <select name="status" defaultValue={product.status} className="input-luxury" style={fieldStyle}>
              <option value="active">Actif</option>
              <option value="draft">Brouillon</option>
              <option value="archived">Archivé</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="overline-text" style={{ color: '#999' }}>Description</span>
          <textarea name="description" defaultValue={product.description ?? ''} rows={3} className="input-luxury" style={{ ...fieldStyle, resize: 'vertical' }} />
        </label>

        <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
          <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} />
          <span className="body-refined" style={{ fontSize: '0.85rem', color: '#3A3A3A' }}>Mettre en vedette (page d&apos;accueil)</span>
        </label>

        {/* Variant stock (bulk-saved with the form) */}
        {product.variants.length > 0 && (
          <div>
            <p className="overline-text mb-3" style={{ color: '#999' }}>Stock des variantes</p>
            <div className="flex flex-col gap-2">
              {product.variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-3" style={{ borderBottom: '1px solid #f0eee9', paddingBottom: 8 }}>
                  <span className="body-refined" style={{ fontSize: '0.82rem', color: '#3A3A3A' }}>{v.name}{v.sku ? <span style={{ color: '#bbb' }}> · {v.sku}</span> : null}</span>
                  <div className="flex items-center gap-3">
                    <input name={`stock-${v.id}`} type="number" min={0} defaultValue={v.stock} style={{ width: 80, textAlign: 'center', ...cellInput }} />
                    <button type="button" onClick={() => removeVariant(v.id)} disabled={busy} aria-label="Supprimer la variante" style={{ color: '#c88', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={pending} className="btn-primary" style={pending ? { opacity: 0.6 } : undefined}>
            <span>{pending ? 'Enregistrement…' : 'Enregistrer'}</span>
          </button>
          <Link href="/admin/products" className="nav-link" style={{ color: '#666' }}>Retour</Link>
          {state.ok && <span className="body-refined" style={{ color: '#7a9a6a', fontSize: '0.8rem' }}>✓ Enregistré</span>}
          {state.error && <span className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.8rem' }}>{state.error}</span>}
        </div>
      </form>

      {/* ── Ajouter une variante ── */}
      <section style={{ background: '#fff', padding: '1.75rem' }}>
        <p className="overline-text mb-5" style={{ color: '#999' }}>Ajouter une variante</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#bbb', fontSize: '0.55rem' }}>Taille</span>
            <input value={nv.size} onChange={(e) => setNv({ ...nv, size: e.target.value })} placeholder="XS / S / M / L…" style={{ width: 120, ...cellInput }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#bbb', fontSize: '0.55rem' }}>Couleur</span>
            <input value={nv.color} onChange={(e) => setNv({ ...nv, color: e.target.value })} placeholder="Magenta…" style={{ width: 120, ...cellInput }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#bbb', fontSize: '0.55rem' }}>SKU</span>
            <input value={nv.sku} onChange={(e) => setNv({ ...nv, sku: e.target.value })} placeholder="(auto)" style={{ width: 130, ...cellInput }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#bbb', fontSize: '0.55rem' }}>Stock</span>
            <input value={nv.stock} onChange={(e) => setNv({ ...nv, stock: e.target.value })} type="number" min={0} style={{ width: 80, ...cellInput }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#bbb', fontSize: '0.55rem' }}>Prix (option.)</span>
            <input value={nv.price} onChange={(e) => setNv({ ...nv, price: e.target.value })} type="number" step="0.01" placeholder="défaut" style={{ width: 100, ...cellInput }} />
          </label>
          <button type="button" onClick={createVariant} disabled={busy || (!nv.size && !nv.color)} className="btn-dark" style={{ padding: '0.7rem 1.4rem', opacity: busy || (!nv.size && !nv.color) ? 0.5 : 1 }}>
            <span className="flex items-center gap-2"><Plus size={14} /> Ajouter</span>
          </button>
        </div>
      </section>

      {/* ── Zone de danger ── */}
      <section style={{ background: '#fff', padding: '1.75rem', borderTop: '2px solid #eb1e7a' }}>
        <p className="overline-text mb-2" style={{ color: '#eb1e7a' }}>Zone de danger</p>
        <p className="body-refined mb-4" style={{ fontSize: '0.8rem', color: '#888' }}>
          Supprimer définitivement ce produit, ses photos et ses variantes. Les commandes passées sont conservées.
        </p>
        <form
          action={deleteProduct}
          onSubmit={(e) => {
            if (!confirm(`Supprimer définitivement « ${product.name} » ? Cette action est irréversible.`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={product.id} />
          <button type="submit" className="flex items-center gap-2" style={{ color: '#eb1e7a', background: 'none', border: '1px solid #eb1e7a', padding: '0.6rem 1.4rem', fontFamily: 'var(--font-body)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            <Trash2 size={14} /> Supprimer le produit
          </button>
        </form>
      </section>
    </div>
  );
}
