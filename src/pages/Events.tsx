import { Link } from 'react-router-dom';
import { mockEvents } from '../data/mockData';

const Events = () => {
  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2', paddingBottom: '100px' }}>
      
      {/* Hero */}
      <section className="relative flex items-center justify-center text-center px-4" style={{ height: '40vh', background: '#080808' }}>
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.5) 100%)' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>Invitations Exclusives</p>
          <h1 className="heading-xl text-white mb-4">Événements & Défilés</h1>
          <p className="body-refined" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Rejoignez-nous pour nos présentations saisonnières de haute couture à Miami et Port-au-Prince.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-screen-xl mx-auto px-6 lg:px-12 mt-[-40px] relative z-20">
        <div className="flex flex-col gap-6">
          {mockEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} className="event-poster shadow-xl" style={{ height: 480, display: 'block' }}>
              <img src={event.image} alt={event.title} className="event-poster-img absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.95) 10%, rgba(8,8,8,0.3) 100%)' }} />
              
              {/* Date Top Right */}
              <div className="absolute top-8 right-8 text-right">
                <p className="overline-text" style={{ color: '#C9A84C' }}>
                  {new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Info Bottom Left */}
              <div className="absolute bottom-8 left-8 right-8">
                <p className="overline-text mb-2" style={{ color: '#eb1e7a' }}>{event.location}</p>
                <h2 className="heading-lg text-white mb-4">{event.title}</h2>
                <div className="flex items-center gap-6">
                  <span className="body-refined" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    À partir de ${Math.min(...event.ticketTiers.map(t => t.price))}
                  </span>
                  <span className="overline-text flex items-center gap-2" style={{ color: '#C9A84C' }}>
                    <span style={{ width: 30, height: 1, background: '#C9A84C' }} /> Réserver
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Events;
