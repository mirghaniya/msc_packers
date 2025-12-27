-- Drop the existing ALL policy
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;

-- Create separate policies with proper validation

-- SELECT: Users can view their own cart items
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can add items to their own cart (with product validation)
CREATE POLICY "Users can add items to their own cart" 
ON public.cart_items 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND quantity > 0 
  AND EXISTS (SELECT 1 FROM public.products WHERE id = product_id)
);

-- UPDATE: Users can update their own cart items (quantity must be positive)
CREATE POLICY "Users can update their own cart items" 
ON public.cart_items 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND quantity > 0);

-- DELETE: Users can remove items from their own cart
CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);