-- Add foreign key constraint between wishlists and products
ALTER TABLE public.wishlists 
ADD CONSTRAINT wishlists_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add foreign key constraint between wishlists and profiles (for user_id)
ALTER TABLE public.wishlists 
ADD CONSTRAINT wishlists_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;