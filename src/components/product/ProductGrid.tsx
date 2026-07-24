import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ items, cols = 4 }: { items: Product[]; cols?: 2 | 3 | 4 }) {
  const gridClass = cols === 4
    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    : cols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2";
  return (
    <div className={`grid ${gridClass} gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14`}>
      {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}
