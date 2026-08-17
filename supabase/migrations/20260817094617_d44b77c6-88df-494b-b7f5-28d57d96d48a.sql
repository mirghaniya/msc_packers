ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.slugify_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(coalesce(input, '')),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.products_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 1;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    NEW.slug := left(public.slugify_text(NEW.slug), 120);
  ELSE
    NEW.slug := NULL;
  END IF;

  IF NEW.slug IS NULL THEN
    base := left(public.slugify_text(NEW.name), 120);
    IF base IS NULL OR base = '' THEN
      base := 'product';
    END IF;
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.products p WHERE p.slug = candidate AND p.id <> NEW.id) LOOP
      n := n + 1;
      candidate := base || '-' || n;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_slug_trigger ON public.products;
CREATE TRIGGER products_set_slug_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_set_slug();

DO $$
DECLARE
  r record;
  base text;
  candidate text;
  n int;
BEGIN
  FOR r IN SELECT id, name FROM public.products WHERE slug IS NULL OR slug = '' ORDER BY created_at LOOP
    base := left(public.slugify_text(r.name), 120);
    IF base IS NULL OR base = '' THEN base := 'product'; END IF;
    candidate := base;
    n := 1;
    WHILE EXISTS (SELECT 1 FROM public.products p WHERE p.slug = candidate) LOOP
      n := n + 1;
      candidate := base || '-' || n;
    END LOOP;
    UPDATE public.products SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug);