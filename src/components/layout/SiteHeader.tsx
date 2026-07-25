import { Link } from "@tanstack/react-router";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTheme } from "@/lib/theme/ThemeProvider";


type MegaCol = { title: string; links: string[] };
type NavItem = { label: string; to: string; mega?: MegaCol[] };

const nav: NavItem[] = [
  {
    label: "novidades",
    to: "/categoria/novidades",
    mega: [
      { title: "recém-chegadas", links: ["lançamentos", "pré-venda", "edição limitada"] },
      { title: "destaques", links: ["mais vendidas", "coleção atual", "looks completos"] },
    ],
  },
  {
    label: "roupas",
    to: "/categoria/feminino",
    mega: [
      { title: "peças", links: ["vestidos", "blusas", "calças", "saias"] },
      { title: "outros", links: ["conjuntos", "alfaiataria", "tricot"] },
    ],
  },
  {
    label: "calçados",
    to: "/categoria/calcados",
    mega: [
      { title: "modelos", links: ["tênis", "scarpin", "sandálias", "botas"] },
      { title: "estilos", links: ["casual", "festa", "dia a dia"] },
    ],
  },
  {
    label: "acessórios",
    to: "/categoria/acessorios",
    mega: [
      { title: "essenciais", links: ["bolsas", "cintos", "óculos"] },
      { title: "detalhes", links: ["bijoux", "cachecóis", "chapéus"] },
    ],
  },
  { label: "coleções", to: "/categoria/novidades" },
  { label: "promoções", to: "/categoria/promocoes" },
];

const announcementsFallback = [
  "frete grátis acima de R$ 299",
];

export function SiteHeader() {
  const { theme } = useTheme();
  const announcements = theme.header.announcements?.length ? theme.header.announcements : announcementsFallback;
  const logoText = theme.header.logoText || "#temprati";
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
  }, [announcements.length]);

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
              className="text-[11px] font-medium lowercase tracking-wide"
            >
              {announcements[ann]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <header
        data-editor-block="header"
        onMouseLeave={() => setHovered(null)}
        className={`${theme.header.sticky ? "sticky top-0" : ""} z-40 border-b border-border bg-background/95 backdrop-blur-md transition-shadow ${scrolled ? "shadow-[0_1px_0_rgba(236,72,153,0.06)]" : ""}`}
      >
        <div className="container-x">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-2 p-2" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="flex items-center" aria-label="início">
                <span className="text-xl md:text-2xl font-bold tracking-tight lowercase text-primary">{logoText}</span>
              </Link>
            </div>

            {/* main nav (center) */}
            <nav className="hidden lg:flex items-center justify-center gap-8 text-sm font-medium lowercase">
              {nav.map(n => (
                <div key={n.to} onMouseEnter={() => setHovered(n.label)}>
                  <Link
                    to={n.to}
                    className="relative py-1 transition-colors hover:text-primary after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
                    activeProps={{ className: "text-primary [&]:after:scale-x-100" }}
                  >
                    {n.label}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-0.5 justify-end flex-1">
              {theme.header.showSearch && <button onClick={() => setSearchOpen(v => !v)} aria-label="Pesquisar" className="p-2 hover:text-primary transition-colors"><Search className="h-[18px] w-[18px]" /></button>}
              {theme.header.showFavorites && (
                <Link to="/favoritos" aria-label="Favoritos" className="relative p-2 hover:text-primary transition-colors">
                  <Heart className="h-[18px] w-[18px]" />
                  {ids.size > 0 && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              )}
              {theme.header.showAccount && <Link to="/conta" aria-label="Conta" className="p-2 hover:text-primary transition-colors hidden sm:inline-flex"><User className="h-[18px] w-[18px]" /></Link>}
              {theme.header.showCart && (
                <button onClick={() => openCart(true)} aria-label="Carrinho" className="relative p-2 hover:text-primary transition-colors">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {count > 0 && <span className="absolute -top-0 -right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{count}</span>}
                </button>
              )}
            </div>
          </div>

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
                      <p className="mb-4 text-[11px] font-medium lowercase tracking-wide text-primary">{col.title}</p>
                      <ul className="space-y-2.5">
                        {col.links.map(l => (
                          <li key={l}><Link to={nav.find(n => n.label === hovered)!.to} className="text-sm lowercase text-foreground/80 transition-colors hover:text-primary">{l}</Link></li>
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
              <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/busca?q=${encodeURIComponent(q)}`; }} className="mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-border bg-card px-5 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="buscar por produto, categoria..." className="w-full bg-transparent text-sm lowercase outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-primary"><X className="h-4 w-4" /></button>
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
            <span className="text-lg font-bold tracking-tight lowercase text-primary">{logoText}</span>
            <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {nav.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base lowercase hover:bg-secondary hover:text-primary">{n.label}</Link>
            ))}
            <Link to="/conta" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base lowercase hover:bg-secondary hover:text-primary">minha conta</Link>
            <Link to="/favoritos" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-base lowercase hover:bg-secondary hover:text-primary">favoritos</Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
