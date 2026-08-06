export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAdminCollection } from '@/lib/admin/queries';
import CategoryEditor from '@/components/admin/CategoryEditor';

export default async function AdminCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getAdminCollection(id);
  if (!category) notFound();

  return (
    <div>
      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Modifier la catégorie</p>
      <h1 className="heading-lg mb-10">{category.name}</h1>
      <CategoryEditor category={category} />
    </div>
  );
}
