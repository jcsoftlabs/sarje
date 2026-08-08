'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useCart, cartSubtotal } from '@/lib/store/cart';
import { formatPrice } from '@/lib/format';
import { placeOrder } from '@/lib/checkout/actions';
import type { ShippingMethod } from '@/lib/queries';

const APP_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? '';
const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? '';
const SDK_URL = APP_ID.startsWith('sandbox-')
  ? 'https://sandbox.web.squarecdn.com/v1/square.js'
  : 'https://web.squarecdn.com/v1/square.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Square?: any;
  }
}

function loadSquare(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Square) return resolve();
    if (!APP_ID || !LOCATION_ID) return reject(new Error('Square non configuré'));
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Chargement Square échoué')));
      if (window.Square) resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Chargement Square échoué'));
    document.head.appendChild(s);
  });
}

export default function CheckoutForm({ methods }: { methods: ShippingMethod[] }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [methodId, setMethodId] = useState<string>(methods[0]?.id ?? '');
  const [wallets, setWallets] = useState<{ google: boolean; apple: boolean; cashapp: boolean }>({
    google: false,
    apple: false,
    cashapp: false,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<any>(null);
  const appleRef = useRef<any>(null);

  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const needsShipping = items.some((i) => i.kind === 'product');
  const selectedMethod = methods.find((m) => m.id === methodId);
  const shippingCents =
    needsShipping && selectedMethod
      ? selectedMethod.freeOverCents != null && subtotal >= selectedMethod.freeOverCents
        ? 0
        : selectedMethod.priceCents
      : 0;
  const total = subtotal + shippingCents;

  // Read + validate the contact/shipping form.
  const readForm = () => {
    const fd = new FormData(formRef.current!);
    const get = (k: string) => (fd.get(k) as string | null)?.trim() ?? '';
    return {
      contact: { email: get('email'), firstName: get('firstName'), lastName: get('lastName'), phone: get('phone') || undefined },
      shipping: {
        line1: get('line1'),
        line2: get('line2') || undefined,
        city: get('city'),
        region: get('region') || undefined,
        postalCode: get('postalCode'),
        country: get('country') || 'US',
      },
    };
  };
  const validate = (f: ReturnType<typeof readForm>) => {
    if (!f.contact.email || !f.contact.firstName || !f.contact.lastName) {
      toast.error('Complétez vos coordonnées.');
      return false;
    }
    if (!f.shipping.line1 || !f.shipping.city || !f.shipping.postalCode) {
      toast.error('Complétez votre adresse de livraison.');
      return false;
    }
    return true;
  };

  const pay = async (token: string) => {
    const f = readForm();
    if (!validate(f)) {
      setProcessing(false);
      return;
    }
    const res = await placeOrder({
      sourceId: token,
      contact: f.contact,
      shipping: f.shipping,
      shippingMethodId: needsShipping && methodId ? methodId : undefined,
      items: items.map((i) => ({ kind: i.kind, refId: i.refId, quantity: i.quantity })),
    });
    if (res.ok) {
      clear();
      router.push(`/order-confirmation/${res.orderNumber}`);
    } else {
      toast.error(res.error);
      setProcessing(false);
    }
  };

  // Initialize the Square payment methods once mounted with a non-empty cart.
  useEffect(() => {
    if (!mounted || items.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        await loadSquare();
        if (cancelled) return;
        const payments = window.Square.payments(APP_ID, LOCATION_ID);

        // Card (always).
        const card = await payments.card();
        await card.attach('#sq-card');
        cardRef.current = card;

        const amount = (total / 100).toFixed(2);
        const buildRequest = () =>
          payments.paymentRequest({
            countryCode: 'US',
            currencyCode: 'USD',
            total: { amount, label: 'Total' },
          });

        // Google Pay
        try {
          const gp = await payments.googlePay(buildRequest());
          await gp.attach('#sq-google', { buttonColor: 'black', buttonType: 'long', buttonSizeMode: 'fill' });
          gp.addEventListener('ontokenization', (e: any) => {
            const r = e.detail?.tokenResult;
            if (r?.status === 'OK') { setProcessing(true); pay(r.token); }
          });
          if (!cancelled) setWallets((w) => ({ ...w, google: true }));
        } catch { /* not available */ }

        // Cash App Pay
        try {
          const cap = await payments.cashAppPay(buildRequest(), { redirectURL: window.location.href, referenceId: 'sarje-order' });
          await cap.attach('#sq-cashapp', { shape: 'semiround', size: 'medium' });
          cap.addEventListener('ontokenization', (e: any) => {
            const r = e.detail?.tokenResult;
            if (r?.status === 'OK') { setProcessing(true); pay(r.token); }
          });
          if (!cancelled) setWallets((w) => ({ ...w, cashapp: true }));
        } catch { /* not available */ }

        // Apple Pay (Safari + verified domain only).
        try {
          const ap = await payments.applePay(buildRequest());
          appleRef.current = ap;
          if (!cancelled) setWallets((w) => ({ ...w, apple: true }));
        } catch { /* not available */ }

        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Paiement indisponible.');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, items.length]);

  const handleCardPay = async () => {
    if (processing || !cardRef.current) return;
    const f = readForm();
    if (!validate(f)) return;
    setProcessing(true);
    try {
      const result = await cardRef.current.tokenize();
      if (result.status === 'OK') {
        await pay(result.token);
      } else {
        toast.error('Vérifiez les informations de votre carte.');
        setProcessing(false);
      }
    } catch {
      toast.error('Le paiement a échoué.');
      setProcessing(false);
    }
  };

  const handleApplePay = async () => {
    if (processing || !appleRef.current) return;
    const f = readForm();
    if (!validate(f)) return;
    setProcessing(true);
    try {
      const result = await appleRef.current.tokenize();
      if (result.status === 'OK') await pay(result.token);
      else setProcessing(false);
    } catch {
      setProcessing(false);
    }
  };

  if (!mounted) return <div style={{ minHeight: '50vh' }} />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-40" style={{ background: '#FAF7F2' }}>
        <p className="script-title mb-6">Votre panier est vide</p>
        <Link href="/shop" className="btn-gold"><span>Parcourir la Collection</span></Link>
      </div>
    );
  }

  const inputCls = 'input-luxury';

  return (
    <div style={{ background: '#FAF7F2', paddingBottom: 100 }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-16">
        <div className="mb-12">
          <p className="overline-text" style={{ color: '#C9A84C' }}>Paiement Sécurisé — Square</p>
          <h1 className="heading-lg mt-1">Finaliser la commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Form + payment */}
          <div className="lg:col-span-2">
            <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-10">
              <fieldset>
                <p className="overline-text mb-6" style={{ color: '#3A3A3A' }}>Coordonnées</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input name="firstName" placeholder="Prénom" className={inputCls} autoComplete="given-name" />
                  <input name="lastName" placeholder="Nom" className={inputCls} autoComplete="family-name" />
                  <input name="email" type="email" placeholder="Email" className={inputCls} autoComplete="email" />
                  <input name="phone" placeholder="Téléphone (optionnel)" className={inputCls} autoComplete="tel" />
                </div>
              </fieldset>

              <fieldset>
                <p className="overline-text mb-6" style={{ color: '#3A3A3A' }}>Livraison</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input name="line1" placeholder="Adresse" className={`${inputCls} sm:col-span-2`} autoComplete="address-line1" />
                  <input name="line2" placeholder="Complément (optionnel)" className={`${inputCls} sm:col-span-2`} autoComplete="address-line2" />
                  <input name="city" placeholder="Ville" className={inputCls} autoComplete="address-level2" />
                  <input name="region" placeholder="État / Région" className={inputCls} autoComplete="address-level1" />
                  <input name="postalCode" placeholder="Code postal" className={inputCls} autoComplete="postal-code" />
                  <input name="country" placeholder="Pays" defaultValue="US" className={inputCls} autoComplete="country" />
                </div>
              </fieldset>

              {needsShipping && methods.length > 0 && (
                <fieldset>
                  <p className="overline-text mb-6" style={{ color: '#3A3A3A' }}>Mode de livraison</p>
                  <div className="flex flex-col gap-3">
                    {methods.map((m) => {
                      const free = m.freeOverCents != null && subtotal >= m.freeOverCents;
                      const cost = free ? 0 : m.priceCents;
                      const active = methodId === m.id;
                      return (
                        <label
                          key={m.id}
                          className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer transition-colors"
                          style={{ background: '#fff', border: `1px solid ${active ? '#eb1e7a' : 'rgba(58,58,58,0.15)'}` }}
                        >
                          <div className="flex items-center gap-3">
                            <input type="radio" name="shippingMethod" checked={active} onChange={() => setMethodId(m.id)} />
                            <div>
                              <p className="body-refined" style={{ fontSize: '0.9rem', color: '#080808' }}>{m.name}</p>
                              {(m.description || m.minDays || m.maxDays) && (
                                <p className="body-refined" style={{ fontSize: '0.72rem', color: '#999' }}>
                                  {m.description}
                                  {m.minDays && m.maxDays ? ` · ${m.minDays}–${m.maxDays} jours` : m.maxDays ? ` · ${m.maxDays} jours` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="body-refined" style={{ fontSize: '0.85rem', color: cost === 0 ? '#7a9a6a' : '#C9A84C', whiteSpace: 'nowrap' }}>
                            {cost === 0 ? 'Offerte' : formatPrice(cost, 'USD')}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <fieldset>
                <p className="overline-text mb-6" style={{ color: '#3A3A3A' }}>Paiement</p>

                {/* Wallets */}
                <div className="flex flex-col gap-3 mb-6" style={{ maxWidth: 360 }}>
                  <div id="sq-apple" style={{ display: wallets.apple ? 'block' : 'none' }}>
                    {wallets.apple && (
                      <button type="button" onClick={handleApplePay} className="btn-dark w-full justify-center" style={{ background: '#000', borderColor: '#000' }}>
                        <span> Pay</span>
                      </button>
                    )}
                  </div>
                  <div id="sq-google" style={{ display: wallets.google ? 'block' : 'none', minHeight: wallets.google ? 44 : 0 }} />
                  <div id="sq-cashapp" style={{ display: wallets.cashapp ? 'block' : 'none' }} />
                </div>

                {(wallets.google || wallets.apple || wallets.cashapp) && (
                  <div className="flex items-center gap-4 mb-6" style={{ maxWidth: 360 }}>
                    <span style={{ flex: 1, height: 1, background: 'rgba(58,58,58,0.15)' }} />
                    <span className="overline-text" style={{ color: '#aaa', fontSize: '0.6rem' }}>ou carte</span>
                    <span style={{ flex: 1, height: 1, background: 'rgba(58,58,58,0.15)' }} />
                  </div>
                )}

                {/* Card */}
                <div id="sq-card" style={{ minHeight: 90, maxWidth: 480 }} />
                <button
                  type="button"
                  onClick={handleCardPay}
                  disabled={!ready || processing}
                  className="btn-primary justify-center mt-6"
                  style={!ready || processing ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                >
                  <span>{processing ? 'Traitement…' : `Payer ${formatPrice(total, items[0]?.currency ?? 'USD')}`}</span>
                </button>
                <p className="body-refined mt-4" style={{ fontSize: '0.72rem', color: '#aaa' }}>
                  Paiement chiffré via Square. Carte test sandbox : 4111 1111 1111 1111 — 12/26 — 111 — 10003.
                </p>
              </fieldset>
            </form>
          </div>

          {/* Summary */}
          <div>
            <div className="p-8 sticky top-28" style={{ background: '#fff', borderTop: '2px solid #C9A84C' }}>
              <h2 className="heading-md mb-8">Votre Commande</h2>
              <div className="flex flex-col gap-4 mb-8">
                {items.map((it, i) => (
                  <div key={`${it.refId}-${i}`} className="flex justify-between gap-4">
                    <span className="body-refined" style={{ fontSize: '0.82rem', color: '#555' }}>
                      {it.quantity} × {it.name}
                      {it.subtitle ? <span style={{ color: '#aaa' }}> — {it.subtitle}</span> : null}
                    </span>
                    <span className="body-refined" style={{ fontSize: '0.82rem', color: '#3A3A3A', whiteSpace: 'nowrap' }}>
                      {formatPrice(it.priceCents * it.quantity, it.currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mb-3 pt-6 border-t" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                <span className="body-refined text-gray-600">Sous-total</span>
                <span className="font-body">{formatPrice(subtotal, items[0]?.currency ?? 'USD')}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="body-refined text-gray-600">
                  Livraison{needsShipping && selectedMethod ? ` · ${selectedMethod.name}` : ''}
                </span>
                <span className="body-refined" style={{ color: shippingCents === 0 ? '#7a9a6a' : '#3A3A3A', fontSize: '0.8rem' }}>
                  {!needsShipping ? '—' : shippingCents === 0 ? 'Offerte' : formatPrice(shippingCents, 'USD')}
                </span>
              </div>
              <div className="flex justify-between pt-6 border-t" style={{ borderColor: 'rgba(58,58,58,0.1)' }}>
                <span className="font-display text-2xl">Total</span>
                <span className="font-display text-2xl" style={{ color: '#C9A84C' }}>{formatPrice(total, items[0]?.currency ?? 'USD')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
