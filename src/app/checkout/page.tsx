import ComingSoon from '@/components/ComingSoon';

export const metadata = { title: 'Paiement' };

export default function CheckoutPage() {
  return (
    <ComingSoon
      overline="Paiement Sécurisé"
      title="Finalisation en préparation"
      body="Le paiement par carte (Square) est en cours d'intégration. Votre panier est conservé — revenez très bientôt pour finaliser votre commande."
      cta={{ href: '/cart', label: 'Revenir au Panier' }}
    />
  );
}
