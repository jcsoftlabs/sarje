import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAppStore } from '../store/useAppStore';

const Profile = () => {
  const { orders, tickets } = useAppStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'tickets'>('orders');

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
      
      {/* Header */}
      <section style={{ background: '#080808' }} className="py-16 px-6 lg:px-12 text-center">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: '#eb1e7a' }}>
          <span className="font-display text-3xl text-white">CJ</span>
        </div>
        <h1 className="heading-lg text-white mb-2">Christopher Jerome</h1>
        <p className="overline-text" style={{ color: '#C9A84C' }}>client@example.com</p>
      </section>

      {/* Tabs */}
      <section className="border-b" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        <div className="max-w-screen-xl mx-auto flex justify-center gap-8">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`py-4 nav-link ${activeTab === 'orders' ? 'active' : ''}`}
          >
            Mes Commandes
          </button>
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`py-4 nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
          >
            Mes Billets
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16 pb-32">
        
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="script-title mb-6">Aucune commande</p>
                <Link to="/shop" className="btn-gold"><span>Parcourir la Collection</span></Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="ticket-card p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <p className="font-mono text-sm mb-2" style={{ color: '#C9A84C' }}>{order.id}</p>
                    <p className="overline-text mb-4" style={{ color: '#3A3A3A' }}>{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                    <span className="px-3 py-1 text-[0.65rem] uppercase tracking-widest text-white rounded-full" style={{ background: order.status === 'Processing' ? '#eb1e7a' : '#22c55e' }}>
                      {order.status === 'Processing' ? 'En cours' : 'Livré'}
                    </span>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="body-refined mb-1" style={{ color: '#666' }}>{order.items.length} article(s)</p>
                    <p className="font-display text-2xl" style={{ color: '#080808' }}>${order.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tickets.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="script-title mb-6">Aucun billet</p>
                <Link to="/events" className="btn-gold"><span>Voir les Événements</span></Link>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="qr-ticket flex h-48 shadow-lg">
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>
                        {new Date(ticket.date).toLocaleDateString('fr-FR')}
                      </p>
                      <h3 className="font-display text-2xl mb-1 line-clamp-1">{ticket.eventTitle}</h3>
                      <p className="body-refined text-sm" style={{ color: '#eb1e7a' }}>{ticket.tierName}</p>
                    </div>
                    <div>
                      <p className="overline-text text-gray-400" style={{ fontSize: '0.5rem' }}>DÉTENTEUR</p>
                      <p className="font-display text-lg">{ticket.buyerName}</p>
                    </div>
                  </div>
                  
                  {/* Right QR side */}
                  <div className="w-32 flex items-center justify-center relative bg-gray-50 p-4">
                    <QRCodeCanvas 
                      value={JSON.stringify({ ticketId: ticket.id, type: ticket.tierName })} 
                      size={80} 
                    />
                    {ticket.used && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <span className="border-2 border-red-600 text-red-600 font-bold px-2 py-1 transform -rotate-12 text-sm">UTILISÉ</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </section>
    </div>
  );
};

export default Profile;
