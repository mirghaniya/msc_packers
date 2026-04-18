
-- Recreate view as security_invoker (clears the linter error)
DROP VIEW IF EXISTS public.public_product_reviews;
CREATE VIEW public.public_product_reviews
WITH (security_invoker = true) AS
SELECT id, product_id, rating, title, content, is_verified_purchase, created_at
FROM public.product_reviews;
GRANT SELECT ON public.public_product_reviews TO anon, authenticated;

-- Public reviews accessor: SECURITY DEFINER function returning only safe columns
CREATE OR REPLACE FUNCTION public.get_public_product_reviews(p_product_id uuid)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  rating integer,
  title text,
  content text,
  is_verified_purchase boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, product_id, rating, title, content, is_verified_purchase, created_at
  FROM public.product_reviews
  WHERE product_id = p_product_id
  ORDER BY created_at DESC
$$;

REVOKE ALL ON FUNCTION public.get_public_product_reviews(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_product_reviews(uuid) TO anon, authenticated;
