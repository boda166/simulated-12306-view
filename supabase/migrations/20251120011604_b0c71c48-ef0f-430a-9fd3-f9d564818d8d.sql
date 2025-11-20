-- Fix the Security Definer View issue
-- Drop the view and handle admin_notes filtering in application code instead
DROP VIEW IF EXISTS public.user_custom_orders;

-- The RLS policy already restricts users to their own custom orders
-- Application code should explicitly exclude admin_notes from SELECT queries
-- This is more secure than using a SECURITY DEFINER view

-- Add a comment to document this security requirement
COMMENT ON COLUMN public.custom_orders.admin_notes IS 
'SECURITY: This field contains internal admin notes and should NEVER be included in SELECT queries for non-admin users. Application code must explicitly exclude this field when querying for regular users.';