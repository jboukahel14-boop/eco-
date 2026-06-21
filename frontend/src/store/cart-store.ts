import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import { api } from '@/lib/api';

interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  setOpen: (open: boolean) => void;
  toggle: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number, attributes?: Record<string, string>) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      count: 0,
      isOpen: false,
      isLoading: false,
      error: null,

      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.getCart();
          set({
            items: res.data.items,
            total: res.data.total,
            count: res.data.count,
            isLoading: false,
          });
        } catch (e) {
          set({ isLoading: false, error: (e as Error).message });
        }
      },

      addItem: async (productId, quantity = 1, attributes) => {
        try {
          set({ isLoading: true, error: null });
          await api.addToCart(productId, quantity, attributes);
          await get().fetchCart();
        } catch (e) {
          set({ isLoading: false, error: (e as Error).message });
          throw e;
        }
      },

      updateQuantity: async (itemId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.updateCartItem(itemId, quantity);
          set({
            items: res.data.items,
            total: res.data.total,
            count: res.data.count,
            isLoading: false,
          });
        } catch (e) {
          set({ isLoading: false, error: (e as Error).message });
        }
      },

      removeItem: async (itemId) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.removeCartItem(itemId);
          set({
            items: res.data.items,
            total: res.data.total,
            count: res.data.count,
            isLoading: false,
          });
        } catch (e) {
          set({ isLoading: false, error: (e as Error).message });
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          await api.clearCart();
          set({ items: [], total: 0, count: 0, isLoading: false });
        } catch (e) {
          set({ isLoading: false, error: (e as Error).message });
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        count: state.count,
      }),
    }
  )
);
