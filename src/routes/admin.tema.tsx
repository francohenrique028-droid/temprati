import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown, ChevronRight, Loader2,
  Image as ImageIcon, Palette, Type, LayoutGrid, PanelTop,
  Home as HomeIcon, Images, Layers, Package, Tag, ShoppingCart, CreditCard,
  PanelBottom, Search, Code2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import { defaultTheme, THEME_MESSAGE, THEME_READY, THEME_SELECT, type ThemeConfig } from "@/lib/theme/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tema")({
  head: () => ({ meta: [{ title: "Editor de Tema · Admin" }, { name: "robots", content: "noindex" }] }),
  component: ThemeBuilderPage,
});

type SectionKey =
  | "brand-logo" | "brand-colors" | "brand-typography"
  | "layout" | "header" | "home-banner" | "home-categories" | "home-collections"
  | "home-featured" | "product-page" | "cart" | "checkout"
  | "footer" | "seo" | "css";

type MenuItem = { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> };
type MenuGroup = { title: string; items: MenuItem[] };

const MENU: MenuGroup[] = [
  { title: "Marca", items: [
    { key: "brand-logo", label: "Imagem da marca", icon: ImageIcon },
    { key: "brand-colors", label: "Cores", icon: Palette },
    { key: "brand-typography", label: "Tipografia", icon: Type },
  ]},
  { title: "Layout", items: [
    { key: "layout", label: "Layout", icon: LayoutGrid },
    { key: "header", label: "Cabeçalho", icon: PanelTop },
  ]},
  { title: "Página Inicial", items: [
    { key: "home-banner", label: "Banner", icon: HomeIcon },
    { key: "home-categories", label: "Categorias", icon: Images },
    { key: "home-collections", label: "Coleções", icon: Layers },
    { key: "home-featured", label: "Produtos", icon: Package },
  ]},
  { title: "Loja", items: [
    { key: "product-page", label: "Página Produto", icon: Tag },
    { key: "cart", label: "Carrinho", icon: ShoppingCart },
    { key: "checkout", label: "Checkout", icon: CreditCard },
  ]},
  { title: "Rodapé", items: [
    { key: "footer", label: "Rodapé", icon: PanelBottom },
  ]},
  { title: "Avançado", items: [
    { key: "seo", label: "SEO", icon: Search },
    { key: "css", label: "CSS Personalizado", icon: Code2 },
  ]},
];

const BLOCK_TO_SECTION: Record<string, SectionKey> = {
  "header": "header",
  "home-banner": "home-banner",
  "home-categories": "home-categories",
  "home-featured": "home-featured",
  "footer": "footer",
};

