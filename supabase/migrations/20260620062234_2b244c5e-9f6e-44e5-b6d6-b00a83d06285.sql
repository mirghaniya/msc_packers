DROP POLICY IF EXISTS "Users can update their own reviews" ON public.product_reviews;

CREATE POLICY "Users can update their own reviews"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND product_id = (SELECT product_id FROM public.product_reviews pr WHERE pr.id = product_reviews.id)
    AND order_id   = (SELECT order_id   FROM public.product_reviews pr WHERE pr.id = product_reviews.id)
    AND user_id    = (SELECT user_id    FROM public.product_reviews pr WHERE pr.id = product_reviews.id)
    AND is_verified_purchase = (SELECT is_verified_purchase FROM public.product_reviews pr WHERE pr.id = product_reviews.id)
  );