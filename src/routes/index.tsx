import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";


import bannerDesktop from "@/assets/banner-desktop.png.asset.json";
import bannerMobile from "@/assets/banner-mobile.png.asset.json";
import catVestidos from "@/assets/cat-vestidos.jpg.asset.json";
import catBlusas from "@/assets/cat-blusas.jpg.asset.json";
import catCalcas from "@/assets/cat-calcas.jpg.asset.json";
import catCalcados from "@/assets/cat-calcados.jpg.asset.json";
import catAcessorios from "@/assets/cat-acessorios.jpg.asset.json";
import catBolsas from "@/assets/cat-bolsas.jpg";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { StoriesCarousel } from "@/components/product/StoriesCarousel";
import { bestsellers, fetchPublishedProducts, products, type Product } from "@/lib/products";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "#temprati — moda feminina premium" },
      {
        name: "description",
        content:
          "roupas, calçados e acessórios femininos com design atemporal, tecidos nobres e caimento impecável.",
      },
      { property: "og:title", content: "#temprati — moda feminina premium" },
      {
        property: "og:description",
        content:
          "roupas, calçados e acessórios femininos com design atemporal, tecidos nobres e caimento impecável.",
      },
    ],
  }),
  component: HomePage,
});

const categoryImages: Record<string, string> = {
  vestidos: catVestidos.url,
  blusas: catBlusas.url,
  calcas: catCalcas.url,
  calcados: catCalcados.url,
  acessorios: catAcessorios.url,
  bolsas: catBolsas,
};

type HomeCategory = {
  name: string;
  slug: string;
  image_url?: string | null;
};

type HomeBanner = {
  desktop_image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
};

function categorySlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildHomeCategories(names: string[]): HomeCategory[] {
  const seen = new Set<string>();
  return names.reduce<HomeCategory[]>((acc, name) => {
    const slug = categorySlug(name);
    if (!name.trim() || !slug || seen.has(slug)) return acc;
    seen.add(slug);
    acc.push({ name, slug });
    return acc;
  }, []);
}

function isMissingCategoryImageColumn(message: string) {
  return message.includes("categories.image_url") && message.includes("does not exist");
}

