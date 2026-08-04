import { useParams, Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ background: '#080808' }}>
      <div className="max-w-xl mx-auto flex flex-col items-center">
        
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-10" style={{ border: '1px solid #eb1e7a', background: 'rgba(235,30,122,0.1)' }}>
          <Check size={48} style={{ color: '#eb1e7a' }} strokeWidth={1} />
        </div>

        <h1 className="heading-lg text-white mb-4">Commande Confirmée</h1>
        
        <p className="overline-text mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Numéro de commande: <span style={{ color: '#C9A84C', fontFamily: 'monospace', fontSize: '0.8rem' }}>{id}</span>
        </p>

        <p className="body-refined text-white mb-12" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          Merci pour votre confiance. Votre commande d'exception a bien été reçue par nos ateliers. 
          Un email de confirmation contenant les détails de l'expédition vous a été envoyé.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link to="/profile" className="btn-gold justify-center">
            <span>Voir mes commandes</span>
          </Link>
          <Link to="/shop" className="btn-outline justify-center">
            <span>Continuer les achats</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
