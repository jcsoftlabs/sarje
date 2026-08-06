export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAdminProduct } from '@/lib/admin/queries';
import ProductEditor from '@/components/admin/ProductEditor';

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();

  return (
    <div>
      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Modifier</p>
      <h1 className="heading-lg mb-10">{product.name}</h1>
      <ProductEditor product={product} />
    </div>
  );
}
