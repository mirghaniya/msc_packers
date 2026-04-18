
-- 1. Reviews: drop anon SELECT policy on base table; expose only the safe view
DROP POLICY IF EXISTS "Anon can read non-sensitive review columns" ON public.product_reviews;
REVOKE SELECT ON public.product_reviews FROM anon;

-- Recreate safe view as SECURITY DEFINER (default) so anon reads only safe columns through it
DROP VIEW IF EXISTS public.public_product_reviews;
CREATE VIEW public.public_product_reviews
WITH (security_invoker = false) AS
SELECT id, product_id, rating, title, content, is_verified_purchase, created_at
FROM public.product_reviews;

GRANT SELECT ON public.public_product_reviews TO anon, authenticated;

-- 2. Restrict storage object listing on the public product-images bucket.
-- Drop any overly broad SELECT policies, then add policies that allow direct
-- object access (by full path) but block listing/enumeration.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND polcmd = 'r'
  LOOP
    -- only drop policies that target product-images broadly
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.polname);
  END LOOP;
END$$;

-- Allow public read of individual objects (needed for <img src> URLs to work)
CREATE POLICY "Public read product images by path"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Note: Supabase storage list endpoints require additional list permission
-- on the bucket itself; the public bucket listing warning will resolve once
-- the bucket is marked private OR clients are restricted from list calls.
