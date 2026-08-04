import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { mockEvents } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';

const TicketCheckout = () => {
  const { id, tierId } = useParams<{ id: string; tierId: string }>();
  const [searchParams] = useSearchParams();
  const qty = parseInt(searchParams.get('qty') || '1', 10);
  const navigate = useNavigate();
  const addTicket = useAppStore(state => state.addTicket);

  const event = mockEvents.find(e => e.id === id);
  const tier = event?.ticketTiers.find(t => t.id === tierId);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [name, setName] = useState('');

  if (!event || !tier) return null;
  const total = tier.price * qty;

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < qty; i++) {
      const ticketId = 'SRJ-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2,7).toUpperCase();
      addTicket({
        id: ticketId,
        eventId: event.id,
        eventTitle: event.title,
        date: event.date,
        location: event.location,
        tierId: tier.id,
        tierName: tier.name,
        buyerName: name,
        purchaseDate: new Date().toISOString(),
        used: false
      });
    }
    toast.success(`${qty} billet(s) confirmé(s) !`);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-10">
        
        <div className="mb-12">
          <p className="overline-text mb-2" style={{ color: '#eb1e7a' }}>Réservation — {event.title}</p>
          <h1 className="heading-lg">Finaliser l'achat</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          <div className="lg:col-span-2">
            
            <div className="flex items-center gap-4 mb-8">
              <span className="overline-text" style={{ color: step >= 1 ? '#eb1e7a' : '#888' }}>1. Invité</span>
              <span className="w-8 h-px bg-gray-300" />
              <span className="overline-text" style={{ color: step === 2 ? '#eb1e7a' : '#888' }}>2. Paiement</span>
            </div>

            {step === 1 && (
              <form onSubmit={handleSubmitInfo} className="flex flex-col gap-6">
                <input required type="text" placeholder="NOM COMPLET" value={name} onChange={e => setName(e.target.value)} className="input-luxury" />
                <input required type="email" placeholder="ADRESSE EMAIL" className="input-luxury" />
                <input required type="tel" placeholder="TÉLÉPHONE" className="input-luxury" />
                <button type="submit" className="btn-primary mt-4 max-w-xs justify-center">
                  <span>Suivant</span>
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmitPayment} className="flex flex-col gap-8">
                <label className="ticket-card p-6 cursor-pointer flex flex-col gap-4" style={{ border: paymentMethod === 'card' ? '1px solid #eb1e7a' : '1px solid #e8e4de' }}>
                  <div className="flex items-center gap-4">
                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-fuchsia-600" />
                    <span className="overline-text">Carte Bancaire</span>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="pl-8 flex flex-col gap-4">
                      <input required type="text" placeholder="NUMÉRO DE CARTE" className="input-luxury" />
                      <div className="grid grid-cols-2 gap-4">
                        <input required type="text" placeholder="MM/YY" className="input-luxury" />
                        <input required type="text" placeholder="CVC" className="input-luxury" />
                      </div>
                    </div>
                  )}
                </label>

                <label className="ticket-card p-6 cursor-pointer flex flex-col gap-4" style={{ border: paymentMethod === 'moncash' ? '1px solid #eb1e7a' : '1px solid #e8e4de' }}>
                  <div className="flex items-center gap-4">
                    <input type="radio" checked={paymentMethod === 'moncash'} onChange={() => setPaymentMethod('moncash')} className="accent-fuchsia-600" />
                    <span className="overline-text">MonCash</span>
                  </div>
                  {paymentMethod === 'moncash' && (
                    <div className="pl-8">
                      <input required type="tel" placeholder="TÉLÉPHONE MONCASH" className="input-luxury" />
                    </div>
                  )}
                </label>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ borderColor: '#ccc', color: '#3A3A3A' }}>Retour</button>
                  <button type="submit" className="btn-primary flex-1 justify-center"><span>Payer ${total.toLocaleString()}</span></button>
                </div>
              </form>
            )}

          </div>

          <div>
            <div className="p-8 sticky top-28" style={{ background: '#fff', borderTop: '2px solid #C9A84C' }}>
              <h2 className="heading-md mb-6">Résumé Billet</h2>
              <p className="font-display text-xl mb-1">{tier.name}</p>
              <p className="body-refined text-gray-500 mb-6" style={{ fontSize: '0.8rem' }}>Qté: {qty}</p>
              <div className="border-t pt-4" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                <div className="flex justify-between">
                  <span className="font-display text-2xl">Total</span>
                  <span className="font-display text-2xl" style={{ color: '#C9A84C' }}>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TicketCheckout;
