-- Fix 1: Drop the overly permissive admin profile viewing policy
-- and replace with a more restrictive one that only allows viewing profiles
-- of users who have placed orders (linking profile to actual order context)
DROP POLICY IF EXISTS "Admins can view profiles for order fulfillment" ON public.profiles;

-- Create a more restrictive policy: admins can only view profiles of users 
-- whose orders they need to fulfill (actual order context required)
CREATE POLICY "Admins can view customer profiles for their orders"
ON public.profiles
FOR SELECT
USING (
  -- User viewing their own profile
  auth.uid() = id
  OR
  -- Admin can view profile ONLY if that specific user has orders
  (has_role(auth.uid(), 'admin'::app_role) AND id IN (SELECT DISTINCT user_id FROM orders))
);

-- Actually we need to drop the existing "Users can view their own profile" policy 
-- since the new policy above includes it
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Fix 2: Add restrictive policies on user_roles table to prevent privilege escalation
-- Only the system (via SECURITY DEFINER functions) should be able to modify roles
-- Deny all direct INSERT attempts (roles should only be set via trigger on user creation)
CREATE POLICY "Deny direct role inserts"
ON public.user_roles
FOR INSERT
WITH CHECK (false);

-- Deny all direct UPDATE attempts (prevents privilege escalation)
CREATE POLICY "Deny direct role updates"
ON public.user_roles
FOR UPDATE
USING (false);

-- Deny all direct DELETE attempts (prevents role removal attacks)
CREATE POLICY "Deny direct role deletes"
ON public.user_roles
FOR DELETE
USING (false);