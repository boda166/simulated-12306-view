import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      isLoading: false,

      addItem: async (newItem: Omit<CartItem, 'id'>) => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          // For non-authenticated users, store in local state only
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
              updatedItems = state.items.map((item, index) =>
                index === existingItemIndex
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              );
            } else {
              updatedItems = [...state.items, { ...newItem, id: `local-${Date.now()}` }];
            }

            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = updatedItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
            
            return {
              items: updatedItems,
              totalItems,
              totalAmount,
            };
          });
          return;
        }

        // For authenticated users, save to database
        try {
          set({ isLoading: true });
          
          // Check if item exists in database
          const { data: existingItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', newItem.productId)
            .eq('selected_color', newItem.selectedColor || '')
            .eq('selected_handle', newItem.selectedHandle || '')
            .eq('custom_name', newItem.customName || '');

          if (existingItems && existingItems.length > 0) {
            // Update existing item
            const existingItem = existingItems[0];
            await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + newItem.quantity })
              .eq('id', existingItem.id);
          } else {
            // Insert new item
            await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: newItem.productId,
                quantity: newItem.quantity,
                selected_color: newItem.selectedColor,
                selected_handle: newItem.selectedHandle,
                custom_name: newItem.customName,
              });
          }

          // Sync with database
          await get().syncWithDatabase();
        } catch (error) {
          console.error('Error adding item to cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (productId: string) => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          // For non-authenticated users
          set((state) => {
            const updatedItems = state.items.filter(item => item.productId !== productId);
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = updatedItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
            
            return {
              items: updatedItems,
              totalItems,
              totalAmount,
            };
          });
          return;
        }

        try {
          set({ isLoading: true });
          
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

          await get().syncWithDatabase();
        } catch (error) {
          console.error('Error removing item from cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        const { user } = useAuthStore.getState();
        
        if (!user) {
          // For non-authenticated users
          set((state) => {
            const updatedItems = state.items.map(item =>
              item.productId === productId ? { ...item, quantity } : item
            );
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = updatedItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
            
            return {
              items: updatedItems,
              totalItems,
              totalAmount,
            };
          });
          return;
        }

        try {
          set({ isLoading: true });
          
          await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('user_id', user.id)
            .eq('product_id', productId);

          await get().syncWithDatabase();
        } catch (error) {
          console.error('Error updating item quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          set({ items: [], totalItems: 0, totalAmount: 0 });
          return;
        }

        try {
          set({ isLoading: true });
          
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          set({ items: [], totalItems: 0, totalAmount: 0 });
        } catch (error) {
          console.error('Error clearing cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncWithDatabase: async () => {
        const { user } = useAuthStore.getState();
        
        if (!user) return;

        try {
          const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
              *,
              products (
                name,
                price,
                image_url
              )
            `)
            .eq('user_id', user.id);

          if (cartItems) {
            const formattedItems: CartItem[] = cartItems.map(item => ({
              id: item.id,
              productId: item.product_id,
              productName: item.products?.name || 'Unknown Product',
              productPrice: item.products?.price || 0,
              productImage: item.products?.image_url || '',
              quantity: item.quantity,
              selectedColor: item.selected_color,
              selectedHandle: item.selected_handle,
              customName: item.custom_name,
            }));

            const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = formattedItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);

            set({
              items: formattedItems,
              totalItems,
              totalAmount,
            });
          }
        } catch (error) {
          console.error('Error syncing cart with database:', error);
        }
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