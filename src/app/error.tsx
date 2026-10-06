'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the error server-side logs already captured; keep the UI calm.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center px-6" style={{ background: '#FAF7F2', minHeight: '70vh' }}>
      <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>Un instant</p>
      <h1 className="heading-lg mb-4">Service momentanément indisponible</h1>
      <p className="body-refined mb-10" style={{ color: '#666', maxWidth: 440 }}>
        Nous rencontrons une difficulté technique passagère. Veuillez réessayer dans quelques instants.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button onClick={reset} className="btn-primary"><span>Réessayer</span></button>
        <Link href="/" className="btn-gold"><span>Retour à l&apos;accueil</span></Link>
      </div>
    </div>
  );
}
