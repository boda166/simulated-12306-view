-- Add stock quantity field to products table
ALTER TABLE public.products 
ADD COLUMN stock_quantity integer NOT NULL DEFAULT 10;

-- Create function to update stock when order status changes
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Only reduce stock when order status changes from pending/processing to shipped/delivered
  IF (OLD.status IN ('pending', 'processing') AND NEW.status IN ('shipped', 'delivered')) THEN
    -- Reduce stock for each item in the order
    UPDATE public.products 
    SET stock_quantity = stock_quantity - oi.quantity,
        in_stock = CASE 
          WHEN stock_quantity - oi.quantity <= 0 THEN false 
          ELSE true 
        END
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id 
    AND products.id = oi.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically update stock when order status changes
CREATE TRIGGER update_stock_on_order_completion
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_stock();