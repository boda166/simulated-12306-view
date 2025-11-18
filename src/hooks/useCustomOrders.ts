import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomOrder, CreateCustomOrderInput, UpdateCustomOrderInput } from '@/types/customOrder';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useCustomOrders = () => {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchCustomOrders = useCallback(async () => {
    if (!user) {
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
        .eq('user_id', user.id)
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
      logger.error('Error fetching custom orders');
      toast.error('Failed to load custom orders');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createCustomOrder = useCallback(async (orderData: CreateCustomOrderInput) => {
    if (!user) {
      toast.error('Please log in to create custom orders');
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('custom_orders')
        .insert([{
          ...orderData,
          user_id: user.id,
          personalization_details: orderData.personalization_details as any
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform the response
      const transformedData = {
        ...data,
        personalization_details: data.personalization_details as any
      } as CustomOrder;

      setCustomOrders(prev => [transformedData, ...prev]);
      toast.success('Custom order submitted successfully!');
      return transformedData;
    } catch (err) {
      logger.error('Error creating custom order');
      toast.error('Failed to submit custom order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateCustomOrder = useCallback(async (updateData: UpdateCustomOrderInput) => {
    if (!user) {
      toast.error('Please log in to update custom orders');
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
        .eq('user_id', user.id)
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
  }, [user]);

  const getCustomOrderById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('custom_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        personalization_details: data.personalization_details as any
      } as CustomOrder;
    } catch (err) {
      logger.error('Error fetching custom order');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCustomOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('custom-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_orders',
          filter: `user_id=eq.${user?.id}`
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
  }, [fetchCustomOrders, user?.id]);

  return {
    customOrders,
    isLoading,
    error,
    createCustomOrder,
    updateCustomOrder,
    getCustomOrderById,
    refreshCustomOrders: fetchCustomOrders
  };
};