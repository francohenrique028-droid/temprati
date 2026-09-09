import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categorias")({
  head: () => ({ meta: [{ title: "Categorias · Admin" }, { name: "robots", content: "noindex" }] }),
  component: CategoriasPage,
});

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "draft";
  show_on_home: boolean;
  sort_order: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function CategoriasPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,description,status,show_on_home,sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  function edit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
  }

  async function save() {
    const cleanName = name.trim();
    if (!cleanName) return toast.error("Informe o nome da categoria.");
    setSaving(true);
    const payload = {
      name: cleanName,
      slug: slugify(cleanName),
      description: description.trim() || null,
    };

    const result = editingId
      ? await supabase.from("categories").update(payload).eq("id", editingId)
      : await supabase.from("categories").insert({ ...payload, sort_order: rows.length });

    if (result.error) {
      toast.error(result.error.message);
      setSaving(false);
      return;
    }

    toast.success(editingId ? "Categoria atualizada" : "Categoria criada");
    resetForm();
    setSaving(false);
    await load();
  }

  async function remove(id: string) {
    const used = rows.find((item) => item.id === id);
    if (!used) return;
    if (!confirm(`Excluir a categoria "${used.name}"?`)) return;

    const { count, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", used.name);
    if (countError) return toast.error(countError.message);
    if ((count ?? 0) > 0) {
      return toast.error("Esta categoria possui produtos. Mova os produtos antes de excluir.");
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Categoria excluída");
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <AdminShell title="Categorias">
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">{editingId ? "Editar categoria" : "Nova categoria"}</h2>
              <p className="mt-1 text-xs text-neutral-500">Cadastre suas categorias manualmente.</p>
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
                Cancelar
              </button>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Vestidos" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Descrição</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Descrição opcional" className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900" />
            </label>
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus className="h-4 w-4" />
              {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar categoria"}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-base font-semibold">Categorias cadastradas</h2>
            <p className="mt-1 text-xs text-neutral-500">Comece com o catálogo vazio e adicione somente o que precisar.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-neutral-400">Carregando...</td></tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-neutral-400">Nenhuma categoria cadastrada.</td></tr>
                )}
                {rows.map((category) => (
                  <tr key={category.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{category.slug}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Ativa</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => edit(category)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" aria-label={`Editar ${category.name}`}><Pencil className="h-4 w-4" /></button>
                        <button type="button" onClick={() => void remove(category.id)} className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600" aria-label={`Excluir ${category.name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
