import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({ meta: [{ title: "Produtos · Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProdutosPage,
});

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  category: string | null;
  status: string;
  image_url: string | null;
};

const PAGE_SIZE = 20;

function ProdutosPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "draft">("all");
  const [page, setPage] = useState(0);

  async function load() {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("id,name,sku,price,stock,category,status,image_url")
      .order("created_at", { ascending: false });
    if (status !== "all") query = query.eq("status", status);
    if (q) query = query.ilike("name", `%${q}%`);
    query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    setRows((data ?? []) as Product[]);
    setLoading(false);
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [q, status, page]);

  async function handleDelete(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Produto excluído");
    load();
  }

  const empty = useMemo(() => !loading && rows.length === 0, [loading, rows]);

  return (
    <AdminShell title="Produtos">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => {
                setPage(0);
                setQ(e.target.value);
              }}
              placeholder="Pesquisar por nome…"
              className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as typeof status);
            }}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>
        <Link
          to="/admin/produtos/$id"
          params={{ id: "novo" }}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" /> Novo produto
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  Carregando…
                </td>
              </tr>
            )}
            {empty && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-neutral-100">
                      {p.image_url && (
                        <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-500">{p.sku ?? "—"}</td>
                <td className="px-4 py-3">R$ {Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 text-neutral-500">{p.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${p.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}
                  >
                    {p.status === "active" ? "Ativo" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to="/admin/produtos/$id"
                      params={{ id: p.id }}
                      className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <span>Página {page + 1}</span>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded border border-neutral-200 px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            disabled={rows.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-neutral-200 px-3 py-1.5 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
