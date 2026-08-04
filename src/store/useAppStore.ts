import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Ticket {
  id: string; // Unique ticket ID
  eventId: string;
  eventTitle: string;
  date: string;
  location: string;
  tierId: string;
  tierName: string;
  buyerName: string;
  used: boolean;
  purchaseDate: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

interface AppState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  
  orders: Order[];
  addOrder: (order: Order) => void;
  
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  markTicketUsed: (ticketId: string) => boolean;
  
  user: {
    name: string;
    email: string;
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (item) => set((state) => {
        // Check if identical item exists
        const existingIndex = state.cart.findIndex(
          (c) => c.product.id === item.product.id && 
                 c.selectedSize === item.selectedSize && 
                 c.selectedColor === item.selectedColor
        );
        if (existingIndex >= 0) {
          const newCart = [...state.cart];
          newCart[existingIndex].quantity += item.quantity;
          return { cart: newCart };
        }
        return { cart: [...state.cart, item] };
      }),
      removeFromCart: (index) => set((state) => ({
        cart: state.cart.filter((_, i) => i !== index)
      })),
      updateQuantity: (index, quantity) => set((state) => {
        const newCart = [...state.cart];
        newCart[index].quantity = quantity;
        return { cart: newCart };
      }),
      clearCart: () => set({ cart: [] }),
      
      orders: [],
      addOrder: (order) => set((state) => ({
        orders: [order, ...state.orders]
      })),
      
      tickets: [],
      addTicket: (ticket) => set((state) => ({
        tickets: [ticket, ...state.tickets]
      })),
      markTicketUsed: (ticketId) => {
        let success = false;
        set((state) => {
          const ticketIndex = state.tickets.findIndex(t => t.id === ticketId);
          if (ticketIndex === -1) return state;
          
          if (!state.tickets[ticketIndex].used) {
            success = true;
            const newTickets = [...state.tickets];
            newTickets[ticketIndex] = { ...newTickets[ticketIndex], used: true };
            return { tickets: newTickets };
          }
          return state;
        });
        return success;
      },
      
      user: {
        name: "Marie Dubois",
        email: "marie.dubois@example.com"
      }
    }),
    {
      name: 'sarje-storage', // name of the item in the storage (must be unique)
    }
  )
);