function HomePage() {
  const { theme } = useTheme();
  const [storeProducts, setStoreProducts] = useState<Product[]>(products);
  const [homeCategories, setHomeCategories] = useState<HomeCategory[]>(() =>
    buildHomeCategories(theme.categorySection.items),
  );
  const [loadedFromDatabase, setLoadedFromDatabase] = useState(false);
  const [homeBanner, setHomeBanner] = useState<HomeBanner | null>(null);
  const desk = homeBanner?.desktop_image_url || theme.banner.desktopImage || bannerDesktop.url;
  const mob = homeBanner?.mobile_image_url || homeBanner?.desktop_image_url || theme.banner.mobileImage || bannerMobile.url;
  const categoryTitle = theme.categorySection.title.trim();
  const categories = useMemo(
    () =>
      homeCategories.map((category) => {
        const slug = category.slug;
        return {
          name: category.name,
          href: `/categoria/${slug}`,
          img: category.image_url || categoryImages[slug] || catBolsas,
        };
      }),
    [homeCategories],
  );

  useEffect(() => {
    let active = true;
    const loadBanner = async () => {
      const { data, error } = await (supabase as any)
        .from("banners")
        .select("desktop_image_url,mobile_image_url,link_url")
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (error) {
        if (!error.message.includes("public.banners") && !error.message.includes("banners")) toast.error(error.message);
        return;
      }
      setHomeBanner(data as HomeBanner | null);
    };
    void loadBanner();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetchPublishedProducts().then((data) => {
      if (!active || data === null) return;
      setStoreProducts(data);
      setLoadedFromDatabase(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      const resultWithImages = await supabase
        .from("categories")
        .select("name,slug,image_url")
        .eq("status", "active")
        .eq("show_on_home", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      const result =
        resultWithImages.error && isMissingCategoryImageColumn(resultWithImages.error.message)
          ? await supabase
              .from("categories")
              .select("name,slug")
              .eq("status", "active")
              .eq("show_on_home", true)
              .order("sort_order", { ascending: true })
              .order("name", { ascending: true })
          : resultWithImages;

      if (!active) return;
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      if (resultWithImages.error && isMissingCategoryImageColumn(resultWithImages.error.message)) {
        toast.error("A migration de imagens de categoria ainda não foi aplicada no Supabase.");
      }

      const nextCategories = (result.data ?? [])
        .map((category) => ({
          name: category.name,
          slug: category.slug,
          image_url: "image_url" in category ? category.image_url : null,
        }))
        .filter((category) => category.name && category.slug);

      setHomeCategories(nextCategories.length ? nextCategories : buildHomeCategories(theme.categorySection.items));
    };

    void loadCategories();
    window.addEventListener("focus", loadCategories);
    return () => {
      active = false;
      window.removeEventListener("focus", loadCategories);
    };
  }, [theme.categorySection.items]);

  const featuredProducts = useMemo(() => {
    const source = loadedFromDatabase ? storeProducts : bestsellers();
    const featured = source.filter((product) => product.bestseller);
    return (featured.length ? featured : source).slice(0, 8);
  }, [loadedFromDatabase, storeProducts]);

  const storyProducts = useMemo(() => storeProducts.slice(0, 9), [storeProducts]);

  return (
    <>
      {/* HERO */}
      {theme.banner.visible !== false && (
        <section className="w-full" data-editor-block="home-banner">
          {homeBanner?.link_url ? <a href={homeBanner.link_url} className="block">
            <img
              src={mob}
              alt="banner"
              className="block w-full aspect-[2496/3000] object-cover md:hidden"
            />
            <img
              src={desk}
              alt="banner"
              className="hidden md:block w-full aspect-[4000/1302] object-cover"
            />
          </a> : <div>
            <img src={mob} alt="banner" className="block w-full aspect-[2496/3000] object-cover md:hidden" />
            <img src={desk} alt="banner" className="hidden md:block w-full aspect-[4000/1302] object-cover" />
          </div>}
        </section>
      )}

      {/* CATEGORIAS CIRCULARES */}
      <section data-editor-block="home-categories" className="container-x py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium lowercase tracking-wider text-primary">explore</p>
          {categoryTitle && (
            <h2
              className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl"
              style={{ color: theme.categorySection.titleColor }}
            >
              {categoryTitle}
            </h2>
          )}
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="relative">
          <CarouselContent className="-ml-4 md:-ml-6">
            {categories.map((c, i) => (
              <CarouselItem
                key={c.name}
                className="basis-1/2 pl-4 md:basis-1/3 md:pl-6 lg:basis-1/4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link to={c.href} className="group flex flex-col items-center gap-4">
                    <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-full bg-secondary shadow-soft">
                      <img
                        src={c.img}
                        alt={c.name}
                        loading="lazy"
                        width={800}
                        height={800}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <span className="text-sm font-medium lowercase tracking-wide text-foreground transition-colors group-hover:text-primary">
                      {c.name}
                    </span>
                  </Link>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </section>

      {/* MAIS VENDIDOS */}
      <section data-editor-block="home-featured" className="container-x py-14">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium lowercase tracking-wider text-primary">
              best sellers
            </p>
            <h2 className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl">
              mais vendidos
            </h2>
          </div>
          <Link
            to="/categoria/$slug"
            params={{ slug: "feminino" }}
            className="hidden text-sm lowercase text-muted-foreground hover:text-primary md:inline"
          >
            ver todos →
          </Link>
        </div>
        {featuredProducts.length ? (
          <ProductGrid items={featuredProducts} />
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhum produto ativo cadastrado ainda.
          </p>
        )}
      </section>

      {/* STORIES CAROUSEL — destaques */}
      {storyProducts.length > 0 && (
        <section className="container-x py-16">
          <StoriesCarousel
            cards={storyProducts.map((p) => ({
              id: p.id,
              image: p.images[0],
              thumb: p.images[0],
              name: p.name,
              price: p.price,
              oldPrice: p.oldPrice,
              rating: 5,
              href: `/produto/${p.slug}`,
            }))}
          />
        </section>
      )}

      {/* NEWSLETTER */}
      <Newsletter />
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <section className="container-x pb-24">
      <div className="mx-auto max-w-3xl rounded-2xl bg-secondary p-10 text-center md:p-16">
        <p className="mb-3 text-[11px] font-medium lowercase tracking-wider text-primary">
          newsletter
        </p>
        <h3 className="text-3xl font-semibold lowercase md:text-4xl">
          receba nossas <span className="italic font-normal text-primary">novidades</span>
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          lançamentos, ofertas exclusivas e novas coleções em primeira mão.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            toast("cadastro realizado com sucesso");
            setEmail("");
          }}
          className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="seu@email.com"
            className="flex-1 rounded-full border border-border bg-background px-5 py-4 text-sm lowercase outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
          />
          <button className="rounded-full bg-primary px-6 py-4 text-xs font-medium lowercase tracking-wide text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_88%,black)] transition-colors">
            cadastrar
          </button>
        </form>
      </div>
    </section>
  );
}
