import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomOrder, UpdateCustomOrderInput } from '@/types/customOrder';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useAdminCustomOrders = () => {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuthStore();

  const fetchAllCustomOrders = useCallback(async () => {
    if (!isAdmin) {
      setCustomOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('custom_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to match our CustomOrder type
      const transformedData = (data || []).map(item => ({
        ...item,
        personalization_details: item.personalization_details as any
      })) as CustomOrder[];

      setCustomOrders(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch custom orders';
      setError(errorMessage);
      logger.error('Error fetching admin custom orders');
      toast.error('Failed to load custom orders');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const convertToOrder = useCallback(async (customOrder: CustomOrder) => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    if (!customOrder.final_price) {
      toast.error('Please set a final price before converting to order');
      return;
    }

    try {
      setIsLoading(true);

      // Create a regular order from the custom order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: customOrder.user_id,
          total_amount: customOrder.final_price,
          status: 'pending',
          payment_method: 'custom_order',
          contact_info: {
            note: `Custom order: ${customOrder.product_name}`
          } as any,
          shipping_address: {
            delivery_date: customOrder.delivery_date,
            personalization: customOrder.personalization_details
          } as any
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Link the custom order to the regular order
      const { error: updateError } = await supabase
        .from('custom_orders')
        .update({ 
          converted_order_id: order.id,
          status: 'in_production'
        })
        .eq('id', customOrder.id);

      if (updateError) throw updateError;

      toast.success('Custom order converted to regular order!');
      await fetchAllCustomOrders();
      return order;
    } catch (err) {
      logger.error('Error converting custom order');
      toast.error('Failed to convert custom order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, fetchAllCustomOrders]);

  const updateCustomOrderStatus = useCallback(async (updateData: UpdateCustomOrderInput) => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare update data with proper type conversion
      const updatePayload = {
        ...updateData,
        personalization_details: updateData.personalization_details ? 
          updateData.personalization_details as any : undefined
      };

      const { data, error } = await supabase
        .from('custom_orders')
        .update(updatePayload)
        .eq('id', updateData.id)
        .select()
        .single();

      if (error) throw error;

      // Transform the response
      const transformedData = {
        ...data,
        personalization_details: data.personalization_details as any
      } as CustomOrder;

      setCustomOrders(prev => 
        prev.map(order => order.id === updateData.id ? transformedData : order)
      );
      toast.success('Custom order updated successfully!');
      return transformedData;
    } catch (err) {
      logger.error('Error updating custom order');
      toast.error('Failed to update custom order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchAllCustomOrders();

    // Set up real-time subscription for all orders
    const channel = supabase
      .channel('admin-custom-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_orders'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const transformedData = {
              ...payload.new,
              personalization_details: payload.new.personalization_details as any
            } as CustomOrder;
            setCustomOrders(prev => [transformedData, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const transformedData = {
              ...payload.new,
              personalization_details: payload.new.personalization_details as any
            } as CustomOrder;
            setCustomOrders(prev =>
              prev.map(order =>
                order.id === payload.new.id ? transformedData : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCustomOrders(prev =>
              prev.filter(order => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllCustomOrders]);

  return {
    customOrders,
    isLoading,
    error,
    convertToOrder,
    updateCustomOrderStatus,
    refreshCustomOrders: fetchAllCustomOrders
  };
};