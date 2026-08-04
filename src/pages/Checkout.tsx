import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, addOrder, clearCart } = useAppStore();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (cart.length === 0) navigate('/shop');
  }, [cart, navigate]);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal + shipping;

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = 'SRJ-' + Date.now().toString(36).toUpperCase();
    addOrder({
      id: orderId,
      date: new Date().toISOString(),
      items: cart,
      total,
      status: 'Processing'
    });
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-10">
        
        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-12">
          <span className="overline-text" style={{ color: step >= 1 ? '#eb1e7a' : '#888' }}>1. Informations</span>
          <span className="w-8 h-px bg-gray-300" />
          <span className="overline-text" style={{ color: step === 2 ? '#eb1e7a' : '#888' }}>2. Paiement</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            
            {step === 1 && (
              <form onSubmit={handleSubmitInfo} className="flex flex-col gap-6">
                <h2 className="heading-md mb-4">Détails de Livraison</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input required type="text" placeholder="PRÉNOM" className="input-luxury" />
                  <input required type="text" placeholder="NOM" className="input-luxury" />
                </div>
                
                <input required type="email" placeholder="ADRESSE EMAIL" className="input-luxury" />
                <input required type="tel" placeholder="TÉLÉPHONE" className="input-luxury" />
                
                <div className="mt-4">
                  <input required type="text" placeholder="ADRESSE" className="input-luxury mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required type="text" placeholder="VILLE" className="input-luxury" />
                    <input required type="text" placeholder="CODE POSTAL" className="input-luxury" />
                  </div>
                </div>

                <div className="mt-4">
                  <select required className="input-luxury" style={{ appearance: 'none', cursor: 'none' }}>
                    <option value="" disabled selected>PAYS</option>
                    <option value="US">États-Unis</option>
                    <option value="HT">Haïti</option>
                    <option value="FR">France</option>
                  </select>
                </div>

                <div className="mt-8">
                  <button type="submit" className="btn-primary">
                    <span>Continuer vers le paiement</span>
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmitPayment} className="flex flex-col gap-8">
                <h2 className="heading-md">Méthode de Paiement</h2>

                <div className="flex flex-col gap-4">
                  {/* Card option */}
                  <label className="ticket-card p-6 cursor-pointer flex flex-col gap-4" style={{ border: paymentMethod === 'card' ? '1px solid #eb1e7a' : '1px solid #e8e4de' }}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-fuchsia-600 w-4 h-4" />
                      <span className="overline-text text-gray-800">Carte Bancaire Internationale</span>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="pl-8 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                        <input required type="text" placeholder="NUMÉRO DE CARTE" className="input-luxury" />
                        <div className="grid grid-cols-2 gap-4">
                          <input required type="text" placeholder="MM/YY" className="input-luxury" />
                          <input required type="text" placeholder="CVC" className="input-luxury" />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* MonCash option */}
                  <label className="ticket-card p-6 cursor-pointer flex flex-col gap-4" style={{ border: paymentMethod === 'moncash' ? '1px solid #eb1e7a' : '1px solid #e8e4de' }}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" checked={paymentMethod === 'moncash'} onChange={() => setPaymentMethod('moncash')} className="accent-fuchsia-600 w-4 h-4" />
                      <span className="overline-text text-gray-800">MonCash (Haïti)</span>
                    </div>
                    {paymentMethod === 'moncash' && (
                      <div className="pl-8 animate-in fade-in slide-in-from-top-2">
                        <input required type="tel" placeholder="NUMÉRO DE TÉLÉPHONE MONCASH" className="input-luxury" />
                        <p className="body-refined text-gray-500 mt-2" style={{ fontSize: '0.75rem' }}>Vous recevrez un prompt sur votre téléphone pour confirmer le paiement.</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="mt-8 flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ borderColor: 'rgba(58,58,58,0.2)', color: '#3A3A3A' }}>
                    <span>Retour</span>
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    <span>Confirmer le Paiement</span>
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="p-8 sticky top-28" style={{ background: '#fff', borderTop: '2px solid #C9A84C' }}>
              <h2 className="heading-md mb-6">Votre Commande</h2>
              
              <div className="flex flex-col gap-4 mb-8">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <img src={item.product.image} alt="" className="w-16 h-20 object-cover" />
                    <div className="flex-1">
                      <p className="font-display" style={{ fontSize: '1.1rem' }}>{item.product.name}</p>
                      <p className="body-refined text-gray-500" style={{ fontSize: '0.75rem' }}>Qté: {item.quantity}</p>
                      <p className="body-refined text-gold-600" style={{ color: '#C9A84C', fontSize: '0.9rem' }}>${(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                <div className="flex justify-between mb-2">
                  <span className="body-refined text-gray-600">Sous-total</span>
                  <span className="font-body">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-6">
                  <span className="body-refined text-gray-600">Livraison (Premium)</span>
                  <span className="font-body">${shipping.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between border-t pt-4" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
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

export default Checkout;
