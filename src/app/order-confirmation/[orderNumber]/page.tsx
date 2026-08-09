export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { getOrderByNumber } from '@/lib/queries';
import { formatPrice, formatDate } from '@/lib/format';
import TicketQR from '@/components/checkout/TicketQR';
import { ticketToken } from '@/lib/tickets';

export const metadata = { title: 'Commande confirmée' };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div style={{ background: '#FAF7F2', paddingBottom: 100 }}>
      <div className="max-w-screen-md mx-auto px-6 lg:px-12 pt-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="mx-auto mb-8 flex items-center justify-center"
            style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid #C9A84C' }}
          >
            <Check size={26} strokeWidth={1.5} style={{ color: '#C9A84C' }} />
          </div>
          <p className="overline-text mb-3" style={{ color: '#C9A84C' }}>Commande Confirmée</p>
          <h1 className="heading-lg mb-4">Merci pour votre commande</h1>
          <p className="body-refined" style={{ color: '#666' }}>
            Commande <strong>{order.orderNumber}</strong> — un email de confirmation vous a été envoyé à {order.email}.
          </p>
        </div>

        {/* Items */}
        <div style={{ background: '#fff', borderTop: '2px solid #C9A84C', padding: '2rem 2.5rem' }}>
          <div className="flex flex-col gap-4">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between gap-4 pb-4 border-b" style={{ borderColor: 'rgba(58,58,58,0.08)' }}>
                <span className="body-refined" style={{ color: '#3A3A3A', fontSize: '0.88rem' }}>
                  {it.quantity} × {it.nameSnapshot}
                </span>
                <span className="body-refined" style={{ color: '#C9A84C', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>
                  {formatPrice(it.unitPriceCents * it.quantity, order.currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <span className="font-display text-2xl">Total</span>
            <span className="font-display text-2xl" style={{ color: '#C9A84C' }}>
              {formatPrice(order.totalCents, order.currency)}
            </span>
          </div>
        </div>

        {/* Tickets */}
        {order.tickets.length > 0 && (
          <div className="mt-12">
            <div className="divider-gold mb-8" style={{ justifyContent: 'flex-start' }}>
              <h2 className="heading-md">Vos Billets</h2>
            </div>
            <div className="flex flex-col gap-4">
              {order.tickets.map((t) => (
                <div key={t.id} className="qr-ticket flex items-center gap-6 p-6">
                  <TicketQR code={ticketToken(t.code)} />
                  <div>
                    <p className="overline-text mb-1" style={{ color: '#C9A84C' }}>{t.tier?.name ?? 'Billet'}</p>
                    <p className="font-display" style={{ fontSize: '1.3rem', color: '#080808' }}>{t.event.title}</p>
                    <p className="body-refined" style={{ fontSize: '0.78rem', color: '#888' }}>
                      {formatDate(t.event.startsAt)} — {t.event.location}
                    </p>
                    <p className="body-refined" style={{ fontSize: '0.7rem', color: '#bbb', letterSpacing: '0.1em' }}>{t.code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-16">
          <Link href="/shop" className="btn-gold"><span>Continuer mes Achats</span></Link>
        </div>
      </div>
    </div>
  );
}
