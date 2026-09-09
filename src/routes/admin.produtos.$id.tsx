import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, Minus, Plus, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/produtos/$id")({
  head: () => ({
    meta: [{ title: "Produto · Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductEditor,
});

type Form = {
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string;
  cost: string;
  installments: string;
  freeInstallments: string;
  interestRate: string;
  pixDiscount: string;
  category: string;
  collection: string;
  brand: string;
  sku: string;
  stockMin: string;
  weight: string;
  height: string;
  width: string;
  length: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  status: "active" | "draft";
  featured: boolean;
};

type SizeStock = { label: string; qty: number };

const empty: Form = {
  name: "",
  slug: "",
  description: "",
  price: "",
  sale_price: "",
  cost: "",
  installments: "10",
  freeInstallments: "10",
  interestRate: "0",
  pixDiscount: "5",
  category: "",
  collection: "",
  brand: "",
  sku: "",
  stockMin: "0",
  weight: "",
  height: "",
  width: "",
  length: "",
  image_url: "",
  seo_title: "",
  seo_description: "",
  status: "active",
  featured: false,
};

const quickSizes = ["P", "M", "G", "GG", "XG", "36", "38", "40", "42", "44", "Único"];
const defaultSizes: SizeStock[] = [{ label: "P", qty: 1 }];
const categories = ["Vestidos", "Blusas", "Calças", "Calçados", "Acessórios", "Bolsas"];
const productFields =
  "id,name,slug,description,price,sale_price,category,collection,brand,sku,stock,weight,height,width,length,image_url,seo_title,seo_description,status,featured";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/jfif"]);
const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".jfif"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseMoney(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  if (cleaned.includes(",")) return Number(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
  return Number(cleaned) || 0;
}

function isBase64Image(value: string | null | undefined) {
  return Boolean(value?.trim().toLowerCase().startsWith("data:image/"));
}

function validateImageFile(file: File) {
  const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  const hasValidType = ALLOWED_IMAGE_TYPES.has(file.type);
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.includes(extension);
  const hasFileType = Boolean(file.type);

  if ((hasFileType && !hasValidType) || (!hasFileType && !hasValidExtension)) {
    return "Formato inválido. Envie PNG, JPG, WEBP ou JFIF.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Imagem muito grande. O limite é 10 MB por arquivo.";
  }

  return null;
}

function ProductEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "novo";
  const [form, setForm] = useState<Form>(empty);
  const [sizes, setSizes] = useState<SizeStock[]>(defaultSizes);
  const [customSize, setCustomSize] = useState("");
  const [customQty, setCustomQty] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const stockTotal = useMemo(() => sizes.reduce((sum, item) => sum + item.qty, 0), [sizes]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("products")
      .select(productFields)
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        if (!data) {
          toast.error("Produto não encontrado");
          navigate({ to: "/admin/produtos" });
          return;
        }
        setForm({
          ...empty,
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          price: data.price != null ? String(data.price) : "",
          sale_price: data.sale_price != null ? String(data.sale_price) : "",
          category: data.category ?? "",
          collection: data.collection ?? "",
          brand: data.brand ?? "",
          sku: data.sku ?? "",
          stockMin: "0",
          weight: data.weight != null ? String(data.weight) : "",
          height: data.height != null ? String(data.height) : "",
          width: data.width != null ? String(data.width) : "",
          length: data.length != null ? String(data.length) : "",
          image_url: data.image_url ?? "",
          seo_title: data.seo_title ?? "",
          seo_description: data.seo_description ?? "",
          status: (data.status ?? "draft") as "active" | "draft",
          featured: Boolean(data.featured),
        });
        setSizes([{ label: "Único", qty: Math.max(0, Number(data.stock ?? 0)) }]);
        setLoading(false);
      });
  }, [id, isNew, navigate]);

  function closeModal() {
    navigate({ to: "/admin/produtos" });
  }

  function resetForm() {
    setForm(empty);
    setSizes(defaultSizes);
    setCustomSize("");
    setCustomQty(1);
    setImageFile(null);
    setImagePreview("");
  }

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function selectPhoto(file: File | undefined) {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function ensureSize(label: string) {
    setSizes((prev) => {
      if (prev.some((item) => item.label === label)) return prev;
      return [...prev, { label, qty: 1 }];
    });
  }

  function addCustomSize() {
    const label = customSize.trim();
    if (!label) return;
    setSizes((prev) => {
      const exists = prev.find((item) => item.label.toLowerCase() === label.toLowerCase());
      if (exists) {
        return prev.map((item) =>
          item === exists ? { ...item, qty: item.qty + Math.max(1, customQty) } : item,
        );
      }
      return [...prev, { label, qty: Math.max(1, customQty) }];
    });
    setCustomSize("");
    setCustomQty(1);
  }

  function updateSize(label: string, qty: number) {
    setSizes((prev) =>
      prev.map((item) => (item.label === label ? { ...item, qty: Math.max(0, qty) } : item)),
    );
  }

  async function uploadImageIfNeeded() {
    if (isBase64Image(form.image_url)) {
      toast.error("A imagem precisa ser arquivo no Supabase Storage, não Base64.");
      throw new Error("Base64 image URLs are not allowed in product records.");
    }
    if (!imageFile) return form.image_url || null;

    const validationError = validateImageFile(imageFile);
    if (validationError) {
      toast.error(validationError);
      throw new Error(validationError);
    }

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const path = `${Date.now()}-${slugify(form.name) || "produto"}-${safeName}`;
    const { error } = await supabase.storage.from("product-images").upload(path, imageFile, {
      cacheControl: "3600",
      contentType: imageFile.type || undefined,
      upsert: false,
    });

    if (error) {
      toast.error("Não consegui enviar a foto. Confira se o bucket product-images existe no Supabase.");
      throw error;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave(saveAnother = false) {
    if (!form.name.trim()) return toast.error("Nome do produto é obrigatório");
    setSaving(true);

    try {
      const imageUrl = await uploadImageIfNeeded();
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description || null,
        price: parseMoney(form.price),
        sale_price: form.sale_price ? parseMoney(form.sale_price) : null,
        category: form.category || null,
        collection: form.collection || null,
        brand: form.brand || null,
        sku: form.sku || null,
        stock: stockTotal,
        weight: form.weight ? Number(form.weight) : null,
        height: form.height ? Number(form.height) : null,
        width: form.width ? Number(form.width) : null,
        length: form.length ? Number(form.length) : null,
        image_url: imageUrl,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        status: form.status,
        featured: form.featured,
      };

      const query = isNew
        ? supabase.from("products").insert(payload).select("id").single()
        : supabase.from("products").update(payload).eq("id", id).select("id").single();
      const { error } = await query;
      if (error) return toast.error(error.message);

      toast.success("Produto salvo");
      if (saveAnother) {
        resetForm();
        if (!isNew) navigate({ to: "/admin/produtos/$id", params: { id: "novo" } });
        return;
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-3rem)] w-[min(672px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{isNew ? "Novo produto" : "Editar produto"}</h2>
            <p className="mt-1 text-xs text-slate-500">Cadastre um novo produto no catálogo</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(false);
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <Section title="Informações básicas" first>
                <Field label="Nome do produto">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ex: Vestido Midi Evasê em Crepe"
                    className={inputClass}
                  />
                </Field>
                <Field label="SKU">
                  <input
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="Ex: VEST-MIDI-01"
                    className={inputClass}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Categoria">
                    <select
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      className={`${inputClass} ${!form.category ? "border-pink-500" : ""}`}
                    >
                      <option value="">Selecionar categoria</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => set("status", e.target.value as Form["status"])}
                      className={inputClass}
                    >
                      <option value="active">Ativo</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 accent-pink-600"
                  />
                  Produto em Destaque
                </label>
              </Section>

              <Section
                title="Tamanho / Medida"
                aside={`${sizes.length} tamanho(s) (${stockTotal} un. no total)`}
              >
                <div>
                  <p className="mb-3 text-xs font-bold text-slate-700">Tamanhos rápidos</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSizes.map((size) => {
                      const active = sizes.some((item) => item.label === size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => ensureSize(size)}
                          className={`h-8 min-w-8 rounded-lg border px-3 text-xs font-bold transition ${
                            active
                              ? "border-pink-600 bg-pink-600 text-white"
                              : "border-neutral-200 bg-neutral-50 text-slate-700 hover:border-pink-300"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-slate-700">Adicionar tamanho e estoque</p>
                  <div className="grid gap-2 sm:grid-cols-[1fr_92px_106px]">
                    <input
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder="Ex: G, 42, Busto 90cm ou '4 Tamanho G'..."
                      className={inputClass}
                    />
                    <input
                      type="number"
                      min={1}
                      value={customQty}
                      onChange={(e) => setCustomQty(Number(e.target.value) || 1)}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="rounded-xl bg-slate-500 px-4 py-2 text-xs font-bold text-white hover:bg-slate-600"
                    >
                      ADICIONAR
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <span>Definir quantidade em estoque de cada tamanho:</span>
                    <span className="text-slate-900">Total: {stockTotal} un.</span>
                  </div>
                  <div className="space-y-2">
                    {sizes.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-800">
                            {item.label.slice(0, 2)}
                          </span>
                          <span className="truncate text-sm font-bold text-slate-800">Tam. {item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateSize(item.label, item.qty - 1)}
                            className="rounded-full bg-neutral-100 p-1 text-neutral-500 hover:bg-neutral-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateSize(item.label, item.qty + 1)}
                            className="rounded-full bg-neutral-100 p-1 text-neutral-500 hover:bg-neutral-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSizes((prev) => prev.filter((size) => size.label !== item.label))}
                            className="rounded-full p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="Fotos do produto">
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-slate-50 px-4 py-8 text-center transition hover:border-pink-300 hover:bg-pink-50/30">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jfif"
                    className="hidden"
                    onChange={(e) => selectPhoto(e.target.files?.[0])}
                  />
                  {imagePreview || form.image_url ? (
                    <img
                      src={imagePreview || form.image_url}
                      alt="Prévia do produto"
                      className="max-h-40 rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                        <UploadCloud className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-bold text-slate-900">Clique para carregar fotos do produto</span>
                      <span className="mt-2 text-xs text-neutral-400">
                        Selecione uma ou várias fotos de uma vez (PNG, JPG, WEBP ou JFIF)
                      </span>
                    </>
                  )}
                </label>
              </Section>

              <Section title="Preços">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Preço de venda *">
                    <input
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder="R$ 189,90"
                      inputMode="decimal"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Preço promocional">
                    <input
                      value={form.sale_price}
                      onChange={(e) => set("sale_price", e.target.value)}
                      placeholder="R$ 159,90"
                      inputMode="decimal"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Custo">
                    <input
                      value={form.cost}
                      onChange={(e) => set("cost", e.target.value)}
                      placeholder="R$ 90,00"
                      inputMode="decimal"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-bold text-pink-600">Parcelas e Taxas da Parcela</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Field label="Número de parcelas">
                      <select
                        value={form.installments}
                        onChange={(e) => set("installments", e.target.value)}
                        className={inputClass}
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((value) => (
                          <option key={value} value={value}>{value}x</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Sem juros até">
                      <select
                        value={form.freeInstallments}
                        onChange={(e) => set("freeInstallments", e.target.value)}
                        className={inputClass}
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((value) => (
                          <option key={value} value={value}>{value}x sem juros</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Taxa de juros (% a.m.)">
                      <input
                        value={form.interestRate}
                        onChange={(e) => set("interestRate", e.target.value)}
                        inputMode="decimal"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Desconto no Pix (%)">
                      <input
                        value={form.pixDiscount}
                        onChange={(e) => set("pixDiscount", e.target.value)}
                        inputMode="decimal"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              <Section title="Estoque">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Estoque total">
                    <input value={stockTotal} readOnly className={`${inputClass} bg-slate-50`} />
                  </Field>
                  <Field label="Estoque mínimo">
                    <input
                      value={form.stockMin}
                      onChange={(e) => set("stockMin", e.target.value)}
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Descrição">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Descreva os detalhes do tecido, caimento e recomendações..."
                  className={inputClass}
                />
              </Section>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={closeModal}
                className="px-1 py-2 text-left text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="rounded-xl border border-neutral-200 px-5 py-3 text-xs font-bold text-slate-900 hover:bg-neutral-50 disabled:opacity-50"
                >
                  SALVAR E CADASTRAR OUTRO
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-pink-600/20 hover:bg-pink-700 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isNew ? "CRIAR PRODUTO" : "SALVAR PRODUTO"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10";

function Section({
  title,
  aside,
  first = false,
  children,
}: {
  title: string;
  aside?: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`${first ? "" : "border-t border-neutral-100 pt-5"} pb-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        {aside && <span className="text-xs font-bold text-pink-600">{aside}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
