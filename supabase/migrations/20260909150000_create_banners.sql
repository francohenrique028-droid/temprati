CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  link_url text,
  desktop_image_url text NOT NULL,
  mobile_image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can read all banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;

CREATE POLICY "Public can read active banners"
ON public.banners FOR SELECT TO anon
USING (status = 'active');

CREATE POLICY "Admins can read all banners"
ON public.banners FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert banners"
ON public.banners FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update banners"
ON public.banners FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete banners"
ON public.banners FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS update_banners_updated_at ON public.banners;
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_banners_status_order
ON public.banners(status, sort_order);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner-images',
  'banner-images',
  true,
  12582912,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jfif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

CREATE POLICY "Public can view banner images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'banner-images');

CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'banner-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update banner images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'banner-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'banner-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'banner-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
