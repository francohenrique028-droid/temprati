import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/produtos/$id")({
  head: () => ({
    meta: [{ title: "Editar produto · Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductEditor,
});

type Form = {
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string;
  category: string;
  collection: string;
  brand: string;
  sku: string;
  stock: string;
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

const empty: Form = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  sale_price: "",
  category: "",
  collection: "",
  brand: "",
  sku: "",
  stock: "0",
  weight: "",
  height: "",
  width: "",
  length: "",
  image_url: "",
  seo_title: "",
  seo_description: "",
  status: "draft",
  featured: false,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ProductEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "novo";
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("products")
      .select("*")
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
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          price: String(data.price ?? 0),
          sale_price: data.sale_price != null ? String(data.sale_price) : "",
          category: data.category ?? "",
          collection: data.collection ?? "",
          brand: data.brand ?? "",
          sku: data.sku ?? "",
          stock: String(data.stock ?? 0),
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
        setLoading(false);
      });
  }, [id, isNew, navigate]);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nome é obrigatório");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description || null,
      price: Number(form.price) || 0,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      category: form.category || null,
      collection: form.collection || null,
      brand: form.brand || null,
      sku: form.sku || null,
      stock: Number(form.stock) || 0,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
      width: form.width ? Number(form.width) : null,
      length: form.length ? Number(form.length) : null,
      image_url: form.image_url || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      status: form.status,
      featured: form.featured,
    };
    const q = isNew
      ? supabase.from("products").insert(payload).select("id").single()
      : supabase.from("products").update(payload).eq("id", id).select("id").single();
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Produto salvo");
    navigate({ to: "/admin/produtos" });
  }

  if (loading)
    return (
      <AdminShell title="Produto">
        <div className="text-sm text-neutral-500">Carregando…</div>
      </AdminShell>
    );

  return (
    <AdminShell title={isNew ? "Novo produto" : "Editar produto"}>
      <button
        onClick={() => navigate({ to: "/admin/produtos" })}
        className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Informações">
            <Field label="Nome">
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inp}
              />
            </Field>
            <Field label="Slug (URL)">
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder={slugify(form.name)}
                className={inp}
              />
            </Field>
            <Field label="Descrição">
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={inp}
              />
            </Field>
          </Card>

          <Card title="Preços & estoque">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço (R$)">
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="Preço promocional">
                <input
                  type="number"
                  step="0.01"
                  value={form.sale_price}
                  onChange={(e) => set("sale_price", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="SKU">
                <input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="Estoque">
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  className={inp}
                />
              </Field>
            </div>
          </Card>

          <Card title="Dimensões (envio)">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Peso (kg)">
                <input
                  type="number"
                  step="0.01"
                  value={form.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="Altura (cm)">
                <input
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={(e) => set("height", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="Largura">
                <input
                  type="number"
                  step="0.1"
                  value={form.width}
                  onChange={(e) => set("width", e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="Comprimento">
                <input
                  type="number"
                  step="0.1"
                  value={form.length}
                  onChange={(e) => set("length", e.target.value)}
                  className={inp}
                />
              </Field>
            </div>
          </Card>

          <Card title="SEO">
            <Field label="Título SEO">
              <input
                value={form.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                className={inp}
              />
            </Field>
            <Field label="Descrição SEO">
              <textarea
                rows={3}
                value={form.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                className={inp}
              />
            </Field>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Status">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as Form["status"])}
                className={inp}
              >
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-neutral-700 mt-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Produto em destaque
            </label>
          </Card>

          <Card title="Imagem">
            <Field label="URL da imagem">
              <input
                value={form.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://…"
                className={inp}
              />
            </Field>
            {form.image_url && (
              <img
                src={form.image_url}
                alt=""
                className="mt-2 aspect-square w-full rounded-lg object-cover"
              />
            )}
          </Card>

          <Card title="Organização">
            <Field label="Categoria">
              <input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inp}
              />
            </Field>
            <Field label="Coleção">
              <input
                value={form.collection}
                onChange={(e) => set("collection", e.target.value)}
                className={inp}
              />
            </Field>
            <Field label="Marca">
              <input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                className={inp}
              />
            </Field>
          </Card>

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar produto
          </button>
        </div>
      </form>
    </AdminShell>
  );
}

const inp =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
