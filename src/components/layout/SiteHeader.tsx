import { Link } from "@tanstack/react-router";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";

type MegaCol = { title: string; links: string[] };
type NavItem = { label: string; to: string; mega?: MegaCol[] };

const nav: NavItem[] = [
  {
    label: "Novidades",
    to: "/novidades",
    mega: [
      { title: "Lançamentos", links: ["Coleção Outono 26", "Últimas peças", "Editorial"] },
      { title: "Destaques", links: ["Mais desejados", "Voltou ao estoque", "Presentes"] },
    ],
  },
  {
    label: "Masculino",
    to: "/categoria/masculino",
    mega: [
      { title: "Vestuário", links: ["Camisas", "Camisetas", "Alfaiataria", "Tricôs", "Casacos"] },
      { title: "Calçados", links: ["Tênis", "Sapatos", "Botas"] },
      { title: "Acessórios", links: ["Cintos", "Bolsas", "Óculos"] },
    ],
  },
  {
    label: "Feminino",
    to: "/categoria/feminino",
    mega: [
      { title: "Vestuário", links: ["Vestidos", "Blusas", "Alfaiataria", "Tricôs", "Casacos"] },
      { title: "Calçados", links: ["Scarpins", "Botas", "Tênis"] },
      { title: "Acessórios", links: ["Bolsas", "Cintos", "Joias"] },
    ],
  },
  { label: "Acessórios", to: "/categoria/acessorios" },
  { label: "Promoções", to: "/categoria/promocoes" },
  { label: "Contato", to: "/contato" },
];

const announcements = [
  "Frete grátis acima de R$ 499",
  "Trocas grátis em até 30 dias",
  "Pagamento em até 10x sem juros",
  "Nova coleção Outono 26 disponível",
];

export function SiteHeader() {
  const { setOpen: openCart, count } = useCart();
  const { ids } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [ann, setAnn] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAnn((v) => (v + 1) % announcements.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-x flex h-9 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={ann}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0.6, 0.2, 1] }}
              className="text-[10.5px] font-medium uppercase tracking-[0.25em]"
            >
              {announcements[ann]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <header
        onMouseLeave={() => setHovered(null)}
        className={`sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md transition-shadow ${scrolled ? "shadow-[0_1px_0_rgba(31,31,31,0.05)]" : ""}`}
      >
        <div className="container-x">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-2 p-2" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block" />
            <Link to="/" className="justify-self-center text-[20px] font-semibold tracking-[0.4em] uppercase">
              Ateliê
            </Link>
            <div className="flex items-center gap-0.5 justify-self-end">
              <button onClick={() => setSearchOpen(v => !v)} aria-label="Pesquisar" className="p-2 hover:opacity-60 transition-opacity"><Search className="h-[18px] w-[18px]" /></button>
              <Link to="/favoritos" aria-label="Favoritos" className="relative p-2 hover:opacity-60">
                <Heart className="h-[18px] w-[18px]" />
                {ids.size > 0 && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
              <Link to="/conta" aria-label="Conta" className="p-2 hover:opacity-60 hidden sm:inline-flex"><User className="h-[18px] w-[18px]" /></Link>
              <button onClick={() => openCart(true)} aria-label="Carrinho" className="relative p-2 hover:opacity-60">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {count > 0 && <span className="absolute -top-0 -right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">{count}</span>}
              </button>
            </div>
          </div>

          {/* main nav */}
          <nav className="hidden lg:flex justify-center gap-10 pb-4 text-[12px] font-medium tracking-[0.15em] uppercase">
            {nav.map(n => (
              <div key={n.to} onMouseEnter={() => setHovered(n.label)}>
                <Link
                  to={n.to}
                  className="relative py-1 transition-colors hover:text-muted-foreground after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
                  activeProps={{ className: "text-primary [&]:after:scale-x-100" }}
                >
                  {n.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Mega menu */}
          <AnimatePresence>
            {hovered && nav.find(n => n.label === hovered)?.mega && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-full hidden border-t border-border bg-background/98 backdrop-blur-md lg:block"
              >
                <div className="container-x grid grid-cols-4 gap-10 py-10">
                  {nav.find(n => n.label === hovered)?.mega?.map(col => (
                    <div key={col.title}>
                      <p className="mb-4 text-[10.5px] font-medium uppercase tracking-[0.25em] text-muted-foreground">{col.title}</p>
                      <ul className="space-y-2.5">
                        {col.links.map(l => (
                          <li key={l}><Link to={nav.find(n => n.label === hovered)!.to} className="text-sm text-foreground/80 transition-colors hover:text-foreground">{l}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {searchOpen && (
            <div className="border-t border-border py-4">
              <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/busca?q=${encodeURIComponent(q)}`; }} className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por peça, coleção..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
        <div onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-black/30 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute inset-y-0 left-0 w-[85%] max-w-sm bg-background p-6 shadow-2xl transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold tracking-[0.35em] uppercase">Ateliê</span>
            <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {nav.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base hover:bg-secondary">{n.label}</Link>
            ))}
            <Link to="/conta" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base hover:bg-secondary">Minha Conta</Link>
            <Link to="/favoritos" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base hover:bg-secondary">Favoritos</Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
