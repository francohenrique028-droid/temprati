CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  show_on_home boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Public can read active categories'
  ) THEN
    CREATE POLICY "Public can read active categories"
      ON public.categories FOR SELECT TO anon, authenticated
      USING (status = 'active' OR public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can insert categories'
  ) THEN
    CREATE POLICY "Admins can insert categories"
      ON public.categories FOR INSERT TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can update categories'
  ) THEN
    CREATE POLICY "Admins can update categories"
      ON public.categories FOR UPDATE TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can delete categories'
  ) THEN
    CREATE POLICY "Admins can delete categories"
      ON public.categories FOR DELETE TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

INSERT INTO public.categories (name, slug, sort_order)
SELECT label, slug, sort_order
FROM (
  SELECT
    label,
    regexp_replace(regexp_replace(lower(label), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g') AS slug,
    row_number() OVER (ORDER BY label) - 1 AS sort_order
  FROM (
    SELECT DISTINCT trim(category) AS label
    FROM public.products
    WHERE category IS NOT NULL AND trim(category) <> ''
  ) existing_categories
) seeded_categories
WHERE slug <> ''
ON CONFLICT (slug) DO NOTHING;
