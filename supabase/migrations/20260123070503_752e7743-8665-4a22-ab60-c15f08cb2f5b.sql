-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view product images
CREATE POLICY "Anyone can view product images" 
ON public.product_images 
FOR SELECT 
USING (true);

-- Admins can manage product images
CREATE POLICY "Admins can manage product images" 
ON public.product_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create hero_slides table for carousel
CREATE TABLE public.hero_slides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    button_text TEXT,
    button_link TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Anyone can view active hero slides
CREATE POLICY "Anyone can view active hero slides" 
ON public.hero_slides 
FOR SELECT 
USING (is_active = true);

-- Admins can view all hero slides
CREATE POLICY "Admins can view all hero slides" 
ON public.hero_slides 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage hero slides
CREATE POLICY "Admins can manage hero slides" 
ON public.hero_slides 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_addresses table for multiple addresses
CREATE TABLE public.user_addresses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    label TEXT DEFAULT 'Home',
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can view their own addresses
CREATE POLICY "Users can view their own addresses" 
ON public.user_addresses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses" 
ON public.user_addresses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update their own addresses" 
ON public.user_addresses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses" 
ON public.user_addresses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all addresses for order fulfillment
CREATE POLICY "Admins can view addresses for fulfillment" 
ON public.user_addresses 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add email column to profiles if not exists (for user to change email)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;