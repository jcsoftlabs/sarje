'use client';

import { useRef, useState } from 'react';
import { Camera, CameraOff, Check, AlertTriangle, X } from 'lucide-react';
import { validateTicket, type ScanResult } from '@/lib/admin/actions';

/* eslint-disable @typescript-eslint/no-explicit-any */

const RESULT_UI: Record<ScanResult['status'], { bg: string; color: string; label: string; Icon: any }> = {
  valid: { bg: '#eef6ea', color: '#3f7a3f', label: 'Billet valide — accès autorisé', Icon: Check },
  used: { bg: '#fbf3e6', color: '#b07a1e', label: 'Billet déjà utilisé', Icon: AlertTriangle },
  invalid: { bg: '#fbe9ee', color: '#c0264e', label: 'Billet annulé', Icon: X },
  notfound: { bg: '#fbe9ee', color: '#c0264e', label: 'Billet introuvable', Icon: X },
};

export default function AdminScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<any>(null);
  const lastCode = useRef<string>('');

  const check = async (code: string) => {
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      const res = await validateTicket(code);
      setResult(res);
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    setResult(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decoded: string) => {
          if (decoded === lastCode.current) return;
          lastCode.current = decoded;
          await check(decoded);
          setTimeout(() => (lastCode.current = ''), 2500);
        },
        () => {},
      );
      setScanning(true);
    } catch {
      setResult({ status: 'notfound' });
    }
  };

  const stop = async () => {
    try {
      await scannerRef.current?.stop();
      scannerRef.current?.clear();
    } catch {
      /* ignore */
    }
    setScanning(false);
  };

  const ui = result ? RESULT_UI[result.status] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Camera */}
      <div style={{ background: '#fff', padding: '1.75rem' }}>
        <p className="overline-text mb-5" style={{ color: '#999' }}>Caméra</p>
        <div id="qr-reader" style={{ width: '100%', minHeight: 260, background: '#0c0c0c' }} />
        <div className="flex gap-3 mt-5">
          {!scanning ? (
            <button onClick={start} className="btn-dark" style={{ padding: '0.7rem 1.6rem' }}>
              <span className="flex items-center gap-2"><Camera size={15} /> Démarrer le scan</span>
            </button>
          ) : (
            <button onClick={stop} className="btn-gold" style={{ padding: '0.7rem 1.6rem' }}>
              <span className="flex items-center gap-2"><CameraOff size={15} /> Arrêter</span>
            </button>
          )}
        </div>
        <p className="body-refined mt-3" style={{ fontSize: '0.72rem', color: '#aaa' }}>
          Autorisez l&apos;accès à la caméra, puis présentez le QR code du billet.
        </p>
      </div>

      {/* Manual + result */}
      <div className="flex flex-col gap-6">
        <div style={{ background: '#fff', padding: '1.75rem' }}>
          <p className="overline-text mb-5" style={{ color: '#999' }}>Saisie manuelle</p>
          <div className="flex gap-3">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check(manual)}
              placeholder="SRJ-XXXXXXXXXX"
              style={{ flex: 1, border: '1px solid rgba(58,58,58,0.2)', padding: '10px 12px', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', color: '#3A3A3A' }}
            />
            <button onClick={() => check(manual)} disabled={busy} className="btn-primary" style={{ padding: '0.7rem 1.6rem' }}>
              <span>{busy ? '…' : 'Vérifier'}</span>
            </button>
          </div>
        </div>

        {ui && result && (
          <div style={{ background: ui.bg, padding: '1.75rem', borderLeft: `3px solid ${ui.color}` }}>
            <div className="flex items-center gap-3 mb-3" style={{ color: ui.color }}>
              <ui.Icon size={22} strokeWidth={2} />
              <p className="font-display" style={{ fontSize: '1.3rem' }}>{ui.label}</p>
            </div>
            {result.event && (
              <div className="body-refined" style={{ color: '#3A3A3A', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <p><strong>{result.event}</strong>{result.tier ? ` — ${result.tier}` : ''}</p>
                {result.attendee && <p>Titulaire : {result.attendee}</p>}
                {result.usedAt && <p style={{ color: ui.color }}>Scanné le : {new Date(result.usedAt).toLocaleString('fr-FR')}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
