import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { fetchPublishedProducts, newArrivals, type Product } from "@/lib/products";

function NewArrivalsPage() {
  const [items, setItems] = useState<Product[]>(newArrivals());

  useEffect(() => {
    let active = true;
    fetchPublishedProducts().then((products) => {
      if (!active || products === null) return;
      setItems(products.filter((p) => p.isNew || p.badge === "Novo"));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container-x py-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Recém-chegados
      </p>
      <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">Novidades</h1>
      <div className="mt-12">
        {items.length ? (
          <ProductGrid items={items} />
        ) : (
          <p className="py-20 text-center text-muted-foreground">Nenhuma novidade ativa ainda.</p>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/novidades")({
  head: () => ({
    meta: [
      { title: "Novidades — Ateliê" },
      { name: "description", content: "As últimas peças que chegaram ao Ateliê." },
    ],
  }),
  component: NewArrivalsPage,
});
