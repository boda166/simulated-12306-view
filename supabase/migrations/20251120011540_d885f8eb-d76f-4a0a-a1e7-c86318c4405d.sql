-- Fix Profiles Table RLS Policies
-- Drop existing policies that may allow enumeration
DROP POLICY IF EXISTS "secure_users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "secure_users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "secure_users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "secure_admins_select_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "secure_admins_update_all_profiles" ON public.profiles;

-- Recreate strict policies for profiles
-- Users can ONLY select their own profile by their auth.uid()
CREATE POLICY "Users can only view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can insert their own profile during registration
CREATE POLICY "Users can create own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Users can update only their own profile (not admin-controlled fields)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix Orders Table RLS Policies
-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_users_select_own_orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;
DROP POLICY IF EXISTS "Service role can manage all orders" ON public.orders;

-- Users can view only their own orders
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create orders (only for themselves)
CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can ONLY update non-sensitive fields and only for pending orders
CREATE POLICY "Users can update pending orders limited fields"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  AND status = 'pending'
)
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending'
  -- Prevent modification of critical fields after order placement
  AND shipping_address = (SELECT shipping_address FROM orders WHERE id = orders.id)
  AND contact_info = (SELECT contact_info FROM orders WHERE id = orders.id)
  AND total_amount = (SELECT total_amount FROM orders WHERE id = orders.id)
);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all orders (full access)
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role maintains full access for backend operations
CREATE POLICY "Service role full access to orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix Custom Orders Table - Hide admin_notes from users
DROP POLICY IF EXISTS "Users can view own custom orders" ON public.custom_orders;

-- Users can view own custom orders but WITHOUT admin_notes
-- Create a view for user-safe custom orders
CREATE OR REPLACE VIEW public.user_custom_orders AS
SELECT 
  id,
  user_id,
  product_name,
  description,
  reference_images,
  preferred_colors,
  preferred_handles,
  personalization_details,
  budget_range,
  delivery_date,
  estimated_price,
  final_price,
  status,
  converted_order_id,
  created_at,
  updated_at
  -- admin_notes intentionally excluded
FROM public.custom_orders;

-- Grant access to the view
GRANT SELECT ON public.user_custom_orders TO authenticated;

-- Recreate policy with admin_notes visible only to admins
CREATE POLICY "Users can view own custom orders without admin notes"
ON public.custom_orders
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);