'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'Georgia, serif', background: '#FAF7F2', color: '#080808' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <p style={{ letterSpacing: '0.35em', textTransform: 'uppercase', fontSize: 11, color: '#C9A84C', marginBottom: 16 }}>Sarje</p>
          <h1 style={{ fontWeight: 300, fontSize: 32, margin: '0 0 12px' }}>Service momentanément indisponible</h1>
          <p style={{ color: '#666', maxWidth: 420, fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Nous rencontrons une difficulté technique passagère. Veuillez réessayer dans quelques instants.
          </p>
          <button
            onClick={reset}
            style={{ background: '#eb1e7a', color: '#fff', border: 'none', padding: '14px 36px', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 12, cursor: 'pointer', fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
