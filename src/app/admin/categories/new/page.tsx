import NewCategoryForm from '@/components/admin/NewCategoryForm';

export const metadata = { title: 'Nouvelle catégorie' };

export default function NewCategoryPage() {
  return (
    <div>
      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Organisation</p>
      <h1 className="heading-lg mb-10">Nouvelle catégorie</h1>
      <NewCategoryForm />
    </div>
  );
}
