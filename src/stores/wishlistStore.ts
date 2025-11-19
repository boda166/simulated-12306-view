import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';
import { logger } from '@/utils/logger';

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  syncWithDatabase: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addToWishlist: async (productId: string) => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          throw new Error('You must be logged in to add items to wishlist');
        }

        try {
          set({ isLoading: true });
          
          await supabase
            .from('wishlists')
            .insert({
              user_id: user.id,
              product_id: productId,
            });

          await get().syncWithDatabase();
        } catch (error) {
          logger.error('Error adding to wishlist:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromWishlist: async (productId: string) => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          throw new Error('You must be logged in to remove items from wishlist');
        }

        try {
          set({ isLoading: true });
          
          await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

          await get().syncWithDatabase();
        } catch (error) {
          logger.error('Error removing from wishlist:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some(item => item.productId === productId);
      },

      syncWithDatabase: async () => {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          set({ items: [] });
          return;
        }

        try {
          const { data: wishlistItems } = await supabase
            .from('wishlists')
            .select(`
              id,
              product_id,
              products!inner (
                name,
                price,
                image_url,
                images
              )
            `)
            .eq('user_id', user.id);

          if (wishlistItems) {
            const formattedItems: WishlistItem[] = wishlistItems.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              productName: item.products?.name || 'Unknown Product',
              productPrice: item.products?.price || 0,
              productImage: item.products?.image_url || item.products?.images?.[0] || '',
            }));

            set({ items: formattedItems });
          }
        } catch (error) {
          logger.error('Error syncing wishlist with database:', error);
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);