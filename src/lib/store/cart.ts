'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  currency: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (index: number) => void;
  setQuantity: (index: number, quantity: number) => void;
  clear: () => void;
}

const sameLine = (a: CartItem, b: CartItem) =>
  a.productId === b.productId && a.size === b.size && a.color === b.color;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const idx = state.items.findIndex((i) => sameLine(i, item));
          if (idx >= 0) {
            const items = [...state.items];
            items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
            return { items };
          }
          return { items: [...state.items, item] };
        }),
      remove: (index) => set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
      setQuantity: (index, quantity) =>
        set((state) => {
          const items = [...state.items];
          items[index] = { ...items[index], quantity: Math.max(1, quantity) };
          return { items };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'sarje-cart' },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.priceCents * i.quantity, 0);
