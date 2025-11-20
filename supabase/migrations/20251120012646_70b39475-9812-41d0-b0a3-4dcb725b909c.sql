-- Add explicit policies to deny anonymous/unauthenticated access to sensitive tables
-- This prevents potential data extraction attempts from unauthenticated users

-- Profiles table - deny anonymous access
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO anon
USING (false);

-- Orders table - deny anonymous access
CREATE POLICY "Deny anonymous access to orders"
ON public.orders
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Custom Orders table - deny anonymous access
CREATE POLICY "Deny anonymous access to custom orders"
ON public.custom_orders
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Order Items table - deny anonymous access
CREATE POLICY "Deny anonymous access to order items"
ON public.order_items
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Cart Items table - deny anonymous access
CREATE POLICY "Deny anonymous access to cart items"
ON public.cart_items
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Wishlists table - deny anonymous access
CREATE POLICY "Deny anonymous access to wishlists"
ON public.wishlists
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- User Roles table - deny anonymous access
CREATE POLICY "Deny anonymous access to user roles"
ON public.user_roles
AS PERMISSIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);