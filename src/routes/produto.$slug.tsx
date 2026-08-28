import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findBySlug, formatPrice, installment, products } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useState } from "react";
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Play,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const p = findBySlug(params.slug);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Ateliê` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — Ateliê` },
          { property: "og:description", content: loaderData.product.description },
        ]
      : [{ title: "Produto — Ateliê" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [main, setMain] = useState(0);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const { add, setOpen } = useCart();
  const { has, toggle } = useFavorites();
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  type Media = { type: "video" | "image"; src: string; poster?: string };
  const uniqueImages = product.images.filter(
    (src: string, index: number, list: string[]) => Boolean(src) && list.indexOf(src) === index,
  );
  const gallery: Media[] = [
    ...(product.video
      ? [{ type: "video" as const, src: product.video, poster: uniqueImages[0] }]
      : []),
    ...uniqueImages.map((src: string) => ({ type: "image" as const, src })),
  ];
  const current = gallery[main] ?? gallery[0];

  return (
    <div className="container-x py-8">
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to="/categoria/$slug"
          params={{ slug: product.category }}
          className="hover:text-foreground capitalize"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[100px_1fr_460px]">
        <div className="hidden lg:flex flex-col gap-3">
          {gallery.map((g, i) => (
            <button
              key={i}
              onClick={() => setMain(i)}
              className={`relative overflow-hidden rounded-xl border ${main === i ? "border-primary" : "border-border"}`}
            >
              <img
                src={g.type === "video" ? (g.poster ?? "") : g.src}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
              {g.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="rounded-full bg-white/90 p-2">
                    <Play className="h-4 w-4 fill-primary text-primary" />
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
        <div
          className="relative overflow-hidden rounded-2xl bg-card"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
        >
          {current.type === "video" ? (
            <video
              key={current.src}
              src={current.src}
              poster={current.poster}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full aspect-[4/5] object-cover"
            />
          ) : (
            <img
              src={current.src}
              alt={product.name}
              width={1000}
              height={1250}
              className={`w-full object-cover transition-transform duration-500 ${zoom ? "scale-[1.15]" : "scale-100"}`}
            />
          )}
          <div className="flex gap-2 p-3 lg:hidden">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setMain(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${main === i ? "border-primary" : "border-border"}`}
              >
                <img
                  src={g.type === "video" ? (g.poster ?? "") : g.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {g.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-3 w-3 fill-white text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          {product.badge && (
            <span className="mb-4 inline-block rounded-full bg-secondary px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em]">
              {product.badge}
            </span>
          )}
          <h1 className="text-3xl font-light tracking-tight md:text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{installment(product.price)}</p>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Cor</p>
              <p className="text-xs text-muted-foreground">{color}</p>
            </div>
            <div className="flex gap-2">
              {product.colors.map((c: string) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={`h-9 w-9 rounded-full border ${color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-border" : "border-border"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Tamanho</p>
              <button className="text-xs text-muted-foreground underline underline-offset-2">
                Guia de medidas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 rounded-xl border px-4 py-3 text-sm transition-colors ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Em estoque</p>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  add(product, { size, color, qty });
                }}

                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#FF0080] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#FF0080]/90 transition-colors shadow-lg shadow-[#FF0080]/20"
              >
                Comprar
              </button>
              <button
                onClick={() => {
                  add(product, { size, color, qty });
                  setOpen(false);
                }}

                className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl border-2 border-[#FF0080] text-[#FF0080] hover:bg-[#FF0080]/5 transition-colors"
              >
                <Plus className="h-4 w-4 mr-0.5" />
                <ShoppingBag className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => {
                toggle(product.id);
                toast(has(product.id) ? "Removido dos favoritos" : "Adicionado aos favoritos");
              }}
              className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <Heart className={`h-4 w-4 ${has(product.id) ? "fill-primary text-primary" : ""}`} />{" "}
              Favoritar
            </button>
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4" /> Frete grátis acima de R$ 499
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4" /> Trocas em até 30 dias
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" /> Compra 100% segura
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20"
      >
        <Tabs defaultValue="desc">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="desc"
              className="rounded-none border-b-2 border-transparent px-6 pb-4 pt-0 text-xs uppercase tracking-[0.2em] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Descrição
            </TabsTrigger>
            <TabsTrigger
              value="size"
              className="rounded-none border-b-2 border-transparent px-6 pb-4 pt-0 text-xs uppercase tracking-[0.2em] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Medidas
            </TabsTrigger>
            <TabsTrigger
              value="rev"
              className="rounded-none border-b-2 border-transparent px-6 pb-4 pt-0 text-xs uppercase tracking-[0.2em] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Avaliações
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="desc"
            className="max-w-2xl py-8 text-sm leading-relaxed text-foreground/85"
          >
            {product.description}
          </TabsContent>
          <TabsContent value="size" className="max-w-2xl py-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  <th className="py-3">Tam</th>
                  <th>Busto</th>
                  <th>Cintura</th>
                  <th>Quadril</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["P", "86", "68", "94"],
                  ["M", "90", "72", "98"],
                  ["G", "94", "76", "102"],
                  ["GG", "98", "80", "106"],
                ].map((r) => (
                  <tr key={r[0]} className="border-b border-border">
                    <td className="py-3 font-medium">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="rev" className="max-w-2xl py-8 space-y-6">
            {[
              { n: "Camila R.", t: "Vestiu perfeito, tecido lindo." },
              { n: "João P.", t: "Excelente acabamento." },
            ].map((r) => (
              <div key={r.n} className="border-b border-border pb-6">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {r.n} · ★★★★★
                </p>
                <p className="mt-2 text-sm">{r.t}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-10 text-3xl font-light tracking-tight">Você também vai gostar</h2>
          <ProductGrid items={related} />
        </section>
      )}
    </div>
  );
}
