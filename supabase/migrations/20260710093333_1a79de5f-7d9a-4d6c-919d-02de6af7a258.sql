ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_add_to_cart boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_enquiry boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_call_now boolean NOT NULL DEFAULT true;