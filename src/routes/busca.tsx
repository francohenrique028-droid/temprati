import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/busca")({
  head: () => ({ meta: [{ title: "Buscar — Ateliê" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(s) || p.category.includes(s) || p.collection.includes(s));
  }, [q]);
  const cats = Array.from(new Set(results.map(r => r.category)));

  return (
    <div className="container-x py-14">
      <h1 className="text-3xl font-light tracking-tight md:text-4xl">Busca</h1>
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar peças, coleções..." className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
      </div>
      {q && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em]">Categorias</h3>
            <ul className="space-y-2 text-sm">
              {cats.map(c => (
                <li key={c}><Link to="/categoria/$slug" params={{ slug: c }} className="capitalize hover:underline">{c}</Link></li>
              ))}
              {cats.length === 0 && <li className="text-muted-foreground">—</li>}
            </ul>
          </aside>
          <div>
            <p className="mb-6 text-sm text-muted-foreground">{results.length} resultado(s) para "{q}"</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-3">
              {results.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
