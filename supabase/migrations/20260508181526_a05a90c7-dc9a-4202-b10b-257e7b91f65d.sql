
-- 1) Tighten profiles SELECT policy to authenticated only (no public/anon)
DROP POLICY IF EXISTS "Admins can view customer profiles for their orders" ON public.profiles;
CREATE POLICY "Admins can view customer profiles for their orders"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR (
      has_role(auth.uid(), 'admin'::app_role)
      AND id IN (SELECT DISTINCT orders.user_id FROM orders)
    )
  );

-- 2) Server-side review submission with verified-purchase enforcement
-- Drop overly-permissive client INSERT policy
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.product_reviews;

-- One review per user per product
ALTER TABLE public.product_reviews
  DROP CONSTRAINT IF EXISTS product_reviews_user_product_unique;
ALTER TABLE public.product_reviews
  ADD CONSTRAINT product_reviews_user_product_unique UNIQUE (user_id, product_id);

CREATE OR REPLACE FUNCTION public.submit_product_review(
  p_product_id uuid,
  p_rating int,
  p_title text DEFAULT NULL,
  p_content text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_review_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;

  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  IF p_title IS NOT NULL AND length(p_title) > 100 THEN
    RAISE EXCEPTION 'Title too long';
  END IF;

  IF p_content IS NOT NULL AND length(p_content) > 1000 THEN
    RAISE EXCEPTION 'Content too long';
  END IF;

  -- Verify delivered purchase
  SELECT o.id INTO v_order_id
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.user_id = auth.uid()
    AND oi.product_id = p_product_id
    AND o.status = 'Delivered'
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'You can only review products from delivered orders';
  END IF;

  INSERT INTO product_reviews (
    product_id, user_id, order_id, rating, title, content, is_verified_purchase
  ) VALUES (
    p_product_id, auth.uid(), v_order_id, p_rating,
    NULLIF(trim(p_title), ''),
    NULLIF(trim(p_content), ''),
    true
  )
  RETURNING id INTO v_review_id;

  RETURN v_review_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_product_review(uuid, int, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_product_review(uuid, int, text, text) TO authenticated;

-- 3) Tighten EXECUTE on sensitive SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.set_default_address(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_default_address(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.create_validated_order(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_validated_order(jsonb) TO authenticated;
