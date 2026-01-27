-- Add estimated_delivery_date and tracking_updated_at to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create order status history table for timeline tracking
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own order status history
CREATE POLICY "Users can view their own order status history"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Admins can manage order status history
CREATE POLICY "Admins can manage order status history"
ON public.order_status_history
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.product_reviews
FOR SELECT
USING (true);

-- Users can create reviews for products they have received
CREATE POLICY "Users can create their own reviews"
ON public.product_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.product_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.product_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at on reviews
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();