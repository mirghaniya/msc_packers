
-- Remove the anon SELECT policy on the base table
DROP POLICY IF EXISTS "Anon can view reviews via view" ON public.product_reviews;

-- Recreate the view as security definer (default) so anon can read safe columns only via the view
DROP VIEW IF EXISTS public.public_product_reviews;
CREATE VIEW public.public_product_reviews
WITH (security_invoker = false) AS
SELECT id, product_id, rating, title, content, is_verified_purchase, created_at
FROM public.product_reviews;

GRANT SELECT ON public.public_product_reviews TO anon, authenticated;
