
-- Revoke broad EXECUTE on all SECURITY DEFINER functions, then grant only where needed.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_product_reviews(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_product_review(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_default_address(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_validated_order(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role is invoked inside RLS policies; needs to be callable by signed-in users.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Public reviews list - intentionally readable by visitors.
GRANT EXECUTE ON FUNCTION public.get_public_product_reviews(uuid) TO anon, authenticated;

-- Authenticated-only RPCs
GRANT EXECUTE ON FUNCTION public.submit_product_review(uuid, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_default_address(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_validated_order(jsonb) TO authenticated;

-- handle_new_user and update_updated_at_column are trigger-only; service_role suffices.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
