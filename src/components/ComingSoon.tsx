import Link from 'next/link';

export default function ComingSoon({
  overline,
  title,
  body,
  cta = { href: '/shop', label: 'Parcourir la Collection' },
}: {
  overline: string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-40 px-6" style={{ background: '#FAF7F2' }}>
      <p className="overline-text mb-4" style={{ color: '#C9A84C' }}>{overline}</p>
      <h1 className="heading-lg mb-6">{title}</h1>
      <p className="body-refined mb-10" style={{ color: '#666', maxWidth: 420 }}>{body}</p>
      <Link href={cta.href} className="btn-gold">
        <span>{cta.label}</span>
      </Link>
    </div>
  );
}
