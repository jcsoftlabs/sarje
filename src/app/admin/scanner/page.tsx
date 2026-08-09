import AdminScanner from '@/components/admin/AdminScanner';

export const metadata = { title: 'Scanner billets' };

export default function AdminScannerPage() {
  return (
    <div>
      <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Contrôle d&apos;accès</p>
      <h1 className="heading-lg mb-2">Scanner les billets</h1>
      <p className="body-refined mb-10" style={{ color: '#888', fontSize: '0.85rem' }}>
        Scannez le QR code au guichet — un billet valide est automatiquement marqué comme utilisé.
      </p>
      <AdminScanner />
    </div>
  );
}
