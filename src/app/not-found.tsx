import ComingSoon from '@/components/ComingSoon';

export default function NotFound() {
  return (
    <ComingSoon
      overline="Erreur 404"
      title="Page Introuvable"
      body="La page que vous recherchez n'existe pas ou a été déplacée."
      cta={{ href: '/', label: "Retour à l'Accueil" }}
    />
  );
}
