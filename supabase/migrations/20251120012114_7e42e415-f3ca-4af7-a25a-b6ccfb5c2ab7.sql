-- Fix policy types - ensure all policies are PERMISSIVE (not RESTRICTIVE)
-- RESTRICTIVE policies require PERMISSIVE policies to work, which causes access issues

-- Profiles table - recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can only view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can only view own profile"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can create own profile"
ON public.profiles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Orders table - recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update pending orders limited fields" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access to orders" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
ON public.orders
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Simplified update policy - users cannot update orders after creation (admin only)
CREATE POLICY "Admins can view all orders"
ON public.orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all orders"
ON public.orders
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access to orders"
ON public.orders
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Custom Orders table - recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can create own custom orders" ON public.custom_orders;
DROP POLICY IF EXISTS "Users can update own pending custom orders" ON public.custom_orders;
DROP POLICY IF EXISTS "Users can view own custom orders without admin notes" ON public.custom_orders;
DROP POLICY IF EXISTS "Admins can view all custom orders" ON public.custom_orders;
DROP POLICY IF EXISTS "Admins can update all custom orders" ON public.custom_orders;

CREATE POLICY "Users can view own custom orders"
ON public.custom_orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own custom orders"
ON public.custom_orders
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending custom orders"
ON public.custom_orders
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all custom orders"
ON public.custom_orders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all custom orders"
ON public.custom_orders
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));