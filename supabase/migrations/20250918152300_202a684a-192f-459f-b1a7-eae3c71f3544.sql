-- Create custom orders table for personalized product requests
CREATE TABLE public.custom_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  personalization_details JSONB NOT NULL, -- Store custom name, special requests, etc.
  preferred_colors TEXT[],
  preferred_handles TEXT[],
  budget_range TEXT,
  delivery_date DATE,
  reference_images TEXT[], -- URLs to reference images if provided
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_review, approved, in_production, completed, cancelled
  admin_notes TEXT,
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on custom orders
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own custom orders
CREATE POLICY "Users can view own custom orders" 
ON public.custom_orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own custom orders
CREATE POLICY "Users can create own custom orders" 
ON public.custom_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom orders (only when status is pending)
CREATE POLICY "Users can update own pending custom orders" 
ON public.custom_orders 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Admins can view all custom orders
CREATE POLICY "Admins can view all custom orders" 
ON public.custom_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all custom orders
CREATE POLICY "Admins can update all custom orders" 
ON public.custom_orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_custom_orders_updated_at
BEFORE UPDATE ON public.custom_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for user queries
CREATE INDEX idx_custom_orders_user_id ON public.custom_orders(user_id);
CREATE INDEX idx_custom_orders_status ON public.custom_orders(status);