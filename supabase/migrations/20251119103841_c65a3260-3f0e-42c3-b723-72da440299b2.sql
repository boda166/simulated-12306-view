-- First, remove category references from products
UPDATE products SET category_id = NULL;

-- Delete old categories
DELETE FROM categories;

-- Create new categories matching the design
INSERT INTO categories (id, name, description) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Evening', 'Elegant bags perfect for evening events and special occasions'),
  ('b2222222-2222-2222-2222-222222222222', 'Bridal', 'Sophisticated bags designed for weddings and bridal parties'),
  ('c3333333-3333-3333-3333-333333333333', 'Luxury', 'Premium designer bags with exclusive materials and craftsmanship'),
  ('d4444444-4444-4444-4444-444444444444', 'Classic', 'Timeless designs suitable for everyday elegance');

-- Assign products to categories based on names and characteristics
-- You can adjust these assignments based on your actual product catalog
UPDATE products 
SET category_id = 'a1111111-1111-1111-1111-111111111111'
WHERE name ILIKE '%evening%' OR name ILIKE '%clutch%' OR name ILIKE '%party%';

UPDATE products 
SET category_id = 'b2222222-2222-2222-2222-222222222222'
WHERE name ILIKE '%bridal%' OR name ILIKE '%wedding%' OR name ILIKE '%bride%';

UPDATE products 
SET category_id = 'c3333333-3333-3333-3333-333333333333'
WHERE name ILIKE '%luxury%' OR name ILIKE '%premium%' OR name ILIKE '%designer%' OR original_price > price * 1.3;

-- Assign remaining products to Classic category
UPDATE products 
SET category_id = 'd4444444-4444-4444-4444-444444444444'
WHERE category_id IS NULL;