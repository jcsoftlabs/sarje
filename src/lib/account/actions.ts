'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { addresses } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';

export interface AddressState {
  ok?: boolean;
  error?: string;
}

const schema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  region: z.string().trim().optional(),
  postalCode: z.string().trim().min(1),
  country: z.string().trim().min(1).default('US'),
  phone: z.string().trim().optional(),
});

export async function addAddress(_prev: AddressState, formData: FormData): Promise<AddressState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non authentifié.' };
  const parsed = schema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    line1: formData.get('line1'),
    line2: formData.get('line2') || undefined,
    city: formData.get('city'),
    region: formData.get('region') || undefined,
    postalCode: formData.get('postalCode'),
    country: formData.get('country') || 'US',
    phone: formData.get('phone') || undefined,
  });
  if (!parsed.success) return { error: 'Adresse incomplète.' };
  const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, user.id));
  await db.insert(addresses).values({
    userId: user.id,
    ...parsed.data,
    line2: parsed.data.line2 ?? null,
    region: parsed.data.region ?? null,
    phone: parsed.data.phone ?? null,
    isDefault: existing.length === 0,
  });
  revalidatePath('/profile');
  return { ok: true };
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = String(formData.get('id') ?? '');
  if (id) await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  revalidatePath('/profile');
}

export async function setDefaultAddress(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  await db.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  revalidatePath('/profile');
}
