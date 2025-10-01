-- Add link between custom orders and regular orders
ALTER TABLE public.custom_orders ADD COLUMN converted_order_id UUID REFERENCES public.orders(id);

-- Add index for better performance
CREATE INDEX idx_custom_orders_converted_order_id ON public.custom_orders(converted_order_id);