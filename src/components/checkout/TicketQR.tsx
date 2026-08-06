'use client';

import { QRCodeSVG } from 'qrcode.react';

export default function TicketQR({ code }: { code: string }) {
  return (
    <div style={{ background: '#fff', padding: 8, borderRadius: 2 }}>
      <QRCodeSVG value={code} size={96} bgColor="#ffffff" fgColor="#080808" level="M" />
    </div>
  );
}
