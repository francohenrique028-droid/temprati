import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, EyeOff, Image, Monitor, Pencil, Plus, Smartphone, UploadCloud, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({ meta: [{ title: "Banners · Admin" }, { name: "robots", content: "noindex" }] }),
  component: BannersPage,
});

type Banner = {
  id: string;
  name: string;
  link_url: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
  status: "active" | "inactive";
  sort_order: number;
};

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Use uma imagem PNG, JPG ou WEBP.";
  if (file.size > MAX_IMAGE_SIZE) return "A imagem deve ter no máximo 12 MB.";
  return null;
}

function UploadField({
  label,
  recommendation,
  file,
  existingUrl,
  required,
  onChange,
}: {
  label: string;
  recommendation: string;
  file: File | null;
  existingUrl?: string | null;
  required?: boolean;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : existingUrl), [file, existingUrl]);

  useEffect(() => () => {
    if (file && preview) URL.revokeObjectURL(preview);
  }, [file, preview]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-800">
        <span className="flex items-center gap-2">
          {label.includes("Desktop") ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          {label} {required ? "*" : "(Opcional)"}
        </span>
        <span className="text-[10px] font-normal text-neutral-400">Recomendado: {recommendation}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (!selected) return;
          const error = validateImage(selected);
          if (error) return toast.error(error);
          onChange(selected);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-center hover:border-pink-300"
      >
        {preview ? (
          <img src={preview} alt={`Prévia do ${label.toLowerCase()}`} className="max-h-52 w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center px-4">
            <span className="mb-3 rounded-full bg-pink-50 p-3 text-pink-600"><UploadCloud className="h-5 w-5" /></span>
            <strong className="text-xs text-slate-900">Clique para carregar imagem</strong>
            <small className="mt-2 text-[10px] text-neutral-400">PNG, JPG ou WEBP até 12MB · {recommendation}</small>
          </span>
        )}
      </button>
    </div>
  );
}

