-- Add product_type column to distinguish between standard and custom products
ALTER TABLE public.products 
ADD COLUMN product_type text NOT NULL DEFAULT 'standard' CHECK (product_type IN ('standard', 'custom'));

-- Add comment for clarity
COMMENT ON COLUMN public.products.product_type IS 'Type of product: standard (basic customization) or custom (full personalization)';

-- Update existing products to have proper product types
-- Assuming products with certain characteristics are custom
UPDATE public.products 
SET product_type = 'custom' 
WHERE name ILIKE '%custom%' OR name ILIKE '%personalized%' OR description ILIKE '%personalized%';