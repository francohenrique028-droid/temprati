import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { StoriesCarousel } from "@/components/product/StoriesCarousel";
import { fetchPublishedProducts, type Product } from "@/lib/products";
import { useEffect, useMemo, useState } from "react";
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

function HomePage() {
  const { theme } = useTheme();
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [homeCategories, setHomeCategories] = useState<HomeCategory[]>([]);
  const [homeBanner, setHomeBanner] = useState<HomeBanner | null>(null);

  const categories = useMemo(
    () => homeCategories.filter((category) => Boolean(category.image_url)).map((category) => ({
      name: category.name,
      href: `/categoria/${category.slug}`,
      img: category.image_url as string,
    })),
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
        console.warn("[Home] Não foi possível carregar o banner do painel:", error.message);
        return;
      }
      setHomeBanner((data as HomeBanner | null) ?? null);
    };
    void loadBanner();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchPublishedProducts().then((data) => {
      if (!active || data === null) return;
      setStoreProducts(data);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name,slug,image_url")
        .eq("status", "active")
        .eq("show_on_home", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!active) return;
      if (error) {
        console.warn("[Home] Não foi possível carregar as categorias do painel:", error.message);
        return;
      }

      const nextCategories = (data ?? [])
        .map((category) => ({
          name: category.name,
          slug: category.slug,
          image_url: category.image_url ?? null,
        }))
        .filter((category) => category.name && category.slug && category.image_url);

      setHomeCategories(nextCategories);
    };

    void loadCategories();
    window.addEventListener("focus", loadCategories);
    return () => {
      active = false;
      window.removeEventListener("focus", loadCategories);
    };
  }, []);

  const featuredProducts = useMemo(
    () => storeProducts.filter((product) => product.bestseller).slice(0, 8),
    [storeProducts],
  );

  const storyProducts = useMemo(() => storeProducts.slice(0, 9), [storeProducts]);
  const categoryTitle = theme.categorySection.title.trim();
  const desktopBanner = homeBanner?.desktop_image_url || "";
  const mobileBanner = homeBanner?.mobile_image_url || homeBanner?.desktop_image_url || "";

  return (
    <>
      {homeBanner && desktopBanner && (
        <section className="w-full" data-editor-block="home-banner">
          {homeBanner.link_url ? (
            <a href={homeBanner.link_url} className="block">
              <img src={mobileBanner} alt="banner" className="block w-full aspect-[2496/3000] object-cover md:hidden" />
              <img src={desktopBanner} alt="banner" className="hidden md:block w-full aspect-[4000/1302] object-cover" />
            </a>
          ) : (
            <div>
              <img src={mobileBanner} alt="banner" className="block w-full aspect-[2496/3000] object-cover md:hidden" />
              <img src={desktopBanner} alt="banner" className="hidden md:block w-full aspect-[4000/1302] object-cover" />
            </div>
          )}
        </section>
      )}

      {categoryTitle && categories.length > 0 && (
        <section data-editor-block="home-categories" className="container-x py-20">
          <div className="mb-10 text-center">
            <h2
              className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl"
              style={{ color: theme.categorySection.titleColor }}
            >
              {categoryTitle}
            </h2>
          </div>
          <Carousel opts={{ align: "start", loop: true }} className="relative">
            <CarouselContent className="-ml-4 md:-ml-6">
              {categories.map((c, i) => (
                <CarouselItem key={c.name} className="basis-1/2 pl-4 md:basis-1/3 md:pl-6 lg:basis-1/4">
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
      )}

      {featuredProducts.length > 0 && (
        <section data-editor-block="home-featured" className="container-x py-14">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium lowercase tracking-wider text-primary">best sellers</p>
              <h2 className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl">mais vendidos</h2>
            </div>
            <Link
              to="/categoria/$slug"
              params={{ slug: "feminino" }}
              className="hidden text-sm lowercase text-muted-foreground hover:text-primary md:inline"
            >
              ver todos →
            </Link>
          </div>
          <ProductGrid items={featuredProducts} />
        </section>
      )}

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
    </>
  );
}
