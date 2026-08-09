'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-dark no-print" style={{ padding: '0.7rem 1.8rem' }}>
      <span className="flex items-center gap-2"><Printer size={15} /> Imprimer / PDF</span>
    </button>
  );
}
