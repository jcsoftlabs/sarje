import 'server-only';
import { db } from '@/db';
import { desc, asc, eq } from 'drizzle-orm';
import { products, events, collections, orders, shippingMethods, users, addresses } from '@/db/schema';

// Public browsing pages must stay up even if the database is unreachable:
// degrade to empty data instead of throwing (which would crash the page).
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error('[query] database unavailable, serving fallback:', e);
    return fallback;
  }
}

export async function getAdminEmails(): Promise<string[]> {
  const rows = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'));
  return rows.map((r) => r.email);
}

export async function getAddressesForUser(userId: string) {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
}
export type SavedAddress = Awaited<ReturnType<typeof getAddressesForUser>>[number];

export async function getActiveShippingMethods() {
  return db.query.shippingMethods.findMany({
    where: eq(shippingMethods.active, true),
    orderBy: [asc(shippingMethods.position), asc(shippingMethods.priceCents)],
  });
}
export type ShippingMethod = Awaited<ReturnType<typeof getActiveShippingMethods>>[number];

/* ─── Products ───────────────────────────────────────────────────── */
export async function getFeaturedProducts(limit = 6) {
  return safe(
    () =>
      db.query.products.findMany({
        where: eq(products.status, 'active'),
        orderBy: [desc(products.isFeatured), asc(products.position)],
        limit,
        with: { images: { orderBy: (i, { asc }) => [asc(i.position)] } },
      }),
    [],
  );
}

export async function getAllProducts() {
  return safe(
    () =>
      db.query.products.findMany({
        where: eq(products.status, 'active'),
        orderBy: [asc(products.position)],
        with: { images: { orderBy: (i, { asc }) => [asc(i.position)] } },
      }),
    [],
  );
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
  return safe(() => db.query.collections.findMany({ orderBy: [asc(collections.position)] }), []);
}

/* ─── Events ─────────────────────────────────────────────────────── */
export async function getFeaturedEvents(limit = 3) {
  return safe(
    () =>
      db.query.events.findMany({
        where: eq(events.status, 'active'),
        orderBy: [asc(events.startsAt)],
        limit,
        with: { tiers: { orderBy: (t, { asc }) => [asc(t.position)] } },
      }),
    [],
  );
}

export async function getAllEvents() {
  return safe(
    () =>
      db.query.events.findMany({
        where: eq(events.status, 'active'),
        orderBy: [asc(events.startsAt)],
        with: { tiers: { orderBy: (t, { asc }) => [asc(t.position)] } },
      }),
    [],
  );
}

export async function getEventBySlug(slug: string) {
  return db.query.events.findFirst({
    where: eq(events.slug, slug),
    with: { tiers: { orderBy: (t, { asc }) => [asc(t.position)] } },
  });
}

/* ─── Orders (account) ───────────────────────────────────────────── */
export async function getOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: {
      items: true,
      tickets: { with: { event: true, tier: true } },
    },
  });
}
export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderByNumber>>>;

export async function getTicketsForUser(userId: string) {
  const userOrders = db.select({ id: orders.id }).from(orders).where(eq(orders.userId, userId));
  return db.query.tickets.findMany({
    where: (t, { inArray }) => inArray(t.orderId, userOrders),
    with: { event: true, tier: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}
export type UserTicket = Awaited<ReturnType<typeof getTicketsForUser>>[number];

export async function getOrdersForUser(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: { items: true, tickets: true },
  });
}

export type ProductWithImages = Awaited<ReturnType<typeof getFeaturedProducts>>[number];
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type EventWithTiers = Awaited<ReturnType<typeof getFeaturedEvents>>[number];
