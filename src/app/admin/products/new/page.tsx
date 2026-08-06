import NewProductForm from '@/components/admin/NewProductForm';

export const metadata = { title: 'Nouveau produit' };

export default function NewProductPage() {
  return (
    <div>
      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Catalogue</p>
      <h1 className="heading-lg mb-10">Nouveau produit</h1>
      <NewProductForm />
    </div>
  );
}
