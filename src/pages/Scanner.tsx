import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Scanner = () => {
  const { markTicketUsed, tickets } = useAppStore();
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error', message: string, detail?: string } | null>(null);
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Only init if there's no scanner yet
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render((decodedText) => {
        handleScan(decodedText);
      }, () => {});
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScan = (data: string) => {
    try {
      // In real life it might just be the ID, here we put JSON in the QR
      const parsed = JSON.parse(data);
      const ticketId = parsed.ticketId || data;
      processTicket(ticketId);
    } catch {
      processTicket(data);
    }
  };

  const processTicket = (ticketId: string) => {
    const success = markTicketUsed(ticketId);
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (success) {
      setScanResult({
        status: 'success',
        message: 'Billet Valide',
        detail: ticket ? `${ticket.eventTitle} - ${ticket.tierName}` : ticketId
      });
    } else {
      setScanResult({
        status: 'error',
        message: 'Billet Invalide ou Déjà Utilisé',
        detail: ticketId
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) processTicket(manualId.trim());
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: '#080808' }}>
      
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(235,30,122,0.1)' }}>
          <ScanLine size={24} style={{ color: '#eb1e7a' }} />
        </div>
        <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Scanneur de Billets</p>
        <h1 className="heading-lg text-white">Poste de Contrôle</h1>
      </div>

      <div className="max-w-md mx-auto px-4">
        
        {/* Scanner UI */}
        <div className="bg-white p-4 rounded-lg shadow-2xl mb-8">
          <div id="qr-reader" className="w-full"></div>
        </div>

        {/* Manual Entry */}
        <form onSubmit={handleManualSubmit} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Entrer le numéro du billet (ex: SRJ-...)" 
            value={manualId}
            onChange={e => setManualId(e.target.value)}
            className="input-luxury flex-1 bg-white/5 text-white px-4 border-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
          />
          <button type="submit" className="btn-gold px-6">OK</button>
        </form>

      </div>

      {/* Result Modal */}
      {scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
          <div className="bg-white w-full max-w-sm relative p-8 text-center ticket-card">
            <button 
              onClick={() => setScanResult(null)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" 
                 style={{ background: scanResult.status === 'success' ? '#dcfce7' : '#fee2e2' }}>
              {scanResult.status === 'success' 
                ? <div className="text-4xl">✓</div> 
                : <div className="text-4xl text-red-600">✕</div>}
            </div>
            
            <h2 className="heading-md mb-2" style={{ color: scanResult.status === 'success' ? '#166534' : '#991b1b' }}>
              {scanResult.message}
            </h2>
            
            {scanResult.detail && (
              <p className="body-refined text-gray-600 mt-4 font-display text-xl">
                {scanResult.detail}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Scanner;
