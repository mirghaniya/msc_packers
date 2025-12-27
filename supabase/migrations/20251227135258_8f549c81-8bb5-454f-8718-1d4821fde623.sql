-- Add RLS policy for admins to view customer profiles for order fulfillment
CREATE POLICY "Admins can view profiles for order fulfillment"
ON public.profiles 
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.user_id = profiles.id
  )
);

-- Update handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_phone text;
BEGIN
  -- Extract and validate full_name
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  IF length(v_full_name) > 100 THEN
    RAISE EXCEPTION 'Full name too long (max 100 characters)';
  END IF;
  
  -- Extract and validate phone
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  IF length(v_phone) > 20 THEN
    RAISE EXCEPTION 'Phone number too long (max 20 characters)';
  END IF;
  
  -- Validate phone format if provided (allows digits, spaces, dashes, parentheses, plus sign)
  IF v_phone != '' AND v_phone !~ '^[\+\d\s\-\(\)]+$' THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;
  
  -- Insert validated data into profiles
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, v_full_name, v_phone);
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;