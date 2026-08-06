import ComingSoon from '@/components/ComingSoon';

export const metadata = { title: 'Scanner' };

export default function ScannerPage() {
  return (
    <ComingSoon
      overline="Contrôle d'Accès"
      title="Scanner de billets"
      body="L'outil de scan des billets QR pour vos événements sera activé dans une prochaine étape."
      cta={{ href: '/events', label: 'Voir les Événements' }}
    />
  );
}
