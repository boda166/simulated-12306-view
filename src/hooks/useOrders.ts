import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { CustomOrder } from '@/types/customOrder';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  selected_color?: string;
  selected_handle?: string;
  custom_name?: string;
  products?: {
    name: string;
    image_url: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  contact_info?: any;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface CreateOrderInput {
  total_amount: number;
  payment_method: string;
  contact_info: any;
  shipping_address: any;
  order_items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    selected_color?: string;
    selected_handle?: string;
    custom_name?: string;
  }>;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isAdmin } = useAuthStore();

  const fetchOrders = useCallback(async (userId?: string) => {
    if (!isAuthenticated && !isAdmin) {
      setOrders([]);
      setCustomOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch regular orders
      let ordersQuery = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Fetch custom orders
      let customOrdersQuery = supabase
        .from('custom_orders')
        .select('*')
        .order('created_at', { ascending: false });

      // If not admin or specific user ID provided, filter by current user
      if (!isAdmin || userId) {
        const targetUserId = userId || user?.id;
        if (targetUserId) {
          ordersQuery = ordersQuery.eq('user_id', targetUserId);
          customOrdersQuery = customOrdersQuery.eq('user_id', targetUserId);
        } else {
          // No user ID available, return empty results
          setOrders([]);
          setCustomOrders([]);
          return;
        }
      }

      const [ordersResponse, customOrdersResponse] = await Promise.all([
        ordersQuery,
        customOrdersQuery
      ]);

      if (ordersResponse.error) {
        console.error('Orders error:', ordersResponse.error);
        throw ordersResponse.error;
      }

      if (customOrdersResponse.error) {
        console.error('Custom orders error:', customOrdersResponse.error);
        throw customOrdersResponse.error;
      }

      setOrders(ordersResponse.data || []);
      setCustomOrders((customOrdersResponse.data || []) as CustomOrder[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
      
      // Only show toast if it's not an auth error
      if (!err?.message?.includes('refresh_token_not_found')) {
        toast.error('Failed to load orders');
      }
      
      setOrders([]);
      setCustomOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, isAdmin]);

  const createOrder = useCallback(async (orderData: CreateOrderInput) => {
    if (!user) {
      toast.error('Please log in to create an order');
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          status: 'pending',
          contact_info: orderData.contact_info,
          shipping_address: orderData.shipping_address,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderData.order_items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.selected_color,
        selected_handle: item.selected_handle,
        custom_name: item.custom_name,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      toast.success('Order created successfully!');
      await fetchOrders();
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    if (!isAdmin) {
      toast.error('Only admins can update order status');
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${status}`);
      await fetchOrders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, fetchOrders]);

  const getOrderById = useCallback(async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error fetching order:', err);
      throw err;
    }
  }, []);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    fetchOrders();

      // Subscribe to real-time changes only if authenticated
    if (user) {
      const channel = supabase
        .channel('order-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: isAdmin ? undefined : `user_id=eq.${user.id}`
          },
          () => {
            console.log('Order change detected');
            fetchOrders();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'custom_orders',
            filter: isAdmin ? undefined : `user_id=eq.${user.id}`
          },
          () => {
            console.log('Custom order change detected');
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAuthenticated, isAdmin, fetchOrders]);

  return {
    orders,
    customOrders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    getOrderById,
    refreshOrders: fetchOrders
  };
};