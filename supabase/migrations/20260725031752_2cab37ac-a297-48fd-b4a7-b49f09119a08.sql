CREATE TABLE public.theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.theme_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.theme_settings TO authenticated;
GRANT ALL ON public.theme_settings TO service_role;

ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read theme" ON public.theme_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert theme" ON public.theme_settings
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update theme" ON public.theme_settings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete theme" ON public.theme_settings
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.theme_settings (singleton, config) VALUES (true, '{
  "colors": {
    "primary": "#EC4899",
    "primaryForeground": "#FFFFFF",
    "background": "#FFFFFF",
    "foreground": "#1F1F1F",
    "muted": "#F5F5F5",
    "mutedForeground": "#707070",
    "secondary": "#FFF0F6",
    "border": "#ECE8E1",
    "footerBg": "#111111",
    "footerText": "#E5E5E5"
  },
  "typography": {
    "fontFamily": "Plus Jakarta Sans",
    "baseSize": 16,
    "headingWeight": 600,
    "letterCase": "lowercase"
  },
  "header": {
    "logoText": "#temprati",
    "sticky": true,
    "showSearch": true,
    "showFavorites": true,
    "showAccount": true,
    "showCart": true,
    "announcements": [
      "frete grátis acima de R$ 299",
      "ganhe brinde nas compras acima de R$ 499",
      "10% off no pix",
      "novas peças toda semana"
    ]
  },
  "banner": {
    "desktopImage": "",
    "mobileImage": "",
    "title": "",
    "subtitle": "",
    "buttonLabel": "",
    "buttonHref": "",
    "visible": true
  },
  "products": {
    "columnsDesktop": 4,
    "columnsMobile": 2,
    "showPrice": true,
    "showInstallments": true,
    "showBuyButton": true,
    "showBadgeSale": true,
    "showBadgeNew": true
  },
  "footer": {
    "copyright": "© temprati — todos os direitos reservados.",
    "whatsapp": "",
    "instagram": "https://instagram.com",
    "facebook": "https://facebook.com",
    "aboutText": "moda feminina premium com peças atemporais para o dia a dia."
  }
}'::jsonb);