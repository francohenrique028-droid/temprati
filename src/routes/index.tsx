import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero.jpg";
import bannerImg from "@/assets/banner.jpg";
import catKits from "@/assets/cat-kits.jpg";
import catPerfumes from "@/assets/cat-perfumes.jpg";
import catSkincare from "@/assets/cat-skincare.jpg";
import catBath from "@/assets/cat-bath.jpg";
import { ProductGrid } from "@/components/product/ProductGrid";
import { bestsellers, newArrivals } from "@/lib/products";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "luxo — cosméticos e perfumaria premium" },
      { name: "description", content: "luxo sem igual: perfumes, skincare, bath & body e kits exclusivos. elegância e sofisticação contemporânea." },
      { property: "og:title", content: "luxo — cosméticos e perfumaria premium" },
      { property: "og:description", content: "luxo sem igual: perfumes, skincare, bath & body e kits exclusivos." },
    ],
  }),
  component: HomePage,
});

const categories = [
  { name: "kits", href: "/categoria/kits", img: catKits },
  { name: "perfumes", href: "/categoria/perfumes", img: catPerfumes },
  { name: "skincare", href: "/categoria/skincare", img: catSkincare },
  { name: "bath & body", href: "/categoria/bath", img: catBath },
];

const testimonials = [
  { name: "marina c.", text: "os perfumes são incríveis, fixação perfeita e embalagem digna de presente." },
  { name: "rafael l.", text: "skincare que realmente funciona. minha pele nunca esteve tão bem." },
  { name: "beatriz s.", text: "kit de presente lindo, chegou rápido e super bem embalado. amei!" },
];

function HomePage() {
  return (
    <>
      {/* HERO — banner liso rosa */}
      <section className="w-full">
        <div className="h-[60vh] min-h-[400px] w-full bg-secondary" />
      </section>


      {/* CATEGORIAS CIRCULARES */}
      <section className="container-x py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium lowercase tracking-wider text-primary">explore</p>
          <h2 className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl">categorias em destaque</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
          {categories.map((c, i) => (
            <motion.div
              key={c.name}
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
                <span className="text-sm font-medium lowercase tracking-wide text-foreground transition-colors group-hover:text-primary">{c.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="container-x py-14">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium lowercase tracking-wider text-primary">best sellers</p>
            <h2 className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl">mais vendidos</h2>
          </div>
          <Link to="/categoria/perfumes" className="hidden text-sm lowercase text-muted-foreground hover:text-primary md:inline">ver todos →</Link>
        </div>
        <ProductGrid items={bestsellers()} />
      </section>

      {/* BANNER DE OFERTA — rosa sólido */}
      <section className="container-x py-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-medium lowercase tracking-wider text-white/80">oferta exclusiva</p>
            <h3 className="mt-3 text-4xl font-semibold lowercase leading-tight tracking-tight md:text-6xl">
              até 30% off <span className="italic font-normal">na coleção</span>
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/85 md:text-base">
              seleção especial de perfumes e skincare por tempo limitado. luxo sem igual, agora com preços especiais.
            </p>
            <Link to="/categoria/perfumes" className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-medium lowercase text-primary shadow-soft transition-transform hover:scale-[1.02]">
              aproveitar oferta
            </Link>
          </motion.div>
        </div>
      </section>

      {/* NOVIDADES / LANÇAMENTOS */}
      <section className="container-x py-14">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium lowercase tracking-wider text-primary">recém-chegados</p>
            <h2 className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl">lançamentos</h2>
          </div>
          <Link to="/novidades" className="hidden text-sm lowercase text-muted-foreground hover:text-primary md:inline">ver todos →</Link>
        </div>
        <ProductGrid items={newArrivals()} />
      </section>

      {/* PARA ELES */}
      <section className="container-x py-16">
        <div className="grid items-center gap-8 rounded-2xl border border-border bg-secondary/50 p-8 md:grid-cols-2 md:p-14">
          <div>
            <p className="text-xs font-medium lowercase tracking-wider text-primary">para eles</p>
            <h3 className="mt-3 text-3xl font-semibold lowercase tracking-tight md:text-5xl">masculino</h3>
            <p className="mt-4 max-w-md text-sm text-muted-foreground md:text-base">
              fragrâncias marcantes e cuidados essenciais para o homem contemporâneo. mesma sofisticação, tons neutros.
            </p>
            <Link to="/categoria/masculino" className="mt-6 inline-block rounded-full border border-foreground bg-foreground px-7 py-3 text-sm font-medium lowercase text-background transition-colors hover:bg-transparent hover:text-foreground">
              explorar
            </Link>
          </div>
          <img src={bannerImg} alt="Coleção masculina" loading="lazy" width={1200} height={700} className="h-64 w-full rounded-xl object-cover shadow-soft md:h-80" />
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="container-x py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium lowercase tracking-wider text-primary">quem usa conta</p>
          <h2 className="mt-2 text-3xl font-semibold lowercase tracking-tight md:text-4xl">depoimentos</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <p className="text-sm leading-relaxed italic text-foreground/85">"{t.text}"</p>
              <p className="mt-6 text-xs font-medium lowercase tracking-wider text-primary">— {t.name}</p>
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
      <div className="mx-auto max-w-3xl rounded-2xl bg-secondary p-10 text-center md:p-16">
        <p className="mb-3 text-[11px] font-medium lowercase tracking-wider text-primary">newsletter</p>
        <h3 className="text-3xl font-semibold lowercase md:text-4xl">receba nossas <span className="italic font-normal text-primary">novidades</span></h3>
        <p className="mt-3 text-sm text-muted-foreground">lançamentos, ofertas exclusivas e dicas de beleza.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (!email) return; toast("cadastro realizado com sucesso"); setEmail(""); }} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="seu@email.com" className="flex-1 rounded-full border border-border bg-background px-5 py-4 text-sm lowercase outline-none placeholder:text-muted-foreground focus:border-primary transition-colors" />
          <button className="rounded-full bg-primary px-6 py-4 text-xs font-medium lowercase tracking-wide text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary)_88%,black)] transition-colors">cadastrar</button>
        </form>
      </div>
    </section>
  );
}
