export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAdminCollections } from '@/lib/admin/queries';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCollections();

  return (
    <div>
      <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Organisation</p>
          <h1 className="heading-lg">Catégories</h1>
        </div>
        <Link href="/admin/categories/new" className="btn-dark" style={{ padding: '0.7rem 1.6rem' }}>
          <span className="flex items-center gap-2"><Plus size={14} /> Nouvelle catégorie</span>
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20" style={{ background: '#fff' }}>
          <p className="body-refined" style={{ color: '#999' }}>Aucune catégorie. Créez-en une.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <Link key={c.id} href={`/admin/categories/${c.id}`} className="block" style={{ background: '#fff' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3', background: '#f4f1ec', overflow: 'hidden' }}>
                {c.heroImageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.heroImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,0.65), transparent 55%)' }} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full"><span className="overline-text" style={{ color: '#ccc' }}>Sans photo</span></div>
                )}
                <p className="font-display" style={{ position: 'absolute', bottom: 14, left: 18, color: c.heroImageUrl ? '#fff' : '#080808', fontSize: '1.4rem' }}>{c.name}</p>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="overline-text" style={{ color: c.isFeatured ? '#eb1e7a' : '#bbb', fontSize: '0.55rem' }}>{c.isFeatured ? '★ En avant' : 'Standard'}</span>
                <span className="nav-link" style={{ color: '#eb1e7a' }}>Modifier →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
