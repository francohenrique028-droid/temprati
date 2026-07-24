import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductGrid } from "@/components/product/ProductGrid";
import { products } from "@/lib/products";
import { useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${capitalize(params.slug)} — Ateliê` },
      { name: "description", content: `Coleção ${params.slug} — peças premium selecionadas.` },
    ],
  }),
  component: CategoryPage,
});

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function CategoryPage() {
  const { slug } = Route.useParams();
  const [sort, setSort] = useState("bestsellers");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (["feminino","vestidos","blusas","acessorios","calcados","conjuntos"].includes(slug)) list = list.filter(p => p.category === slug);
    else if (slug === "novidades") list = list.filter(p => p.isNew || p.badge === "Novo");
    else if (slug === "promocoes") list = list.filter(p => !!p.oldPrice || p.badge === "Promoção");
    else if (slug === "promocoes") list = list.filter(p => p.oldPrice);
    else if (["lancamentos","bestsellers"].includes(slug)) list = list.filter(p => p.collection === slug);
    list = list.filter(p => p.price <= maxPrice);
    if (sizes.length) list = list.filter(p => p.sizes.some(s => sizes.includes(s)));
    if (colors.length) list = list.filter(p => p.colors.some(c => colors.includes(c)));
    if (collections.length) list = list.filter(p => collections.includes(p.collection));
    if (sort === "priceAsc") list.sort((a,b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a,b) => b.price - a.price);
    if (sort === "new") list.sort((a,b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (sort === "bestsellers") list.sort((a,b) => Number(!!b.bestseller) - Number(!!a.bestseller));
    return list;
  }, [slug, sort, maxPrice, sizes, colors, collections]);

  const allSizes = Array.from(new Set(products.flatMap(p => p.sizes)));
  const allColors = Array.from(new Set(products.flatMap(p => p.colors)));
  const allCollections = ["lancamentos","bestsellers"];

  return (
    <div className="container-x py-10">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Início</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{capitalize(slug)}</span>
      </nav>
      <div className="mt-6 flex items-end justify-between">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">{capitalize(slug)}</h1>
        <p className="hidden text-sm text-muted-foreground md:block">{filtered.length} peças</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-8">
            <FilterBlock title="Preço">
              <input type="range" min={100} max={3000} step={50} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} className="w-full accent-primary" />
              <p className="mt-2 text-xs text-muted-foreground">Até R$ {maxPrice.toLocaleString("pt-BR")}</p>
            </FilterBlock>
            <FilterBlock title="Tamanho">
              <div className="flex flex-wrap gap-2">
                {allSizes.map(s => (
                  <button key={s} onClick={() => setSizes(v => v.includes(s) ? v.filter(x => x !== s) : [...v, s])} className={`min-w-10 rounded-full border px-3 py-1.5 text-xs transition-colors ${sizes.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{s}</button>
                ))}
              </div>
            </FilterBlock>
            <FilterBlock title="Cor">
              <div className="flex flex-wrap gap-2">
                {allColors.map(c => (
                  <button key={c} onClick={() => setColors(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c])} aria-label={c} className={`h-8 w-8 rounded-full border ${colors.includes(c) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border"}`} style={{ background: c }} />
                ))}
              </div>
            </FilterBlock>
            <FilterBlock title="Coleção">
              <div className="space-y-2">
                {allCollections.map(c => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={collections.includes(c)} onChange={() => setCollections(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c])} className="rounded border-border accent-primary" />
                    {capitalize(c)}
                  </label>
                ))}
              </div>
            </FilterBlock>
            <FilterBlock title="Marca"><p className="text-sm text-muted-foreground">Ateliê</p></FilterBlock>
          </div>
        </aside>

        <div>
          <div className="mb-8 flex items-center justify-between gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs lg:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)} className="ml-auto rounded-full border border-border bg-card px-5 py-2.5 text-xs outline-none focus:border-primary">
              <option value="bestsellers">Mais vendidos</option>
              <option value="new">Novidades</option>
              <option value="priceAsc">Menor preço</option>
              <option value="priceDesc">Maior preço</option>
            </select>
          </div>
          {filtered.length ? <ProductGrid items={filtered} /> : <p className="py-20 text-center text-muted-foreground">Nenhum produto encontrado.</p>}
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em]">{title}</h3>
      {children}
    </div>
  );
}
