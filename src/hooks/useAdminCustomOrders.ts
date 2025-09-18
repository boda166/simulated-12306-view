import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomOrder, UpdateCustomOrderInput } from '@/types/customOrder';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

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
      console.error('Error fetching admin custom orders:', err);
      toast.error('Failed to load custom orders');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

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
      console.error('Error updating custom order:', err);
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
    updateCustomOrderStatus,
    refreshCustomOrders: fetchAllCustomOrders
  };
};