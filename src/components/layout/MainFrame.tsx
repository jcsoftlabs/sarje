'use client';

import { usePathname } from 'next/navigation';

// The navbar is fixed; the home page has a full-bleed hero (no offset needed),
// every other page needs top padding so content clears the navbar.
export default function MainFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  return (
    <main className={`flex-grow ${isHome ? '' : 'pt-36 lg:pt-44'}`} style={{ minHeight: '60vh' }}>
      {children}
    </main>
  );
}
