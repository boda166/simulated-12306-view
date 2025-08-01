-- Create wishlist table for logged-in users
CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlist access
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" 
ON public.wishlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" 
ON public.wishlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_wishlists_updated_at
BEFORE UPDATE ON public.wishlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();