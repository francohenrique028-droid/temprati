import { Link } from "@tanstack/react-router";
import { Search, Heart, User, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const nav = [
  { label: "Novidades", to: "/novidades" },
  { label: "Masculino", to: "/categoria/masculino" },
  { label: "Feminino", to: "/categoria/feminino" },
  { label: "Acessórios", to: "/categoria/acessorios" },
  { label: "Promoções", to: "/categoria/promocoes" },
  { label: "Contato", to: "/contato" },
] as const;

export function SiteHeader() {
  const { setOpen: openCart, count } = useCart();
  const { ids } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition-shadow ${scrolled ? "shadow-[0_1px_0_rgba(31,31,31,0.04)]" : ""}`}>
        <div className="container-x">
          {/* announcement */}
          <div className="hidden md:flex justify-center py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Frete grátis acima de R$ 499 · Trocas em até 30 dias
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-2 p-2" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block" />
            <Link to="/" className="justify-self-center text-[22px] font-semibold tracking-[0.35em] uppercase">
              Ateliê
            </Link>
            <div className="flex items-center gap-1 justify-self-end">
              <button onClick={() => setSearchOpen(v => !v)} aria-label="Pesquisar" className="p-2 hover:opacity-70 transition-opacity"><Search className="h-5 w-5" /></button>
              <Link to="/favoritos" aria-label="Favoritos" className="relative p-2 hover:opacity-70">
                <Heart className="h-5 w-5" />
                {ids.size > 0 && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
              <Link to="/conta" aria-label="Conta" className="p-2 hover:opacity-70 hidden sm:inline-flex"><User className="h-5 w-5" /></Link>
              <button onClick={() => openCart(true)} aria-label="Carrinho" className="relative p-2 hover:opacity-70">
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">{count}</span>}
              </button>
            </div>
          </div>
          {/* main nav */}
          <nav className="hidden lg:flex justify-center gap-10 pb-4 text-[13px] font-medium tracking-wide">
            {nav.map(n => (
              <Link key={n.to} to={n.to} className="relative py-1 transition-colors hover:text-muted-foreground after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:origin-center after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100" activeProps={{ className: "text-primary [&]:after:scale-x-100" }}>
                {n.label}
              </Link>
            ))}
          </nav>
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
