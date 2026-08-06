import { requireAdmin } from '@/lib/auth/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Administration' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex flex-col lg:flex-row" style={{ minHeight: '100vh', background: '#F4F1EC' }}>
      <AdminSidebar email={admin.email} />
      <div className="flex-1 min-w-0">
        <div className="px-6 lg:px-10 py-10 max-w-[1200px]">{children}</div>
      </div>
    </div>
  );
}
