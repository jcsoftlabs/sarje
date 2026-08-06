import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MainFrame from '@/components/layout/MainFrame';
import RevealController from '@/components/RevealController';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  metadataBase: new URL('https://sarje.vercel.app'),
  title: {
    default: 'Sarje — Maison de Haute Couture',
    template: '%s — Sarje',
  },
  description:
    "Sarje — maison de haute couture entre Miami et Port-au-Prince. Pièces faites main, alliant héritage caribéen et exigence du luxe international.",
  openGraph: {
    title: 'Sarje — Maison de Haute Couture',
    description: 'Haute couture faite main — Miami · Port-au-Prince.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <MainFrame>{children}</MainFrame>
        <Footer />
        <RevealController />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#080808',
              color: '#FAF7F2',
              border: '1px solid #eb1e7a',
              borderRadius: '0',
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              padding: '12px 20px',
            },
            success: { iconTheme: { primary: '#eb1e7a', secondary: '#FAF7F2' } },
            error: { iconTheme: { primary: '#C9A84C', secondary: '#FAF7F2' } },
          }}
        />
      </body>
    </html>
  );
}
