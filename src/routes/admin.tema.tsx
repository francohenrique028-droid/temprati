import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Monitor, Tablet, Smartphone, Loader2, Save, RotateCcw, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { defaultTheme, THEME_MESSAGE, THEME_READY, type ThemeConfig } from "@/lib/theme/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tema")({
  head: () => ({ meta: [{ title: "Editor de Tema · Admin" }, { name: "robots", content: "noindex" }] }),
  component: ThemeEditorPage,
});

type SectionKey =
  | "brand-logo" | "brand-colors" | "brand-typography" | "brand-buttons"
  | "brand-spacing" | "brand-design" | "brand-advanced"
  | "header" | "home-banner" | "home-categories" | "home-featured"
  | "home-collections" | "home-list" | "product-page" | "cart" | "checkout"
  | "footer" | "social" | "seo" | "css" | "scripts" | "integrations" | "general";

type MenuItem = { key: SectionKey; label: string; group: string };
const MENU: MenuItem[] = [
  { key: "brand-logo", label: "Imagem da marca", group: "Marca" },
  { key: "brand-colors", label: "Cores da marca", group: "Marca" },
  { key: "brand-typography", label: "Tipografia", group: "Marca" },
  { key: "brand-buttons", label: "Botões", group: "Marca" },
  { key: "brand-spacing", label: "Espaçamentos", group: "Marca" },
  { key: "brand-design", label: "Opções de design", group: "Marca" },
  { key: "brand-advanced", label: "Configurações avançadas", group: "Marca" },
  { key: "header", label: "Cabeçalho", group: "Layout" },
  { key: "home-banner", label: "Banner", group: "Página Inicial" },
  { key: "home-categories", label: "Categorias", group: "Página Inicial" },
  { key: "home-featured", label: "Produtos em destaque", group: "Página Inicial" },
  { key: "home-collections", label: "Coleções", group: "Página Inicial" },
  { key: "home-list", label: "Lista de produtos", group: "Página Inicial" },
  { key: "product-page", label: "Página do Produto", group: "Loja" },
  { key: "cart", label: "Carrinho", group: "Loja" },
  { key: "checkout", label: "Checkout", group: "Loja" },
  { key: "footer", label: "Rodapé", group: "Layout" },
  { key: "social", label: "Redes Sociais", group: "Layout" },
  { key: "seo", label: "SEO", group: "Avançado" },
  { key: "css", label: "CSS Personalizado", group: "Avançado" },
  { key: "scripts", label: "Scripts", group: "Avançado" },
  { key: "integrations", label: "Integrações", group: "Avançado" },
  { key: "general", label: "Configurações Gerais", group: "Avançado" },
];

const DEVICE_WIDTHS = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;
type Device = keyof typeof DEVICE_WIDTHS;

function ThemeEditorPage() {
  const [savedTheme, setSavedTheme] = useState<ThemeConfig>(defaultTheme);
  const [draft, setDraft] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [active, setActive] = useState<SectionKey>("brand-colors");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Marca: true, "Página Inicial": true, Layout: true });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeReady = useRef(false);

  // Load
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

  // Post draft to iframe (debounced) whenever it changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (iframeReady.current) {
        iframeRef.current?.contentWindow?.postMessage({ type: THEME_MESSAGE, theme: draft }, "*");
      }
    }, 120);
    return () => clearTimeout(t);
  }, [draft]);

  // Listen for iframe ready
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === THEME_READY) {
        iframeReady.current = true;
        iframeRef.current?.contentWindow?.postMessage({ type: THEME_MESSAGE, theme: draft }, "*");
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = useMemo(() => JSON.stringify(savedTheme) !== JSON.stringify(draft), [savedTheme, draft]);

  const update = useCallback((patch: (d: ThemeConfig) => ThemeConfig) => {
    setDraft((d) => patch({ ...d }));
  }, []);

  async function handleSave() {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("theme_settings").update({ config: draft }).eq("singleton", true);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar: " + error.message); return; }
    setSavedTheme(draft);
    toast.success("Alterações publicadas");
  }

  function handleDiscard() {
    setDraft(savedTheme);
    toast("Alterações descartadas");
  }

  const grouped = useMemo(() => {
    const m: Record<string, MenuItem[]> = {};
    for (const it of MENU) { (m[it.group] ??= []).push(it); }
    return m;
  }, []);

  return (
    <AdminShell title="Editor de Tema">
      <div className="fixed inset-0 top-14 md:left-60 flex bg-neutral-50">
        {/* SIDEBAR */}
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white">
          <div className="p-3 space-y-1">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <button
                  onClick={() => setOpenGroups((g) => ({ ...g, [group]: !g[group] }))}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-800"
                >
                  {group}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !openGroups[group] && "-rotate-90")} />
                </button>
                {openGroups[group] && (
                  <div className="mb-2">
                    {items.map((it) => (
                      <button
                        key={it.key}
                        onClick={() => setActive(it.key)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100",
                          active === it.key && "bg-neutral-900 text-white hover:bg-neutral-900",
                        )}
                      >
                        {it.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* PREVIEW */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-12 shrink-0 border-b border-neutral-200 bg-white flex items-center justify-between px-4">
            <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-0.5">
              {(["desktop", "tablet", "mobile"] as Device[]).map((d) => {
                const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs", device === d ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100")}
                    title={d}
                  ><Icon className="h-3.5 w-3.5" />{d}</button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {dirty && <span className="text-xs text-amber-600">Alterações não publicadas</span>}
              <button onClick={handleDiscard} disabled={!dirty || saving} className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 disabled:opacity-50 hover:bg-neutral-50">
                <RotateCcw className="h-3.5 w-3.5" /> Descartar
              </button>
              <button onClick={handleSave} disabled={!dirty || saving} className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:bg-neutral-800">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Publicar
              </button>
              <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50" title="Abrir loja"><ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
            <div style={{ width: DEVICE_WIDTHS[device] }} className="max-w-full h-full min-h-[600px] bg-white shadow-lg rounded-lg overflow-hidden transition-all">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-neutral-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando…</div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src="/?editor=1"
                  title="Preview"
                  className="h-[calc(100vh-8rem)] w-full border-0"
                />
              )}
            </div>
          </div>
        </div>

        {/* PROPERTIES PANEL */}
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-neutral-200 bg-white">
          <div className="p-5">
            <h2 className="text-sm font-semibold text-neutral-900">{MENU.find(m => m.key === active)?.label}</h2>
            <p className="mt-1 text-xs text-neutral-500">Alterações aparecem em tempo real no preview.</p>
          </div>
          <div className="border-t border-neutral-100 p-5">
            <PropertiesPanel active={active} draft={draft} update={update} />
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

/* -------- Property panels -------- */

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
      {label}
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
    case "home-featured":
    case "home-list": {
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
    case "social": {
      const f = draft.footer;
      const setF = (patch: Partial<typeof f>) => update((d) => { d.footer = { ...d.footer, ...patch }; return d; });
      return (
        <div>
          <Field label="Instagram"><TextInput value={f.instagram} onChange={(e) => setF({ instagram: e.target.value })} /></Field>
          <Field label="Facebook"><TextInput value={f.facebook} onChange={(e) => setF({ facebook: e.target.value })} /></Field>
          <Field label="WhatsApp"><TextInput value={f.whatsapp} onChange={(e) => setF({ whatsapp: e.target.value })} /></Field>
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