function ThemeBuilderPage() {
  const { loading: authLoading, user, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(defaultTheme);
  const [draft, setDraft] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<SectionKey | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(MENU.map((g) => [g.title, true]))
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeReady = useRef(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/admin/login" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("theme_settings").select("config").eq("singleton", true).maybeSingle();
      if (!error && data?.config) {
        const merged = { ...defaultTheme, ...data.config };
        setSavedTheme(merged);
        setDraft(merged);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (iframeReady.current) {
        iframeRef.current?.contentWindow?.postMessage({ type: THEME_MESSAGE, theme: draft }, "*");
      }
    }, 120);
    return () => clearTimeout(t);
  }, [draft]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === THEME_READY) {
        iframeReady.current = true;
        iframeRef.current?.contentWindow?.postMessage({ type: THEME_MESSAGE, theme: draftRef.current }, "*");
      }
      if (data.type === THEME_SELECT && typeof data.key === "string") {
        const target = BLOCK_TO_SECTION[data.key];
        if (target) setActive(target);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const dirty = useMemo(() => JSON.stringify(savedTheme) !== JSON.stringify(draft), [savedTheme, draft]);

  const update = useCallback((patch: (d: ThemeConfig) => ThemeConfig) => {
    setDraft((d) => patch({ ...d }));
  }, []);

  const doSave = useCallback(async (currentDraft: ThemeConfig) => {
    const { error } = await (supabase as any)
      .from("theme_settings").update({ config: currentDraft }).eq("singleton", true);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    setSavedTheme(currentDraft);
  }, []);

  useEffect(() => {
    if (!dirty || loading) return;
    const t = setTimeout(() => { doSave(draftRef.current); }, 1200);
    return () => clearTimeout(t);
  }, [draft, dirty, loading, doSave]);

  const activeItem = useMemo(() => {
    if (!active) return null;
    for (const g of MENU) for (const it of g.items) if (it.key === active) return it;
    return null;
  }, [active]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-sm text-neutral-500">Carregando…</div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-neutral-500">Sua conta não tem permissão de administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-neutral-100 text-neutral-900">
      {/* SIDEBAR */}
      <aside className="w-[280px] shrink-0 overflow-y-auto border-r border-neutral-200 bg-white">
        <div className="p-3 space-y-3">
          {MENU.map((group) => (
            <div key={group.title}>
              <button
                onClick={() => setOpenGroups((g) => ({ ...g, [group.title]: !g[group.title] }))}
                className="flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-800"
              >
                {group.title}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !openGroups[group.title] && "-rotate-90")} />
              </button>
              {openGroups[group.title] && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((it) => {
                    const isActive = active === it.key;
                    return (
                      <button key={it.key} onClick={() => setActive(it.key)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                          isActive ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                        )}
                      >
                        <it.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-neutral-500")} />
                        <span className="flex-1 truncate">{it.label}</span>
                        <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-white/70" : "text-neutral-400")} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* PREVIEW */}
      <div className="flex-1 min-w-0 bg-neutral-100">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando preview…
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src="/?editor=1"
            title="Preview da loja"
            className="h-full w-full border-0 bg-white"
          />
        )}
      </div>

      {/* PROPERTIES DRAWER */}
      <Sheet open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          <SheetHeader className="sticky top-0 z-10 border-b border-neutral-100 bg-white/95 backdrop-blur px-6 py-4">
            <div className="flex items-center gap-2">
              {activeItem?.icon && <activeItem.icon className="h-4 w-4 text-neutral-500" />}
              <SheetTitle className="text-sm font-semibold">{activeItem?.label ?? "Propriedades"}</SheetTitle>
            </div>
            <SheetDescription className="text-xs text-neutral-500">
              Alterações aparecem em tempo real no preview.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            {active && <PropertiesPanel active={active} draft={draft} update={update} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- Property panels ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="mb-1.5 block text-xs font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400" />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400" />;
}
function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 shrink-0 rounded border border-neutral-200 bg-white p-0.5" />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 font-mono text-xs" />
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 text-sm text-neutral-700">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={cn("h-5 w-9 rounded-full transition-colors", checked ? "bg-neutral-900" : "bg-neutral-300")}>
        <span className={cn("block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5", checked ? "translate-x-4" : "translate-x-0")} />
      </button>
    </label>
  );
}

type PP = { active: SectionKey; draft: ThemeConfig; update: (p: (d: ThemeConfig) => ThemeConfig) => void };

function PropertiesPanel({ active, draft, update }: PP) {
  switch (active) {
    case "brand-colors": {
      const c = draft.colors;
      const set = (k: keyof typeof c) => (v: string) => update((d) => { d.colors = { ...d.colors, [k]: v }; return d; });
      return (
        <div>
          <Field label="Cor primária"><ColorInput value={c.primary} onChange={set("primary")} /></Field>
          <Field label="Texto do botão primário"><ColorInput value={c.primaryForeground} onChange={set("primaryForeground")} /></Field>
          <Field label="Fundo"><ColorInput value={c.background} onChange={set("background")} /></Field>
          <Field label="Texto principal"><ColorInput value={c.foreground} onChange={set("foreground")} /></Field>
          <Field label="Fundo secundário"><ColorInput value={c.secondary} onChange={set("secondary")} /></Field>
          <Field label="Cinza (muted)"><ColorInput value={c.muted} onChange={set("muted")} /></Field>
          <Field label="Texto cinza"><ColorInput value={c.mutedForeground} onChange={set("mutedForeground")} /></Field>
          <Field label="Bordas"><ColorInput value={c.border} onChange={set("border")} /></Field>
          <Field label="Fundo do rodapé"><ColorInput value={c.footerBg} onChange={set("footerBg")} /></Field>
          <Field label="Texto do rodapé"><ColorInput value={c.footerText} onChange={set("footerText")} /></Field>
        </div>
      );
    }
    case "brand-typography": {
      const t = draft.typography;
      return (
        <div>
          <Field label="Fonte">
            <select value={t.fontFamily} onChange={(e) => update((d) => { d.typography = { ...d.typography, fontFamily: e.target.value }; return d; })} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
              {["Plus Jakarta Sans", "Inter", "DM Sans", "Poppins", "Roboto", "Playfair Display", "Cormorant Garamond"].map(f => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label={`Tamanho base (${t.baseSize}px)`}>
            <input type="range" min={12} max={22} value={t.baseSize} onChange={(e) => update((d) => { d.typography = { ...d.typography, baseSize: Number(e.target.value) }; return d; })} className="w-full" />
          </Field>
          <Field label="Peso dos títulos">
            <select value={t.headingWeight} onChange={(e) => update((d) => { d.typography = { ...d.typography, headingWeight: Number(e.target.value) }; return d; })} className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
              {[400,500,600,700,800].map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
        </div>
      );
    }
    case "brand-logo":
    case "header": {
      const h = draft.header;
      const setH = (patch: Partial<typeof h>) => update((d) => { d.header = { ...d.header, ...patch }; return d; });
      return (
        <div>
          <Field label="Logo (texto)"><TextInput value={h.logoText} onChange={(e) => setH({ logoText: e.target.value })} /></Field>
          <div className="mt-2">
            <Toggle label="Header fixo (sticky)" checked={h.sticky} onChange={(v) => setH({ sticky: v })} />
            <Toggle label="Mostrar busca" checked={h.showSearch} onChange={(v) => setH({ showSearch: v })} />
            <Toggle label="Mostrar favoritos" checked={h.showFavorites} onChange={(v) => setH({ showFavorites: v })} />
            <Toggle label="Mostrar conta" checked={h.showAccount} onChange={(v) => setH({ showAccount: v })} />
            <Toggle label="Mostrar carrinho" checked={h.showCart} onChange={(v) => setH({ showCart: v })} />
          </div>
          <Field label="Barra de avisos (um por linha)">
            <TextArea rows={4} value={h.announcements.join("\n")} onChange={(e) => setH({ announcements: e.target.value.split("\n").filter(Boolean) })} />
          </Field>
        </div>
      );
    }
    case "home-banner": {
      const b = draft.banner;
      const setB = (patch: Partial<typeof b>) => update((d) => { d.banner = { ...d.banner, ...patch }; return d; });
      return (
        <div>
          <Toggle label="Mostrar banner" checked={b.visible} onChange={(v) => setB({ visible: v })} />
          <Field label="Imagem desktop (URL)"><TextInput placeholder="https://…" value={b.desktopImage} onChange={(e) => setB({ desktopImage: e.target.value })} /></Field>
          <Field label="Imagem mobile (URL)"><TextInput placeholder="https://…" value={b.mobileImage} onChange={(e) => setB({ mobileImage: e.target.value })} /></Field>
          <Field label="Título"><TextInput value={b.title} onChange={(e) => setB({ title: e.target.value })} /></Field>
          <Field label="Subtítulo"><TextInput value={b.subtitle} onChange={(e) => setB({ subtitle: e.target.value })} /></Field>
          <Field label="Texto do botão"><TextInput value={b.buttonLabel} onChange={(e) => setB({ buttonLabel: e.target.value })} /></Field>
          <Field label="Link do botão"><TextInput value={b.buttonHref} onChange={(e) => setB({ buttonHref: e.target.value })} /></Field>
        </div>
      );
    }
    case "home-featured": {
      const p = draft.products;
      const setP = (patch: Partial<typeof p>) => update((d) => { d.products = { ...d.products, ...patch }; return d; });
      return (
        <div>
          <Field label={`Colunas no desktop: ${p.columnsDesktop}`}>
            <input type="range" min={2} max={6} value={p.columnsDesktop} onChange={(e) => setP({ columnsDesktop: Number(e.target.value) })} className="w-full" />
          </Field>
          <Field label={`Colunas no mobile: ${p.columnsMobile}`}>
            <input type="range" min={1} max={3} value={p.columnsMobile} onChange={(e) => setP({ columnsMobile: Number(e.target.value) })} className="w-full" />
          </Field>
          <Toggle label="Mostrar preço" checked={p.showPrice} onChange={(v) => setP({ showPrice: v })} />
          <Toggle label="Mostrar parcelamento" checked={p.showInstallments} onChange={(v) => setP({ showInstallments: v })} />
          <Toggle label="Mostrar botão comprar" checked={p.showBuyButton} onChange={(v) => setP({ showBuyButton: v })} />
          <Toggle label="Selo promoção" checked={p.showBadgeSale} onChange={(v) => setP({ showBadgeSale: v })} />
          <Toggle label="Selo novo" checked={p.showBadgeNew} onChange={(v) => setP({ showBadgeNew: v })} />
        </div>
      );
    }
    case "footer": {
      const f = draft.footer;
      const setF = (patch: Partial<typeof f>) => update((d) => { d.footer = { ...d.footer, ...patch }; return d; });
      return (
        <div>
          <Field label="Texto sobre a loja"><TextArea rows={3} value={f.aboutText} onChange={(e) => setF({ aboutText: e.target.value })} /></Field>
          <Field label="Copyright"><TextInput value={f.copyright} onChange={(e) => setF({ copyright: e.target.value })} /></Field>
          <Field label="Instagram (URL)"><TextInput value={f.instagram} onChange={(e) => setF({ instagram: e.target.value })} /></Field>
          <Field label="Facebook (URL)"><TextInput value={f.facebook} onChange={(e) => setF({ facebook: e.target.value })} /></Field>
          <Field label="WhatsApp (URL wa.me/...)"><TextInput value={f.whatsapp} onChange={(e) => setF({ whatsapp: e.target.value })} /></Field>
        </div>
      );
    }
    default:
      return (
        <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-xs text-neutral-500">
          Em breve. Este bloco será liberado nas próximas versões do editor.
        </div>
      );
  }
}
