DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.product_reviews;

CREATE POLICY "Users can view their own reviews"
ON public.product_reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
ON public.product_reviews
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));