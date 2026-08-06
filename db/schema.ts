import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/* ─── Enums ──────────────────────────────────────────────────────── */
export const roleEnum = pgEnum('role', ['customer', 'admin']);
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived']);
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'fulfilled',
  'cancelled',
  'refunded',
]);
export const ticketStatusEnum = pgEnum('ticket_status', ['valid', 'used', 'cancelled']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

/* ─── Users & Addresses ──────────────────────────────────────────── */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: roleEnum('role').notNull().default('customer'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  ...timestamps,
});

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  label: text('label'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  region: text('region'),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull().default('US'),
  phone: text('phone'),
  isDefault: boolean('is_default').notNull().default(false),
  ...timestamps,
});

/* ─── Catalog ────────────────────────────────────────────────────── */
export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  heroImageUrl: text('hero_image_url'),
  heroImagePublicId: text('hero_image_public_id'),
  position: integer('position').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  ...timestamps,
});

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    details: text('details'),
    // Money stored as integer cents, currency ISO code.
    priceCents: integer('price_cents').notNull(),
    compareAtCents: integer('compare_at_cents'),
    currency: text('currency').notNull().default('USD'),
    status: productStatusEnum('status').notNull().default('active'),
    isFeatured: boolean('is_featured').notNull().default(false),
    collectionId: uuid('collection_id').references(() => collections.id, {
      onDelete: 'set null',
    }),
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('products_status_idx').on(t.status), index('products_category_idx').on(t.category)],
);

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  publicId: text('public_id'),
  alt: text('alt'),
  position: integer('position').notNull().default(0),
});

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g. "Taille 38 — Magenta"
    sku: text('sku'),
    size: text('size'),
    color: text('color'),
    priceCents: integer('price_cents'), // null → inherits product price
    stock: integer('stock').notNull().default(0),
    position: integer('position').notNull().default(0),
  },
  (t) => [uniqueIndex('variants_sku_idx').on(t.sku)],
);

/* ─── Events & Tickets ───────────────────────────────────────────── */
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location').notNull(),
  venue: text('venue'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  imageUrl: text('image_url'),
  imagePublicId: text('image_public_id'),
  status: productStatusEnum('status').notNull().default('active'),
  isFeatured: boolean('is_featured').notNull().default(false),
  ...timestamps,
});

export const ticketTiers = pgTable('ticket_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  currency: text('currency').notNull().default('USD'),
  capacity: integer('capacity').notNull().default(0),
  sold: integer('sold').notNull().default(0),
  position: integer('position').notNull().default(0),
});

/* ─── Orders ─────────────────────────────────────────────────────── */
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').notNull().unique(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    status: orderStatusEnum('status').notNull().default('pending'),
    subtotalCents: integer('subtotal_cents').notNull(),
    shippingCents: integer('shipping_cents').notNull().default(0),
    taxCents: integer('tax_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),
    currency: text('currency').notNull().default('USD'),
    shippingAddress: jsonb('shipping_address'),
    // Square payment linkage
    squarePaymentId: text('square_payment_id'),
    squareOrderId: text('square_order_id'),
    ...timestamps,
  },
  (t) => [index('orders_user_idx').on(t.userId), index('orders_status_idx').on(t.status)],
);

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  // Nullable references — an item is either a product or a ticket.
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
  tierId: uuid('tier_id').references(() => ticketTiers.id, { onDelete: 'set null' }),
  kind: text('kind').notNull().default('product'), // 'product' | 'ticket'
  nameSnapshot: text('name_snapshot').notNull(),
  imageSnapshot: text('image_snapshot'),
  unitPriceCents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull().default(1),
});

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  tierId: uuid('tier_id').references(() => ticketTiers.id, { onDelete: 'set null' }),
  attendeeName: text('attendee_name'),
  status: ticketStatusEnum('status').notNull().default('valid'),
  usedAt: timestamp('used_at', { withTimezone: true }),
  ...timestamps,
});

/* ─── Relations ──────────────────────────────────────────────────── */
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  variants: many(productVariants),
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  tiers: many(ticketTiers),
}));

export const ticketTiersRelations = relations(ticketTiers, ({ one }) => ({
  event: one(events, { fields: [ticketTiers.eventId], references: [events.id] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  tickets: many(tickets),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