function BannersPage() {
  const [rows, setRows] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [name, setName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await (supabase as any)
      .from("banners")
      .select("id,name,link_url,desktop_image_url,mobile_image_url,status,sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError(error.message);
      toast.error(error.message);
    } else {
      setRows((data ?? []) as Banner[]);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const activeCount = rows.filter((banner) => banner.status === "active").length;

  function openNew() {
    setEditing(null);
    setName("");
    setLinkUrl("");
    setSortOrder(rows.length + 1);
    setStatus("active");
    setDesktopFile(null);
    setMobileFile(null);
    setModalOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setName(banner.name);
    setLinkUrl(banner.link_url ?? "");
    setSortOrder(banner.sort_order);
    setStatus(banner.status);
    setDesktopFile(null);
    setMobileFile(null);
    setModalOpen(true);
  }

  async function uploadImage(file: File, variant: "desktop" | "mobile") {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}/${variant}.${extension}`;
    const { error } = await supabase.storage.from("banner-images").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    return supabase.storage.from("banner-images").getPublicUrl(path).data.publicUrl;
  }

  async function saveBanner() {
    if (!name.trim()) return toast.error("Informe o nome do banner.");
    if (!editing && !desktopFile) return toast.error("Selecione a imagem desktop.");
    setSaving(true);
    try {
      const desktopUrl = desktopFile ? await uploadImage(desktopFile, "desktop") : editing?.desktop_image_url;
      const mobileUrl = mobileFile ? await uploadImage(mobileFile, "mobile") : editing?.mobile_image_url;
      const payload = {
        name: name.trim(),
        link_url: linkUrl.trim() || null,
        desktop_image_url: desktopUrl,
        mobile_image_url: mobileUrl || null,
        status,
        sort_order: Math.max(1, Number(sortOrder) || 1),
      };
      const query = editing
        ? (supabase as any).from("banners").update(payload).eq("id", editing.id)
        : (supabase as any).from("banners").insert(payload);
      const { error } = await query;
      if (error) throw error;
      toast.success(editing ? "Banner atualizado." : "Banner criado.");
      setModalOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o banner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell hideHeader>
      <div className="mx-auto max-w-[1584px] space-y-6 py-5">
        <section className="flex flex-col justify-between gap-5 rounded-xl border border-neutral-200 bg-white p-8 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase text-pink-600"><Image className="h-3 w-3" /> Marketing visual</span>
            <h1 className="mt-4 text-2xl font-black text-[#091a2e]">BANNERS</h1>
            <p className="mt-1 text-xs text-slate-500">Gerencie os banners exibidos na página inicial da sua loja.</p>
          </div>
          <button onClick={openNew} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 text-xs font-bold text-white shadow-sm hover:bg-pink-700"><Plus className="h-4 w-4" /> NOVO BANNER</button>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="TOTAL DE BANNERS" value={rows.length} icon={<Image className="h-5 w-5" />} />
          <Stat label="BANNERS ATIVOS" value={activeCount} icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} />
          <Stat label="BANNERS INATIVOS" value={rows.length - activeCount} icon={<EyeOff className="h-5 w-5 text-neutral-400" />} />
        </div>

        <section>
          <div className="mb-3 text-xs font-black text-[#091a2e]">LISTA DE BANNERS ({rows.length})</div>
          <div className="min-h-[300px] rounded-xl border border-neutral-200 bg-white p-5">
            {loading ? <div className="py-24 text-center text-sm text-neutral-400">Carregando...</div> : loadError ? (
              <div className="py-24 text-center"><strong className="text-sm">Não foi possível carregar banners</strong><p className="mt-2 text-xs text-red-500">{loadError}</p></div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center"><Image className="h-11 w-11 text-neutral-300" /><strong className="mt-4 text-sm">Nenhum banner cadastrado</strong><p className="mt-3 max-w-xs text-xs text-neutral-500">Cadastre seu primeiro banner para exibir na página inicial da loja.</p><button onClick={openNew} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4" /> ADICIONAR BANNER</button></div>
            ) : (
              <div className="space-y-3">{rows.map((banner) => <button key={banner.id} onClick={() => openEdit(banner)} className="flex w-full items-center gap-4 rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50"><img src={banner.desktop_image_url} alt="" loading="lazy" className="h-16 w-32 rounded-md object-cover" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{banner.name}</strong><small className="text-neutral-500">Ordem {banner.sort_order} · {banner.status === "active" ? "Ativo" : "Inativo"}</small></span><Pencil className="h-4 w-4 text-neutral-400" /></button>)}</div>
            )}
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
          <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5"><div><h2 className="text-xl font-bold text-[#091a2e]">{editing ? "Editar banner" : "Novo banner"}</h2><p className="mt-1 text-xs text-slate-500">Configure as imagens e o direcionamento do banner principal da loja</p></div><button onClick={() => setModalOpen(false)} aria-label="Fechar"><X className="h-5 w-5 text-neutral-400" /></button></div>
            <div className="space-y-6 overflow-y-auto px-6 py-6">
              <div><h3 className="mb-5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Identificação & destino</h3><label className="text-xs font-semibold">Nome do banner *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Coleção Outono / Inverno - 20% OFF" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none focus:border-pink-500" /><div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="text-xs font-semibold">Link do banner (Opcional)<input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/produtos" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 font-normal outline-none focus:border-pink-500" /></label><label className="text-xs font-semibold">Ordem<input type="number" min="1" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 font-normal outline-none focus:border-pink-500" /></label><label className="text-xs font-semibold">Status<select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 font-normal outline-none focus:border-pink-500"><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label></div></div>
              <UploadField label="Banner Desktop" recommendation="2000 x 651px" file={desktopFile} existingUrl={editing?.desktop_image_url} required onChange={setDesktopFile} />
              <UploadField label="Banner Mobile" recommendation="1248 x 1500px" file={mobileFile} existingUrl={editing?.mobile_image_url} onChange={setMobileFile} />
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-4"><button onClick={() => setModalOpen(false)} className="px-2 text-xs text-slate-600">Cancelar</button><button disabled={saving} onClick={() => void saveBanner()} className="rounded-xl bg-pink-600 px-6 py-3 text-xs font-bold text-white disabled:opacity-50">{saving ? "SALVANDO..." : "SALVAR BANNER"}</button></div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5"><div><div className="text-[10px] font-bold text-slate-500">{label}</div><div className="mt-2 text-2xl font-black text-[#091a2e]">{value}</div></div><span className="rounded-xl bg-slate-50 p-3 text-slate-500">{icon}</span></div>;
}
