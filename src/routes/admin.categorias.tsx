import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Layers3, Loader2, Pencil, Pipette, Plus, Save, Search, Trash2, Upload, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categorias")({
  head: () => ({ meta: [{ title: "Categorias · Admin #temprati" }, { name: "robots", content: "noindex" }] }),
  component: CategoriasPage,
});

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "draft";
  show_on_home: boolean;
  sort_order: number;
};

type ProductCategoryRow = {
  id: string;
  category: string | null;
};

const defaultTitle = "categorias em destaques";
const defaultTitleColor = "#000000";
const categoryImagesBucket = "category-images";
const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const maxImageBytes = 5 * 1024 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isMissingImageUrlColumn(message: string) {
  return message.includes("categories.image_url") && message.includes("does not exist");
}

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName === "jpg" ? "jpeg" : fromName;
  return file.type.split("/").pop() ?? "jpg";
}

function CategoriasPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("active");
  const [showOnHome, setShowOnHome] = useState(true);
  const [sectionTitle, setSectionTitle] = useState(defaultTitle);
  const [sectionColor, setSectionColor] = useState(defaultTitleColor);
  const [themeConfig, setThemeConfig] = useState<Record<string, unknown>>({});
  const [themeReady, setThemeReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [imageColumnReady, setImageColumnReady] = useState(true);

  async function load() {
    setLoading(true);
    setLoadError("");
    setThemeReady(false);

    const categoriesQuery = () =>
      supabase
        .from("categories")
        .select("id,name,slug,description,status,show_on_home,sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    const [categoriesResultWithImage, productsResult, themeResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id,name,slug,description,image_url,status,show_on_home,sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("products").select("id,category"),
      supabase.from("theme_settings").select("config").eq("singleton", true).maybeSingle(),
    ]);

    const categoriesResult =
      categoriesResultWithImage.error && isMissingImageUrlColumn(categoriesResultWithImage.error.message)
        ? await categoriesQuery()
        : categoriesResultWithImage;

    setImageColumnReady(!categoriesResultWithImage.error || !isMissingImageUrlColumn(categoriesResultWithImage.error.message));

    if (categoriesResult.error) {
      toast.error(categoriesResult.error.message);
      setLoadError(categoriesResult.error.message);
    } else {
      const nextRows = (categoriesResult.data ?? []).map((category) => ({
        ...category,
        image_url: "image_url" in category ? category.image_url : null,
      }));
      setRows(nextRows as Category[]);
      if (categoriesResultWithImage.error && isMissingImageUrlColumn(categoriesResultWithImage.error.message)) {
        toast.error("A coluna categories.image_url ainda não existe no Supabase. A lista foi carregada, mas o upload de foto depende da migration.");
      }
    }

    if (productsResult.error) {
      toast.error(productsResult.error.message);
      setLoadError(productsResult.error.message);
    } else {
      setProducts((productsResult.data ?? []) as ProductCategoryRow[]);
    }

    if (themeResult.error) {
      toast.error(themeResult.error.message);
      setLoadError(themeResult.error.message);
    } else {
      const config = asRecord(themeResult.data?.config);
      const categorySection = asRecord(config.categorySection);
      setThemeConfig(config);
      setThemeReady(true);
      setSectionTitle(typeof categorySection.title === "string" ? categorySection.title : defaultTitle);
      setSectionColor(typeof categorySection.titleColor === "string" ? categorySection.titleColor : defaultTitleColor);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((product) => {
      const slug = slugify(product.category ?? "");
      if (!slug) return;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const term = slugify(query);
    if (!term) return rows;
    return rows.filter((category) => category.slug.includes(term) || category.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, rows]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setStatus("active");
    setShowOnHome(true);
    setFormOpen(false);
  }

  function startCreate() {
    resetForm();
    setFormOpen(true);
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setImageUrl(category.image_url ?? "");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setStatus(category.status);
    setShowOnHome(category.show_on_home);
    setFormOpen(true);
  }

  function selectImage(file: File | undefined) {
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Use uma imagem PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > maxImageBytes) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadCategoryImage(categorySlug: string) {
    if (!imageFile) return imageUrl || null;

    const path = `${categorySlug}/${Date.now()}-${crypto.randomUUID()}.${fileExtension(imageFile)}`;
    const { error } = await supabase.storage.from(categoryImagesBucket).upload(path, imageFile, {
      cacheControl: "31536000",
      contentType: imageFile.type,
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(categoryImagesBucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveCategory() {
    const cleanName = name.trim();
    if (!cleanName) return toast.error("Informe o nome da categoria.");
    if (imageFile && !imageColumnReady) {
      toast.error("Para salvar foto de categoria, rode primeiro a migration que adiciona categories.image_url e o bucket category-images.");
      return;
    }

    setSaving(true);
    const nextSlug = slugify(cleanName);
    if (!nextSlug) {
      setSaving(false);
      toast.error("Use um nome de categoria com letras ou números.");
      return;
    }

    let uploadedImageUrl: string | null = null;

    try {
      uploadedImageUrl = await uploadCategoryImage(nextSlug);
    } catch (error) {
      setSaving(false);
      toast.error(error instanceof Error ? error.message : "Não consegui enviar a foto da categoria.");
      return;
    }

    const payload = {
      name: cleanName,
      slug: nextSlug,
      description: description.trim() || null,
      status,
      show_on_home: showOnHome,
    };
    const payloadWithImage = imageColumnReady ? { ...payload, image_url: uploadedImageUrl } : payload;

    const result = editingId
      ? await supabase.from("categories").update(payloadWithImage).eq("id", editingId)
      : await supabase.from("categories").insert({ ...payloadWithImage, sort_order: rows.length });

    setSaving(false);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success(editingId ? "Categoria atualizada" : "Categoria criada");
    resetForm();
    await load();
  }

  async function removeCategory(category: Category) {
    const count = productCounts.get(category.slug) ?? 0;
    if (count > 0) {
      toast.error("Esta categoria possui produtos. Mova os produtos antes de excluir.");
      return;
    }
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;

    const { error } = await supabase.from("categories").delete().eq("id", category.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Categoria excluída");
    await load();
  }

  async function saveSettings() {
    if (!themeReady) {
      toast.error("Não consegui carregar a configuração atual da loja. Recarregue antes de salvar.");
      return;
    }

    setSaving(true);
    const previousCategorySection = asRecord(themeConfig.categorySection);
    const nextConfig = {
      ...themeConfig,
      categorySection: {
        ...previousCategorySection,
        title: sectionTitle,
        titleColor: sectionColor,
      },
    };

    const { error } = await supabase
      .from("theme_settings")
      .upsert({ singleton: true, config: nextConfig as Json }, { onConflict: "singleton" });

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setThemeConfig(nextConfig);
    toast.success("Configuração da seção salva");
  }

  return (
    <AdminShell title="Categorias" hideHeader>
      <div className="min-h-screen -m-4 bg-[#f7f9fc] px-6 py-8 md:-m-6 md:px-10 lg:px-12">
        <div className="mx-auto max-w-[1584px]">
          <header>
            <h1 className="text-[30px] font-extrabold leading-none text-[#102a48] md:text-[34px]">
              CATEGORIAS
            </h1>
            <p className="mt-2 text-[12px] text-[#506784]">Organize os produtos da sua loja por categorias.</p>
          </header>

          <section className="mt-14 rounded-2xl border border-[#dbe2ea] bg-white px-6 py-6 shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-black" />
                  <h2 className="text-[13px] font-extrabold text-[#07182c]">
                    Título e Cor da Seção na Página Inicial
                  </h2>
                </div>
                <p className="mt-2 pl-5 text-[11px] text-[#506784]">
                  Personalize o texto e a cor acima das categorias na Home (ou deixe em branco para ocultar o título)
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={sectionTitle}
                  onChange={(event) => setSectionTitle(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dbe2ea] bg-[#fbfcfe] px-4 text-[12px] font-semibold text-[#07182c] outline-none transition focus:border-[#d9786e] sm:w-60"
                />
                <label className="flex h-10 items-center gap-3 rounded-xl border border-[#dbe2ea] bg-[#fbfcfe] px-3">
                  <Pipette className="h-3.5 w-3.5 text-[#8393a7]" />
                  <input
                    type="color"
                    value={sectionColor}
                    onChange={(event) => setSectionColor(event.target.value)}
                    className="h-6 w-7 cursor-pointer border-0 bg-transparent p-0"
                    aria-label="Cor do título da seção"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void saveSettings()}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-[#d9786e] px-7 text-[12px] font-extrabold text-white shadow-sm transition hover:bg-[#cc6f65] disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "SALVAR"}
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa8b8]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar categoria..."
                className="h-11 w-full rounded-xl border border-[#dbe2ea] bg-white pl-11 pr-4 text-[13px] text-[#10233a] outline-none transition placeholder:text-[#8c9bae] focus:border-[#d9786e]"
              />
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#07182c] px-6 text-[12px] font-extrabold text-white shadow-sm transition hover:bg-[#102a48]"
            >
              <Plus className="h-4 w-4" /> NOVA CATEGORIA
            </button>
          </section>

          {formOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
              <section className="w-full max-w-md rounded-[22px] bg-white px-6 pb-6 pt-7 shadow-2xl">
                <div className="mb-4 flex items-start justify-between border-b border-[#edf0f4] pb-3">
                  <div>
                    <h2 className="text-[18px] font-extrabold text-[#07182c]">
                      {editingId ? "Editar Categoria" : "Nova Categoria"}
                    </h2>
                    <p className="mt-1 text-[11px] text-[#6d7f93]">
                      Preencha o nome e selecione a foto da categoria
                    </p>
                  </div>
                  <button type="button" onClick={resetForm} className="rounded-full p-1 text-[#8a96a6] hover:bg-[#f1f4f8]">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-extrabold text-[#10233a]">Nome da Categoria *</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ex: Roupas, Vestidos, Perfumaria..."
                      className="h-10 w-full rounded-xl border border-[#dbe2ea] bg-[#fbfcfe] px-4 text-[13px] outline-none transition placeholder:text-[#9aa8b8] focus:border-[#d9786e]"
                    />
                  </label>

                  <div>
                    <span className="mb-1.5 block text-[12px] font-extrabold text-[#10233a]">Foto da Categoria</span>
                    <label className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#dbe2ea] bg-[#fbfcfe] px-4 text-center transition hover:border-[#d9786e]">
                      {imagePreview || imageUrl ? (
                        <img
                          src={imagePreview || imageUrl}
                          alt="Prévia da categoria"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#506784] shadow-sm">
                            <Upload className="h-5 w-5" />
                          </span>
                          <span className="text-[12px] font-extrabold text-[#07182c]">
                            Clique para selecionar a foto da categoria
                          </span>
                          <span className="mt-3 text-[10px] font-semibold text-[#a0a8b4]">PNG, JPG ou WEBP até 5MB</span>
                        </>
                      )}
                      {(imagePreview || imageUrl) && (
                        <span className="relative rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-[#07182c] shadow-sm">
                          Trocar foto
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(event) => selectImage(event.target.files?.[0])}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] font-extrabold text-[#10233a]">Descrição (Opcional)</span>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Breve descrição da categoria..."
                      className="min-h-20 w-full resize-none rounded-xl border border-[#dbe2ea] bg-[#fbfcfe] px-4 py-3 text-[13px] outline-none transition placeholder:text-[#9aa8b8] focus:border-[#d9786e]"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-extrabold text-[#10233a]">Status</span>
                      <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value as "active" | "draft")}
                        className="h-10 w-full rounded-xl border border-[#dbe2ea] bg-[#fbfcfe] px-4 text-[13px] outline-none focus:border-[#d9786e]"
                      >
                        <option value="active">Ativa</option>
                        <option value="draft">Rascunho</option>
                      </select>
                    </label>
                    <label className="flex items-end gap-2 pb-2 text-[13px] font-semibold text-[#10233a]">
                      <input
                        type="checkbox"
                        checked={showOnHome}
                        onChange={(event) => setShowOnHome(event.target.checked)}
                        className="h-4 w-4 accent-[#d9786e]"
                      />
                      Aparecer no site
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-5 border-t border-[#edf0f4] pt-4">
                  <button type="button" onClick={resetForm} className="text-[12px] font-semibold text-[#394b60]">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveCategory()}
                    disabled={saving}
                    className="inline-flex h-10 min-w-[118px] items-center justify-center gap-2 rounded-xl bg-[#07182c] px-6 text-[12px] font-extrabold text-white shadow-lg shadow-[#07182c]/20 transition hover:bg-[#102a48] disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    SALVAR
                  </button>
                </div>
              </section>
            </div>
          )}

          <section className="mt-6 min-h-[254px] rounded-2xl border border-[#dbe2ea] bg-white shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
            {loading ? (
              <div className="flex min-h-[254px] items-center justify-center text-[#506784]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando categorias...
              </div>
            ) : loadError ? (
              <div className="flex min-h-[254px] flex-col items-center justify-center px-6 text-center">
                <p className="text-[14px] font-extrabold text-[#07182c]">Não foi possível carregar categorias</p>
                <p className="mt-2 max-w-lg text-[12px] text-[#506784]">{loadError}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-[254px] flex-col items-center justify-center px-6 text-center">
                <Layers3 className="h-12 w-12 text-[#d4d8dd]" strokeWidth={1.8} />
                <p className="mt-4 text-[14px] font-extrabold text-black">Nenhuma categoria encontrada</p>
                <p className="mt-3 text-[12px] text-[#506784]">
                  {rows.length === 0 ? "Cadastre sua primeira categoria." : "Tente buscar por outro nome."}
                </p>
                {rows.length === 0 && (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#07182c] px-6 text-[12px] font-extrabold text-white transition hover:bg-[#102a48]"
                  >
                    <Plus className="h-4 w-4" /> ADICIONAR CATEGORIA
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#edf0f4]">
                {filtered.map((category) => {
                  const total = productCounts.get(category.slug) ?? 0;
                  return (
                    <div
                      key={category.id}
                      className="grid gap-3 px-6 py-4 text-[13px] md:grid-cols-[1fr_140px_140px_120px]"
                    >
                      <div>
                        <p className="flex items-center gap-2 font-extrabold text-[#07182c]">
                          {category.image_url && <ImageIcon className="h-4 w-4 text-[#6d7f93]" />}
                          {category.name}
                        </p>
                        <p className="mt-1 text-[11px] text-[#6d7f93]">/categoria/{category.slug}</p>
                      </div>
                      <div className="text-[#506784]">
                        <span className="font-bold text-[#07182c]">{total}</span> produto(s)
                      </div>
                      <div className="text-[#506784]">
                        {category.show_on_home ? "Na Home" : "Oculta na Home"}
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => startEdit(category)} className="rounded-lg p-2 text-[#6d7f93] hover:bg-[#f1f4f8] hover:text-[#07182c]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => void removeCategory(category)} className="rounded-lg p-2 text-[#6d7f93] hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
