export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAdminProducts } from '@/lib/admin/queries';
import { formatPrice } from '@/lib/format';

const statusLabel: Record<string, { t: string; c: string }> = {
  active: { t: 'Actif', c: '#7a9a6a' },
  draft: { t: 'Brouillon', c: '#C9A84C' },
  archived: { t: 'Archivé', c: '#aaa' },
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Catalogue</p>
          <h1 className="heading-lg">Produits</h1>
        </div>
        <Link href="/admin/products/new" className="btn-dark" style={{ padding: '0.7rem 1.6rem' }}>
          <span className="flex items-center gap-2"><Plus size={14} /> Nouveau produit</span>
        </Link>
      </div>

      <div style={{ background: '#fff', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Statut', ''].map((h, i) => (
                <th key={i} className="overline-text" style={{ textAlign: 'left', padding: '14px 16px', color: '#999', fontSize: '0.6rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              const st = statusLabel[p.status] ?? statusLabel.active;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f2f0ec' }}>
                  <td style={{ padding: '10px 16px' }}>
                    {p.images[0] && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.images[0].url} alt="" style={{ width: 44, height: 56, objectFit: 'cover' }} />
                    )}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className="font-display" style={{ fontSize: '1.05rem', color: '#080808' }}>{p.name}</span>
                    {p.isFeatured && <span className="overline-text" style={{ color: '#eb1e7a', marginLeft: 8, fontSize: '0.55rem' }}>★ Vedette</span>}
                  </td>
                  <td className="body-refined" style={{ padding: '10px 16px', fontSize: '0.82rem', color: '#666' }}>{p.category}</td>
                  <td className="body-refined" style={{ padding: '10px 16px', fontSize: '0.82rem', color: '#C9A84C' }}>{formatPrice(p.priceCents, p.currency)}</td>
                  <td className="body-refined" style={{ padding: '10px 16px', fontSize: '0.82rem', color: stock > 0 ? '#3A3A3A' : '#eb1e7a' }}>{stock}</td>
                  <td style={{ padding: '10px 16px' }}><span className="overline-text" style={{ color: st.c, fontSize: '0.6rem' }}>{st.t}</span></td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <Link href={`/admin/products/${p.id}`} className="nav-link" style={{ color: '#eb1e7a' }}>Modifier</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
