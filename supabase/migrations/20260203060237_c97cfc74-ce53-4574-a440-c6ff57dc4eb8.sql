-- Create brand_testimonials table for logo carousel
CREATE TABLE public.brand_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_testimonials ENABLE ROW LEVEL SECURITY;

-- Public can view active brand testimonials
CREATE POLICY "Anyone can view active brand testimonials"
  ON public.brand_testimonials
  FOR SELECT
  USING (is_active = true);

-- Admin can manage brand testimonials
CREATE POLICY "Admins can manage brand testimonials"
  ON public.brand_testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_brand_testimonials_updated_at
  BEFORE UPDATE ON public.brand_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();