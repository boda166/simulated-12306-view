import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCart } from '@/hooks/useCart';

// Legacy interface for backwards compatibility
interface CartItem {
  id?: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  selectedColor?: string;
  selectedHandle?: string;
  customName?: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithDatabase: () => Promise<void>;
  getItemCount: () => number;
}

// Legacy store - now acts as a wrapper around the new useCart hook
// This maintains backwards compatibility while new code should use useCart directly
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      isLoading: false,

      addItem: async (newItem: Omit<CartItem, 'id'>) => {
        // This is now handled by the useCart hook
        console.warn('useCartStore.addItem is deprecated. Use useCart hook instead.');
      },

      removeItem: async (productId: string) => {
        console.warn('useCartStore.removeItem is deprecated. Use useCart hook instead.');
      },

      updateQuantity: async (productId: string, quantity: number) => {
        console.warn('useCartStore.updateQuantity is deprecated. Use useCart hook instead.');
      },

      clearCart: async () => {
        console.warn('useCartStore.clearCart is deprecated. Use useCart hook instead.');
      },

      syncWithDatabase: async () => {
        console.warn('useCartStore.syncWithDatabase is deprecated. Use useCart hook instead.');
      },

      getItemCount: () => {
        return get().totalItems;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);