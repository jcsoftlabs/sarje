'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  products,
  productVariants,
  productImages,
  collections,
  shippingMethods,
  orders,
  events,
  ticketTiers,
} from '@/db/schema';
import { requireAdmin } from '@/lib/auth/admin';

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uniqueSlug(base: string, table: 'products' | 'collections') {
  const t = table === 'products' ? products : collections;
  let slug = base || 'item';
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.select({ id: t.id }).from(t).where(eq(t.slug, slug)).limit(1);
    if (existing.length === 0) return slug;
    slug = `${base}-${i++}`;
  }
}

export interface ActionState {
  ok?: boolean;
  error?: string;
}

const toCents = (v: FormDataEntryValue | null) => Math.round(parseFloat(String(v ?? '0')) * 100);
const toInt = (v: FormDataEntryValue | null) => parseInt(String(v ?? '0'), 10) || 0;

/* ─── Products ───────────────────────────────────────────────────── */
export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const schema = z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1),
    category: z.string().trim().min(1),
    description: z.string().trim().optional(),
    price: z.number().nonnegative(),
    status: z.enum(['draft', 'active', 'archived']),
    isFeatured: z.boolean(),
  });
  const parsed = schema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description') || undefined,
    price: parseFloat(String(formData.get('price') ?? '')),
    status: formData.get('status'),
    isFeatured: formData.get('isFeatured') === 'on',
  });
  if (!parsed.success) return { error: 'Champs produit invalides.' };
  const p = parsed.data;

  await db
    .update(products)
    .set({
      name: p.name,
      category: p.category,
      description: p.description ?? null,
      priceCents: Math.round(p.price * 100),
      status: p.status,
      isFeatured: p.isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(products.id, p.id));

  // Variant stock — fields named stock-<variantId>.
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('stock-')) {
      const variantId = key.slice(6);
      await db.update(productVariants).set({ stock: toInt(value) }).where(eq(productVariants.id, variantId));
    }
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${p.id}`);
  return { ok: true };
}

/* ─── Orders ─────────────────────────────────────────────────────── */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  const allowed = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'] as const;
  if (!id || !(allowed as readonly string[]).includes(status)) return;
  await db.update(orders).set({ status: status as (typeof allowed)[number], updatedAt: new Date() }).where(eq(orders.id, id));
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
}

/* ─── Events & tiers ─────────────────────────────────────────────── */
export async function updateEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Événement introuvable.' };

  const name = String(formData.get('title') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const startsAtRaw = String(formData.get('startsAt') ?? '');
  const status = String(formData.get('status') ?? 'active') as 'draft' | 'active' | 'archived';
  if (!name || !location) return { error: 'Titre et lieu requis.' };

  await db
    .update(events)
    .set({
      title: name,
      location,
      startsAt: startsAtRaw ? new Date(startsAtRaw) : undefined,
      status,
      isFeatured: formData.get('isFeatured') === 'on',
      updatedAt: new Date(),
    })
    .where(eq(events.id, id));

  // Tiers — price-<tierId> and capacity-<tierId>.
  const tierIds = new Set<string>();
  for (const key of formData.keys()) {
    if (key.startsWith('price-')) tierIds.add(key.slice(6));
    if (key.startsWith('capacity-')) tierIds.add(key.slice(9));
  }
  for (const tid of tierIds) {
    await db
      .update(ticketTiers)
      .set({ priceCents: toCents(formData.get(`price-${tid}`)), capacity: toInt(formData.get(`capacity-${tid}`)) })
      .where(eq(ticketTiers.id, tid));
  }

  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${id}`);
  return { ok: true };
}

/* ─── Product creation, images & variants ────────────────────────── */
export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const price = parseFloat(String(formData.get('price') ?? ''));
  if (!name || !category || !(price >= 0)) return { error: 'Nom, catégorie et prix requis.' };

  const slug = await uniqueSlug(slugify(name), 'products');
  const [created] = await db
    .insert(products)
    .values({ slug, name, category, priceCents: Math.round(price * 100), status: 'draft' })
    .returning();

  revalidatePath('/admin/products');
  redirect(`/admin/products/${created.id}`);
}

