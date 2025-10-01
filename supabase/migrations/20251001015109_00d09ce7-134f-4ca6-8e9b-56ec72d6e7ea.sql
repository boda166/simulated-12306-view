-- Add shipping and tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN tracking_number TEXT,
ADD COLUMN carrier TEXT,
ADD COLUMN shipping_status TEXT DEFAULT 'pending',
ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;

-- Add check constraint for shipping status
ALTER TABLE public.orders 
ADD CONSTRAINT orders_shipping_status_check 
CHECK (shipping_status IN ('pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'returned'));

-- Add index for tracking queries
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX idx_orders_shipping_status ON public.orders(shipping_status);