import 'server-only';
import { desc, sql, eq } from 'drizzle-orm';
import { db } from '@/db';
import { products, orders, events, users, orderItems, tickets } from '@/db/schema';

export async function getDashboardStats() {
  const [[prod], [ord], [rev], [evt], [cust]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(products),
    db.select({ n: sql<number>`count(*)::int` }).from(orders),
    db.select({ n: sql<number>`coalesce(sum(total_cents),0)::int` }).from(orders).where(eq(orders.status, 'paid')),
    db.select({ n: sql<number>`count(*)::int` }).from(events),
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.role, 'customer')),
  ]);
  return {
    products: prod.n,
    orders: ord.n,
    revenueCents: rev.n,
    events: evt.n,
    customers: cust.n,
  };
}

export async function getAdminProducts() {
  return db.query.products.findMany({
    orderBy: [desc(products.isFeatured), products.position],
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.position)], limit: 1 },
      variants: true,
    },
  });
}

export async function getAdminProduct(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.position)] },
      variants: { orderBy: (v, { asc }) => [asc(v.position)] },
    },
  });
}

export async function getAdminOrders() {
  return db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
    limit: 100,
  });
}

export async function getAdminOrder(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, tickets: { with: { event: true, tier: true } } },
  });
}

export async function getAdminEvents() {
  return db.query.events.findMany({
    orderBy: [events.startsAt],
    with: { tiers: { orderBy: (t, { asc }) => [asc(t.position)] } },
  });
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;
export type AdminOrderRow = Awaited<ReturnType<typeof getAdminOrders>>[number];
export type AdminEvent = Awaited<ReturnType<typeof getAdminEvents>>[number];

export { orderItems, tickets };