export async function addProductImage(productId: string, url: string, publicId: string): Promise<void> {
  await requireAdmin();
  const count = await db.select({ id: productImages.id }).from(productImages).where(eq(productImages.productId, productId));
  await db.insert(productImages).values({ productId, url, publicId, position: count.length });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(imageId: string, productId: string): Promise<void> {
  await requireAdmin();
  await db.delete(productImages).where(eq(productImages.id, imageId));
  revalidatePath(`/admin/products/${productId}`);
}

export async function addVariant(productId: string, data: { size: string; color: string; sku: string; stock: number; price?: number }): Promise<void> {
  await requireAdmin();
  const count = await db.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, productId));
  const label = [data.size, data.color].filter(Boolean).join(' — ') || 'Variante';
  await db.insert(productVariants).values({
    productId,
    name: label,
    size: data.size || null,
    color: data.color || null,
    sku: data.sku || null,
    stock: Number.isFinite(data.stock) ? data.stock : 0,
    priceCents: data.price ? Math.round(data.price * 100) : null,
    position: count.length,
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(variantId: string, productId: string): Promise<void> {
  await requireAdmin();
  await db.delete(productVariants).where(eq(productVariants.id, variantId));
  revalidatePath(`/admin/products/${productId}`);
}

export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(productImages).set({ position: index }).where(eq(productImages.id, id)),
    ),
  );
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (id) await db.delete(products).where(eq(products.id, id));
  revalidatePath('/admin/products');
  redirect('/admin/products');
}

/* ─── Collections (categories) ───────────────────────────────────── */
export async function createCollection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Nom requis.' };
  const slug = await uniqueSlug(slugify(name), 'collections');
  const [created] = await db.insert(collections).values({ slug, name }).returning();
  revalidatePath('/admin/categories');
  redirect(`/admin/categories/${created.id}`);
}

export async function updateCollection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!id || !name) return { error: 'Nom requis.' };
  const heroImageUrl = String(formData.get('heroImageUrl') ?? '') || null;
  const heroImagePublicId = String(formData.get('heroImagePublicId') ?? '') || null;
  await db
    .update(collections)
    .set({
      name,
      description: String(formData.get('description') ?? '') || null,
      heroImageUrl,
      heroImagePublicId,
      isFeatured: formData.get('isFeatured') === 'on',
      updatedAt: new Date(),
    })
    .where(eq(collections.id, id));
  revalidatePath('/admin/categories');
  revalidatePath(`/admin/categories/${id}`);
  return { ok: true };
}

export async function deleteCollection(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (id) await db.delete(collections).where(eq(collections.id, id));
  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

/* ─── Shipping methods ───────────────────────────────────────────── */
export async function saveShippingMethod(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;
  // Normalize country zone: uppercase ISO codes, comma-separated (empty = worldwide).
  const countriesRaw = String(formData.get('countries') ?? '').trim();
  const countries = countriesRaw
    ? Array.from(
        new Set(
          countriesRaw
            .split(/[,\s]+/)
            .map((c) => c.trim().toUpperCase())
            .filter(Boolean),
        ),
      ).join(',')
    : null;

  const values = {
    name,
    description: String(formData.get('description') ?? '') || null,
    priceCents: toCents(formData.get('price')),
    freeOverCents: formData.get('freeOver') ? toCents(formData.get('freeOver')) : null,
    minDays: formData.get('minDays') ? toInt(formData.get('minDays')) : null,
    maxDays: formData.get('maxDays') ? toInt(formData.get('maxDays')) : null,
    countries,
    minSubtotalCents: formData.get('minSubtotal') ? toCents(formData.get('minSubtotal')) : null,
    maxSubtotalCents: formData.get('maxSubtotal') ? toCents(formData.get('maxSubtotal')) : null,
    active: formData.get('active') === 'on',
  };
  if (id) {
    await db.update(shippingMethods).set({ ...values, updatedAt: new Date() }).where(eq(shippingMethods.id, id));
  } else {
    await db.insert(shippingMethods).values(values);
  }
  revalidatePath('/admin/shipping');
}

export async function deleteShippingMethod(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (id) await db.delete(shippingMethods).where(eq(shippingMethods.id, id));
  revalidatePath('/admin/shipping');
}
