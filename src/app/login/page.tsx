import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { getSession } from '@/lib/auth/session';

export const metadata = { title: 'Connexion' };

export default async function LoginPage() {
  if (await getSession()) redirect('/profile');
  return (
    <div className="flex items-center justify-center px-6 py-24" style={{ background: '#FAF7F2', minHeight: '70vh' }}>
      <AuthForm mode="login" />
    </div>
  );
}
