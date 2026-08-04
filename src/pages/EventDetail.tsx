import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockEvents } from '../data/mockData';
import { Calendar, MapPin, Plus, Minus } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const event = mockEvents.find(e => e.id === id);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!event) return null;

  const handleQuantity = (tierId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [tierId]: Math.max(1, (prev[tierId] || 1) + delta)
    }));
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      
      {/* Hero Image */}
      <section className="relative" style={{ height: '55vh' }}>
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.2) 100%)' }} />
        
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-12 max-w-screen-xl mx-auto">
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>Fashion Show</p>
          <h1 className="heading-xl text-white mb-6 leading-tight">{event.title}</h1>
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <Calendar size={18} style={{ color: '#eb1e7a' }} strokeWidth={1.5} />
              <span className="body-refined" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} style={{ color: '#eb1e7a' }} strokeWidth={1.5} />
              <span className="body-refined" style={{ color: 'rgba(255,255,255,0.8)' }}>{event.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-16 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
        
        {/* Left: Description */}
        <div className="lg:col-span-3">
          <div className="line-gold mb-8" />
          <h2 className="heading-md mb-6">À propos de l'événement</h2>
          <p className="body-refined" style={{ color: '#555', fontSize: '1rem', whiteSpace: 'pre-line' }}>
            {event.description}
          </p>
        </div>

        {/* Right: Tickets */}
        <div className="lg:col-span-2">
          <h2 className="heading-md mb-8">Billetterie</h2>
          
          <div className="flex flex-col gap-6">
            {event.ticketTiers.map(tier => {
              const qty = quantities[tier.id] || 1;
              return (
                <div key={tier.id} className="ticket-card p-8 flex flex-col gap-6 shadow-sm">
                  <div>
                    <h3 className="heading-md mb-1">{tier.name}</h3>
                    <p className="font-display" style={{ fontSize: '2.5rem', color: '#C9A84C' }}>
                      ${tier.price}
                    </p>
                    <p className="overline-text mt-2" style={{ color: '#eb1e7a' }}>Places limitées</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center border" style={{ borderColor: 'rgba(58,58,58,0.2)', width: 'fit-content' }}>
                      <button onClick={() => handleQuantity(tier.id, -1)} className="p-3" style={{ color: '#3A3A3A' }}>
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-body">{qty}</span>
                      <button onClick={() => handleQuantity(tier.id, 1)} className="p-3" style={{ color: '#3A3A3A' }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <Link to={`/events/${event.id}/checkout/${tier.id}?qty=${qty}`} className="btn-primary justify-center text-center w-full">
                      <span>Réserver — {tier.name}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>
    </div>
  );
};

export default EventDetail;
