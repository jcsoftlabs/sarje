import { Link } from 'react-router-dom';
import { X, Plus, Minus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useAppStore();
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center" style={{ background: '#FAF7F2' }}>
        <p className="script-title mb-6">Votre panier est vide</p>
        <p className="body-refined mb-10 text-gray-500">Découvrez nos créations exclusives.</p>
        <Link to="/shop" className="btn-gold">
          <span>Parcourir la Collection</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-16">
        
        <div className="mb-16">
          <h1 className="heading-lg mb-2">Mon Panier</h1>
          <p className="overline-text" style={{ color: '#C9A84C' }}>
            {cart.reduce((a, c) => a + c.quantity, 0)} Article(s)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {cart.map((item, index) => (
              <div key={index} className="flex gap-6 pb-8 border-b" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                {/* Image */}
                <Link to={`/shop/${item.product.id}`} className="block w-24 sm:w-32 flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                
                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="overline-text mb-1" style={{ color: '#C9A84C' }}>{item.product.category}</p>
                      <Link to={`/shop/${item.product.id}`} className="font-display text-xl sm:text-2xl" style={{ color: '#080808', textDecoration: 'none' }}>
                        {item.product.name}
                      </Link>
                    </div>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="p-2 transition-colors"
                      style={{ color: '#888' }}
                      onMouseOver={e => e.currentTarget.style.color = '#eb1e7a'}
                      onMouseOut={e => e.currentTarget.style.color = '#888'}
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="body-refined mb-auto" style={{ color: '#666', fontSize: '0.85rem' }}>
                    {item.selectedColor && <p>Couleur: {item.selectedColor}</p>}
                    {item.selectedSize && <p>Taille: {item.selectedSize}</p>}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border" style={{ borderColor: 'rgba(58,58,58,0.2)' }}>
                      <button onClick={() => updateQuantity(index, item.quantity - 1)} className="p-2" style={{ color: '#3A3A3A' }}>
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, item.quantity + 1)} className="p-2" style={{ color: '#3A3A3A' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-display text-xl" style={{ color: '#C9A84C' }}>
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="p-8 sticky top-28" style={{ background: '#fff', borderTop: '2px solid #C9A84C' }}>
              <h2 className="heading-md mb-8">Résumé</h2>
              
              <div className="flex justify-between mb-4">
                <span className="body-refined text-gray-600">Sous-total</span>
                <span className="font-body text-lg">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-8 pb-8 border-b" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                <span className="body-refined text-gray-600">Livraison</span>
                <span className="body-refined text-gray-500 italic" style={{ fontSize: '0.75rem' }}>Calculée au paiement</span>
              </div>
              
              <div className="flex justify-between mb-10">
                <span className="font-display text-2xl">Total</span>
                <span className="font-display text-2xl" style={{ color: '#C9A84C' }}>${subtotal.toLocaleString()}</span>
              </div>

              <Link to="/checkout" className="btn-primary w-full justify-center">
                <span>Passer la Commande</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
