import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

cloudinary.config({ secure: true }); // reads CLOUDINARY_URL

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const folder = (form.get('folder') as string) || 'sarje/uploads';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Format non supporté (JPEG, PNG, WebP, AVIF).' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo).' }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
    });
    return NextResponse.json({ url: res.secure_url, publicId: res.public_id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Échec de l’upload.' },
      { status: 500 },
    );
  }
}
