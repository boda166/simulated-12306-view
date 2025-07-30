import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/lib/api';

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => 
              item.productId === newItem.productId &&
              item.selectedColor === newItem.selectedColor &&
              item.selectedHandle === newItem.selectedHandle &&
              item.customName === newItem.customName
          );

          let updatedItems;
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            updatedItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          } else {
            // Add new item
            updatedItems = [...state.items, newItem];
          }

          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            items: updatedItems,
            totalItems,
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.productId !== productId);
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            items: updatedItems,
            totalItems,
          };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          );
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            items: updatedItems,
            totalItems,
          };
        });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalAmount: 0 });
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