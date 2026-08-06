import 'server-only';
import { db } from '@/db';
import { desc, asc, eq } from 'drizzle-orm';
import { products, events, collections } from '@/db/schema';

/* ─── Products ───────────────────────────────────────────────────── */
export async function getFeaturedProducts(limit = 6) {
  return db.query.products.findMany({
    where: eq(products.status, 'active'),
    orderBy: [desc(products.isFeatured), asc(products.position)],
    limit,
    with: { images: { orderBy: (i, { asc }) => [asc(i.position)] } },
  });
}

export async function getAllProducts() {
  return db.query.products.findMany({
    where: eq(products.status, 'active'),
    orderBy: [asc(products.position)],
    with: { images: { orderBy: (i, { asc }) => [asc(i.position)] } },
  });
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.position)] },
      variants: { orderBy: (v, { asc }) => [asc(v.position)] },
      collection: true,
    },
  });
}

export async function getRelatedProducts(category: string, excludeSlug: string, limit = 3) {
  const rows = await db.query.products.findMany({
    where: (p, { eq, and, ne }) =>
      and(eq(p.category, category), eq(p.status, 'active'), ne(p.slug, excludeSlug)),
    limit,
    with: { images: { orderBy: (i, { asc }) => [asc(i.position)] } },
  });
  return rows;
}

/* ─── Collections ────────────────────────────────────────────────── */
export async function getCollections() {
  return db.query.collections.findMany({
    orderBy: [asc(collections.position)],
  });
}

/* ─── Events ─────────────────────────────────────────────────────── */
export async function getFeaturedEvents(limit = 3) {
  return db.query.events.findMany({
    where: eq(events.status, 'active'),
    orderBy: [asc(events.startsAt)],
    limit,
    with: { tiers: { orderBy: (t, { asc }) => [asc(t.position)] } },
  });
}

export async function getAllEvents() {
  return db.query.events.findMany({
    where: eq(events.status, 'active'),
    orderBy: [asc(events.startsAt)],
    with: { tiers: { orderBy: (t, { asc }) => [asc(t.position)] } },
  });
}

export async function getEventBySlug(slug: string) {
  return db.query.events.findFirst({
    where: eq(events.slug, slug),
    with: { tiers: { orderBy: (t, { asc }) => [asc(t.position)] } },
  });
}

export type ProductWithImages = Awaited<ReturnType<typeof getFeaturedProducts>>[number];
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type EventWithTiers = Awaited<ReturnType<typeof getFeaturedEvents>>[number];
