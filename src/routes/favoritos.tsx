import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { fetchPublishedProducts, products, type Product } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";

function FavoritesPage() {
  const { ids } = useFavorites();
  const [catalog, setCatalog] = useState<Product[]>(products);

  useEffect(() => {
    let active = true;
    fetchPublishedProducts().then((items) => {
      if (!active || items === null) return;
      setCatalog(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const items = catalog.filter((p) => ids.has(p.id));
  return (
    <div className="container-x py-14">
      <h1 className="text-4xl font-light tracking-tight md:text-5xl">Favoritos</h1>
      <p className="mt-3 text-sm text-muted-foreground">Suas peças salvas.</p>
      <div className="mt-12">
        {items.length ? (
          <ProductGrid items={items} />
        ) : (
          <p className="py-20 text-center text-muted-foreground">Nenhum favorito ainda.</p>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — Ateliê" }] }),
  component: FavoritesPage,
});
