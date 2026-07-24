import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero.jpg";
import { StaticBanner } from "@/components/layout/StaticBanner";
import bannerImg from "@/assets/banner.jpg";
import catMen from "@/assets/cat-men.jpg";
import catWomen from "@/assets/cat-women.jpg";
import catAcc from "@/assets/cat-accessories.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/section-header";
import { bestsellers, newArrivals } from "@/lib/products";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATELIÊ — Moda Premium Atemporal" },
      { name: "description", content: "Descubra a nova coleção Ateliê: alfaiataria, tricôs em cashmere e acessórios em couro italiano." },
      { property: "og:title", content: "ATELIÊ — Moda Premium Atemporal" },
      { property: "og:description", content: "Descubra a nova coleção Ateliê." },
    ],
  }),
  component: HomePage,
});

const categories = [
  { name: "Feminino", href: "/categoria/feminino", img: catWomen },
  { name: "Masculino", href: "/categoria/masculino", img: catMen },
  { name: "Acessórios", href: "/categoria/acessorios", img: catAcc },
  { name: "Calçados", href: "/categoria/calcados", img: catShoes },
  { name: "Novidades", href: "/novidades", img: catWomen },
  { name: "Promoções", href: "/categoria/promocoes", img: catMen },
];

const collections = [
  { name: "Coleção Verão", href: "/categoria/verao" },
  { name: "Coleção Inverno", href: "/categoria/inverno" },
  { name: "Casual", href: "/categoria/casual" },
  { name: "Social", href: "/categoria/social" },
  { name: "Esportivo", href: "/categoria/esportivo" },
];

const testimonials = [
  { name: "Marina C.", text: "Tecidos impecáveis e caimento perfeito. Cada peça é um investimento." },
  { name: "Rafael L.", text: "Atendimento cuidadoso, entrega bem embalada. Vou voltar sem dúvida." },
  { name: "Beatriz S.", text: "Encontrei aqui o meu trench dos sonhos. Recomendo demais." },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
          <img src={heroImg} alt="Nova coleção" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="container-x py-24">
        <SectionHeader eyebrow="Explore" title="Categorias">Escolha por universo.</SectionHeader>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {categories.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Link to={c.href} className="group relative block overflow-hidden rounded-2xl bg-card">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={c.img} alt={c.name} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.6,0.2,1)] group-hover:scale-[1.04]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                  <span className="rounded-full bg-background/95 backdrop-blur-sm px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em]">{c.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="container-x py-16">
        <SectionHeader eyebrow="Best-sellers" title="Mais Vendidos" action={{ label: "Ver tudo", to: "/categoria/feminino" }} />
        <ProductGrid items={bestsellers()} />
      </section>

      {/* NOVIDADES */}
      <section className="container-x py-16">
        <SectionHeader eyebrow="Recém-chegados" title="Novidades" action={{ label: "Ver tudo", to: "/novidades" }} />
        <ProductGrid items={newArrivals()} />
      </section>

      {/* COLEÇÕES */}
      <section className="container-x py-24">
        <SectionHeader eyebrow="Selecionadas" title="Coleções" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {collections.map((c) => (
            <Link key={c.name} to={c.href} className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:bg-secondary">
              <span className="text-sm font-medium tracking-wide">{c.name}</span>
              <span className="pointer-events-none absolute bottom-4 right-4 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* BANNER ESTÁTICO — troque src/assets/banner.jpg pela sua imagem */}
      <StaticBanner href="/novidades" alt="Banner promocional" />

      {/* DEPOIMENTOS */}
      <section className="container-x py-24">
        <SectionHeader eyebrow="Quem veste conta" title="Depoimentos" />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-8">
              <p className="text-sm leading-relaxed text-foreground/85">"{t.text}"</p>
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <Newsletter />
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  return (
    <section className="container-x pb-24">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-10 text-center md:p-16">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Newsletter</p>
        <h3 className="text-3xl font-light md:text-4xl">Receba nossas novidades.</h3>
        <p className="mt-3 text-sm text-muted-foreground">Editoriais, lançamentos e ofertas exclusivas.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (!email) return; toast("Cadastro realizado com sucesso"); setEmail(""); }} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="seu@email.com" className="flex-1 rounded-2xl border border-border bg-background px-5 py-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary transition-colors" />
          <button className="rounded-2xl bg-primary px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground hover:bg-[#333] transition-colors">Cadastrar</button>
        </form>
      </div>
    </section>
  );
}
