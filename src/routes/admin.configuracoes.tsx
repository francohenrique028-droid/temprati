import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircleDollarSign, Palette, Save, Store } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações · Admin" }, { name: "robots", content: "noindex" }] }),
  component: ConfiguracoesPage,
});

type Settings = {
  storeName: string;
  announcement: string;
  announcementEnabled: boolean;
  announcementBg: string;
  announcementText: string;
  freeShippingMinimum: string;
  pixDiscount: string;
};

const defaultSettings: Settings = {
  storeName: "#temprati",
  announcement: "",
  announcementEnabled: false,
  announcementBg: "#CD7169",
  announcementText: "#FFFFFF",
  freeShippingMinimum: "199,00",
  pixDiscount: "5",
};

function readSettings(config: unknown): Settings {
  const value = (config ?? {}) as Record<string, any>;
  const header = value.header ?? {};
  const colors = value.colors ?? {};
  const commerce = value.commerce ?? {};
  const announcements = Array.isArray(header.announcements) ? header.announcements : [];
  return {
    storeName: String(header.logoText ?? defaultSettings.storeName),
    announcement: String(announcements[0] ?? commerce.announcement ?? ""),
    announcementEnabled: Boolean(commerce.announcementEnabled ?? (announcements.length > 0)),
    announcementBg: String(commerce.announcementBg ?? colors.primary ?? defaultSettings.announcementBg),
    announcementText: String(commerce.announcementText ?? colors.primaryForeground ?? defaultSettings.announcementText),
    freeShippingMinimum: String(commerce.freeShippingMinimum ?? "199,00").replace(".", ","),
    pixDiscount: String(commerce.pixDiscount ?? 5),
  };
}

function toNumber(value: string) {
  const normalized = value.replace(/[^0-9,.-]/g, "").replace(/\.(?=.*\.)/g, "").replace(",", ".");
  return Number(normalized) || 0;
}

