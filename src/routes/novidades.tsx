import { createFileRoute } from "@tanstack/react-router";
import { ProductGrid } from "@/components/product/ProductGrid";
import { newArrivals } from "@/lib/products";

export const Route = createFileRoute("/novidades")({
  head: () => ({
    meta: [
      { title: "Novidades — Ateliê" },
      { name: "description", content: "As últimas peças que chegaram ao Ateliê." },
    ],
  }),
  component: () => (
    <div className="container-x py-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Recém-chegados
      </p>
      <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">Novidades</h1>
      <div className="mt-12">
        <ProductGrid items={newArrivals()} />
      </div>
    </div>
  ),
});
