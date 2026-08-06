import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { db } from './index';
import {
  users,
  collections,
  products,
  productImages,
  productVariants,
  events,
  ticketTiers,
} from './schema';
import { sql } from 'drizzle-orm';

cloudinary.config({ secure: true }); // reads CLOUDINARY_URL from env

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function upload(source: string, publicId: string, folder: string) {
  const res = await cloudinary.uploader.upload(source, {
    public_id: publicId,
    folder,
    overwrite: true,
    resource_type: 'image',
  });
  return { url: res.secure_url, publicId: res.public_id };
}

const PRODUCTS = [
  { name: 'Robe Magenta Éclat', price: 1250, category: 'Robes', file: 'robe_magenta_1784381070836.jpg', sizes: ['XS', 'S', 'M', 'L'], colors: ['Magenta', 'Noir'], featured: true, description: 'Une robe de soirée haute couture dans notre couleur signature. Silhouette sculpturale, faite main.' },
  { name: 'Veste Tailleur Or', price: 980, category: 'Prêt-à-Porter', file: 'veste_or_1784381080539.jpg', sizes: ['36', '38', '40', '42'], colors: ['Or', 'Blanc'], featured: true, description: "Veste structurée aux finitions en fil d'or, inspirée du soleil d'Haïti." },
  { name: 'Sacoche Lotus Noir', price: 450, category: 'Accessoires', file: 'sacoche_lotus_1784381089608.jpg', sizes: ['Taille unique'], colors: ['Noir'], featured: false, description: 'Sacoche en cuir pleine fleur, ornée du motif lotus stylisé de la maison.' },
  { name: 'Robe Soleil de Minuit', price: 2100, category: 'Couture sur Mesure', file: 'robe_soleil_1784381099616.jpg', sizes: ['Sur mesure'], colors: ['Noir/Or'], featured: true, description: 'Pièce exclusive aux broderies complexes, réalisée entièrement sur mesure.' },
  { name: 'Manteau Oversize Caribéen', price: 850, category: 'Prêt-à-Porter', file: 'manteau_caribeen_1784381120619.jpg', sizes: ['S', 'M', 'L'], colors: ['Beige', 'Blanc'], featured: false, description: 'Manteau léger à la coupe fluide et élégante, pour les soirées fraîches.' },
  { name: 'Lunettes de soleil SJ', price: 320, category: 'Accessoires', file: 'lunettes_sj_1784381130943.jpg', sizes: ['Taille unique'], colors: ['Noir', 'Écaille'], featured: false, description: 'Lunettes de soleil glamour, à la ligne audacieuse et affirmée.' },
];

const EVENTS = [
  { title: 'Sarje Spring Fashion Show 2026', location: 'Art Deco District, Miami, FL', venue: 'The Betsy Hotel', startsAt: '2026-04-15T19:00:00Z', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1400', featured: true, description: 'Découvrez la collection Printemps 2026 dans un cadre spectaculaire au cœur de Miami.', tiers: [ { name: 'Standard', price: 150, capacity: 200 }, { name: 'VIP', price: 350, capacity: 50 }, { name: 'Front Row', price: 800, capacity: 20 } ] },
  { title: 'Défilé Héritage Port-au-Prince', location: 'Port-au-Prince, Haïti', venue: 'Hôtel Karibe', startsAt: '2026-07-22T18:00:00Z', image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1400', featured: true, description: 'Une célébration de nos racines, avec une collection exclusive inspirée par la culture haïtienne.', tiers: [ { name: 'Admission Générale', price: 75, capacity: 300 }, { name: 'VIP + Cocktail', price: 200, capacity: 100 } ] },
  { title: 'New York Gala', location: 'New York, NY', venue: 'The Plaza', startsAt: '2026-11-10T20:00:00Z', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1400', featured: false, description: 'Notre gala annuel présentant la collection Hiver haute couture.', tiers: [ { name: 'Standard', price: 250, capacity: 150 }, { name: 'VIP', price: 600, capacity: 75 } ] },
];

async function main() {
  const publicDir = new URL('../public/', import.meta.url);

  console.log('→ Resetting catalog tables…');
  await db.execute(
    sql`TRUNCATE product_variants, product_images, products, collections, ticket_tiers, events RESTART IDENTITY CASCADE`,
  );

  // Collection
  console.log('→ Creating collection…');
  const [collection] = await db
    .insert(collections)
    .values({
      slug: 'printemps-ete-2026',
      name: 'Printemps — Été 2026',
      description: "L'Art de la Couture — silhouettes audacieuses, tissus d'exception.",
      isFeatured: true,
      position: 0,
    })
    .returning();

  // Products
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const slug = slugify(p.name);
    console.log(`→ Uploading image for ${p.name}…`);
    const img = await upload(new URL(p.file, publicDir).pathname, slug, 'sarje/products');

    const [product] = await db
      .insert(products)
      .values({
        slug,
        name: p.name,
        category: p.category,
        description: p.description,
        priceCents: p.price * 100,
        currency: 'USD',
        status: 'active',
        isFeatured: p.featured,
        collectionId: collection.id,
        position: i,
      })
      .returning();

    await db.insert(productImages).values({
      productId: product.id,
      url: img.url,
      publicId: img.publicId,
      alt: p.name,
      position: 0,
    });

    await db.insert(productVariants).values(
      p.sizes.map((size, idx) => ({
        productId: product.id,
        name: `${size} — ${p.colors[0]}`,
        sku: `${slug}-${slugify(size)}`.toUpperCase(),
        size,
        color: p.colors[0],
        stock: p.category === 'Couture sur Mesure' ? 1 : 8,
        position: idx,
      })),
    );
    console.log(`  ✓ ${p.name} (${p.sizes.length} variantes)`);
  }

  // Events + tiers
  for (const e of EVENTS) {
    console.log(`→ Uploading image for ${e.title}…`);
    const slug = slugify(e.title);
    const img = await upload(e.image, slug, 'sarje/events');
    const [event] = await db
      .insert(events)
      .values({
        slug,
        title: e.title,
        description: e.description,
        location: e.location,
        venue: e.venue,
        startsAt: new Date(e.startsAt),
        imageUrl: img.url,
        imagePublicId: img.publicId,
        status: 'active',
        isFeatured: e.featured,
      })
      .returning();
    await db.insert(ticketTiers).values(
      e.tiers.map((t, idx) => ({
        eventId: event.id,
        name: t.name,
        priceCents: t.price * 100,
        currency: 'USD',
        capacity: t.capacity,
        position: idx,
      })),
    );
    console.log(`  ✓ ${e.title} (${e.tiers.length} tarifs)`);
  }

  // Admin user (idempotent)
  const adminEmail = 'saradiabeauduy04@gmail.com';
  const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, adminEmail) });
  if (!existing) {
    const tempPassword = randomBytes(9).toString('base64url');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    await db.insert(users).values({
      email: adminEmail,
      passwordHash,
      firstName: 'Sarje',
      lastName: 'Admin',
      role: 'admin',
    });
    console.log(`\n🔑 ADMIN CREATED\n   email:    ${adminEmail}\n   password: ${tempPassword}\n   → change this after first login.\n`);
  } else {
    console.log(`\n(admin ${adminEmail} already exists — skipped)`);
  }

  console.log('✅ Seed complete.');
  process.exit(0);
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