function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("theme_settings")
        .select("config")
        .eq("singleton", true)
        .maybeSingle();
      if (!active) return;
      if (error) toast.error("Não foi possível carregar as configurações.");
      else setSettings(readSettings(data?.config));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  function patch(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  async function save() {
    setSaving(true);
    try {
      const { data: current, error: readError } = await (supabase as any)
        .from("theme_settings")
        .select("id,config")
        .eq("singleton", true)
        .maybeSingle();
      if (readError) throw readError;

      const base = (current?.config ?? {}) as Record<string, any>;
      const next = {
        ...base,
        header: {
          ...(base.header ?? {}),
          logoText: settings.storeName.trim() || "#temprati",
          announcements: settings.announcement.trim() ? [settings.announcement.trim()] : [],
        },
        colors: {
          ...(base.colors ?? {}),
          primary: settings.announcementBg,
          primaryForeground: settings.announcementText,
        },
        commerce: {
          ...(base.commerce ?? {}),
          announcement: settings.announcement.trim(),
          announcementEnabled: settings.announcementEnabled,
          announcementBg: settings.announcementBg,
          announcementText: settings.announcementText,
          freeShippingMinimum: toNumber(settings.freeShippingMinimum),
          pixDiscount: toNumber(settings.pixDiscount),
        },
      };

      const query = current?.id
        ? (supabase as any).from("theme_settings").update({ config: next }).eq("id", current.id)
        : (supabase as any).from("theme_settings").insert({ singleton: true, config: next });
      const { error } = await query;
      if (error) throw error;
      toast.success("Configurações salvas com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  const previewText = settings.announcement.trim() || "A barra superior está desativada e não aparecerá na loja";

  return (
    <AdminShell hideHeader>
      <div className="mx-auto max-w-[1320px] space-y-5 py-2">
        <header className="px-1 pt-1">
          <h1 className="text-[29px] font-black leading-none tracking-[-0.035em] text-[#102a48] md:text-[34px]">CONFIGURAÇÕES GERAIS DA LOJA</h1>
          <p className="mt-2 text-[12px] text-[#7890aa]">Parâmetros globais, avisos e regras de frete e pagamento</p>
        </header>

        <section className="rounded-2xl border border-[#e3e7ec] bg-white px-7 py-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-[#edf0f3] pb-5">
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#152b44]"><Store className="h-4 w-4 text-pink-500" /> IDENTIDADE E MENSAGENS</div>
            <button type="button" onClick={() => patch({ announcementEnabled: !settings.announcementEnabled })} className="flex items-center gap-2 rounded-full border border-[#e3e7ec] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#64748b]">
              <span className={`relative h-5 w-9 rounded-full transition ${settings.announcementEnabled ? "bg-[#d9786e]" : "bg-[#d8dde2]"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${settings.announcementEnabled ? "left-4" : "left-0.5"}`} /></span>
              Barra Superior: {settings.announcementEnabled ? "ATIVADO" : "DESATIVADO"}
            </button>
          </div>

          <div className="space-y-5 pt-5">
            <Field label="Nome da Loja (Exibido no Topo e Rodapé)"><input value={settings.storeName} disabled={loading} onChange={(e) => patch({ storeName: e.target.value })} className={inputClass} /></Field>
            <Field label="Aviso da Barra Superior (Faixa de Notificação do Topo)"><input value={settings.announcement} disabled={loading} placeholder="Ex: 5% DE DESCONTO NO PIX | FRETE GRÁTIS ACIMA DE R$ 199" onChange={(e) => patch({ announcement: e.target.value })} className={inputClass} /></Field>

            <div className="rounded-xl border border-[#e7eaee] bg-[#fbfcfd] p-3.5">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold text-[#26384d]"><Palette className="h-3.5 w-3.5 text-pink-500" /> Personalizar Cores da Barra Superior</div>
              <div className="grid gap-4 md:grid-cols-2">
                <ColorField label="Cor de Fundo da Barra" value={settings.announcementBg} onChange={(value) => patch({ announcementBg: value })} />
                <ColorField label="Cor da Letra / Texto" value={settings.announcementText} onChange={(value) => patch({ announcementText: value })} />
              </div>
              <div className="mt-4 text-[9px] font-semibold uppercase tracking-wide text-[#8b98a7]">PRÉ-VISUALIZAÇÃO:</div>
              <div className="mt-1 flex min-h-8 items-center justify-center rounded-lg px-3 text-[10px] font-semibold" style={{ backgroundColor: settings.announcementEnabled ? settings.announcementBg : "#e4e4e4", color: settings.announcementEnabled ? settings.announcementText : "#a1a1a1" }}>
                {settings.announcementEnabled ? previewText : "A barra superior está DESATIVADA e não aparecerá na loja"}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e3e7ec] bg-white px-7 py-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2 border-b border-[#edf0f3] pb-5 text-[13px] font-extrabold text-[#152b44]"><CircleDollarSign className="h-4 w-4 text-pink-500" /> REGRAS COMERCIAIS</div>
          <div className="grid gap-4 pt-5 md:grid-cols-2">
            <Field label="Valor Mínimo para Frete Grátis (R$) (Usado na Sacola)"><input inputMode="decimal" value={settings.freeShippingMinimum} onChange={(e) => patch({ freeShippingMinimum: e.target.value })} className={inputClass} /></Field>
            <Field label="Desconto à vista no PIX (%)"><input inputMode="decimal" value={settings.pixDiscount} onChange={(e) => patch({ pixDiscount: e.target.value })} className={inputClass} /></Field>
          </div>
        </section>

        <div className="flex justify-center pb-2 pt-1">
          <button type="button" disabled={saving || loading} onClick={() => void save()} className="inline-flex h-10 min-w-[212px] items-center justify-center gap-2 rounded-xl bg-[#0d1f35] px-7 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-[#142a46] disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-3.5 w-3.5" /> {saving ? "SALVANDO..." : "SALVAR CONFIGURAÇÕES"}</button>
        </div>
      </div>
    </AdminShell>
  );
}

const inputClass = "h-9 w-full rounded-xl border border-[#dce2e8] bg-white px-3 text-[11px] text-[#25384c] outline-none transition focus:border-[#d9786e] focus:ring-2 focus:ring-[#d9786e]/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-[#172c43]">{label}</span>{children}</label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-[#172c43]">{label}</span><div className="flex h-9 items-center gap-2 rounded-xl border border-[#dce2e8] bg-white px-2"><input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-7 w-8 cursor-pointer border-0 bg-transparent p-0" /><input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-0 bg-transparent text-[11px] font-medium text-[#25384c] outline-none" /></div></label>;
}
