import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductDisplay, transformProduct } from '@/types/product';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProducts = (data || []).map(transformProduct);
      setProducts(transformedProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: string): Promise<ProductDisplay | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return transformProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      return null;
    }
  }, []);

  const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      const newProduct = transformProduct(data);
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Product created successfully');
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct = transformProduct(data);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success('Product updated successfully');
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateProductStock = useCallback(async (productId: string, stockData: { stock_quantity: number; in_stock: boolean }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          stock_quantity: stockData.stock_quantity,
          in_stock: stockData.in_stock
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct = transformProduct(data);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      toast.success('Stock updated successfully');
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newProduct = transformProduct(payload.new as Product);
            setProducts(prev => [newProduct, ...prev]);
            toast.success('New product added');
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedProduct = transformProduct(payload.new as Product);
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setProducts(prev => prev.filter(p => p.id !== payload.old?.id));
            toast.info('Product removed');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    refreshProducts: fetchProducts
  };
};