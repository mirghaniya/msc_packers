-- Create atomic function to set default address (fixes race condition)
CREATE OR REPLACE FUNCTION public.set_default_address(p_address_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Validate address belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM user_addresses 
    WHERE id = p_address_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Address not found or does not belong to user';
  END IF;

  -- Atomic operation: unset all defaults and set new default
  UPDATE user_addresses SET is_default = false WHERE user_id = auth.uid();
  UPDATE user_addresses SET is_default = true WHERE id = p_address_id AND user_id = auth.uid();
END;
$$;