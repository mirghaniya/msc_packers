-- 1. Storage: remove broad listing policy on the public product-images bucket.
-- Public file URLs (/storage/v1/object/public/...) bypass RLS, so images stay viewable,
-- but the storage API can no longer enumerate the bucket.
DROP POLICY IF EXISTS "Public read product images by path" ON storage.objects;

-- 2. SECURITY DEFINER function exposure: revoke broad PUBLIC execute and grant only to needed roles.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_public_product_reviews(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_product_reviews(uuid) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.submit_product_review(uuid, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_product_review(uuid, integer, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.set_default_address(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_default_address(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.create_validated_order(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_validated_order(jsonb) TO authenticated;

-- Trigger-only helpers: no client should call these.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;