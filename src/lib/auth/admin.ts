import 'server-only';
import { redirect } from 'next/navigation';
import { getCurrentUser } from './session';

/** Guards admin pages AND server actions. Always call in every mutation. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');
  return user;
}
