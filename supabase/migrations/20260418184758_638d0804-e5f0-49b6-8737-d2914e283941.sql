
DROP VIEW IF EXISTS public.public_product_reviews;
CREATE VIEW public.public_product_reviews
WITH (security_invoker = true) AS
SELECT id, product_id, rating, title, content, is_verified_purchase, created_at
FROM public.product_reviews;

GRANT SELECT ON public.public_product_reviews TO anon, authenticated;

-- Allow anon SELECT on base table but only on non-sensitive columns via column-level grants.
-- Revoke any prior table-level select for anon, then grant only safe columns.
REVOKE SELECT ON public.product_reviews FROM anon;
GRANT SELECT (id, product_id, rating, title, content, is_verified_purchase, created_at)
  ON public.product_reviews TO anon;

-- Anon SELECT policy that allows row visibility (column grants restrict columns)
CREATE POLICY "Anon can read non-sensitive review columns"
  ON public.product_reviews FOR SELECT
  TO anon
  USING (true);
