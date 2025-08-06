import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { CartItemDisplay, AddCartItemInput, UpdateCartItemInput, CartSummary, transformCartItem, calculateCartSummary } from '@/types/cart';
import { toast } from 'sonner';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  // Calculate cart summary
  const cartSummary: CartSummary = calculateCartSummary(cartItems);

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            name,
            price,
            image_url,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedItems = (data || []).map(transformCartItem);
      setCartItems(transformedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart items';
      setError(errorMessage);
      console.error('Error fetching cart:', err);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addItem = useCallback(async (item: AddCartItemInput) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      setIsLoading(true);

      // Check if item with same configuration already exists
      const existingItem = cartItems.find(cartItem => 
        cartItem.productId === item.productId &&
        cartItem.selectedColor === item.selectedColor &&
        cartItem.selectedHandle === item.selectedHandle &&
        cartItem.customName === item.customName
      );

      if (existingItem) {
        // Update quantity of existing item
        await updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: item.productId,
            quantity: item.quantity,
            selected_color: item.selectedColor,
            selected_handle: item.selectedHandle,
            custom_name: item.customName,
          });

        if (error) throw error;
        
        await fetchCartItems();
        toast.success('Item added to cart');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, cartItems, fetchCartItems]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;

      // Update local state optimistically
      setCartItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, quantity, totalPrice: item.productPrice * quantity }
          : item
      ));

      toast.success('Quantity updated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity';
      toast.error(errorMessage);
      // Refresh on error to get correct state
      await fetchCartItems();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const updateItem = useCallback(async (updates: UpdateCartItemInput) => {
    try {
      setIsLoading(true);

      const updateData: any = {};
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.selectedColor !== undefined) updateData.selected_color = updates.selectedColor;
      if (updates.selectedHandle !== undefined) updateData.selected_handle = updates.selectedHandle;
      if (updates.customName !== undefined) updateData.custom_name = updates.customName;

      const { error } = await supabase
        .from('cart_items')
        .update(updateData)
        .eq('id', updates.id);

      if (error) throw error;

      await fetchCartItems();
      toast.success('Cart item updated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const removeItem = useCallback(async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state optimistically
      setCartItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      toast.error(errorMessage);
      // Refresh on error to get correct state
      await fetchCartItems();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCartItems]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCartItems([]);
      toast.success('Cart cleared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }

    fetchCartItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Cart change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            fetchCartItems(); // Refetch to get product data
          } else if (payload.eventType === 'UPDATE') {
            fetchCartItems(); // Refetch to get updated product data
          } else if (payload.eventType === 'DELETE') {
            setCartItems(prev => prev.filter(item => item.id !== payload.old?.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCartItems]);

  return {
    cartItems,
    cartSummary,
    isLoading,
    error,
    addItem,
    updateQuantity,
    updateItem,
    removeItem,
    clearCart,
    refreshCart: fetchCartItems,
    // Legacy compatibility methods
    getItemCount: () => cartSummary.totalItems,
    totalItems: cartSummary.totalItems,
    totalAmount: cartSummary.total,
    items: cartItems
  };
};