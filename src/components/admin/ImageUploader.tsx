'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

export default function ImageUploader({
  folder,
  onUploaded,
  label = 'Ajouter une photo',
}: {
  folder: string;
  onUploaded: (url: string, publicId: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec de l’upload.');
      onUploaded(data.url, data.publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l’upload.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-5 py-3 transition-colors"
        style={{
          border: '1px dashed rgba(58,58,58,0.3)',
          background: '#fff',
          color: uploading ? '#aaa' : '#3A3A3A',
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: uploading ? 'wait' : 'pointer',
        }}
      >
        <UploadCloud size={15} strokeWidth={1.5} />
        {uploading ? 'Envoi…' : label}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={handleFile} />
      {error && <p className="body-refined mt-2" style={{ color: '#eb1e7a', fontSize: '0.75rem' }}>{error}</p>}
    </div>
  );
}
