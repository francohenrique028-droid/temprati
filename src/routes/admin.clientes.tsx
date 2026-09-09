import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Users, Phone, CalendarDays } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({
    meta: [{ title: "Clientes · Admin #temprati" }, { name: "robots", content: "noindex" }],
  }),
  component: ClientesPage,
});

type Client = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

const PAGE_SIZE = 25;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function loadClientRows() {
  const [{ data: profiles, error: profilesError }, { data: adminRoles, error: rolesError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,phone,created_at")
      .order("created_at", { ascending: false })
      .range(0, 4999),
    supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin"),
  ]);

  if (profilesError) throw profilesError;
  if (rolesError) throw rolesError;

  const adminIds = new Set((adminRoles ?? []).map((row) => row.user_id));
  return ((profiles ?? []) as Client[]).filter((profile) => !adminIds.has(profile.id));
}

function ClientesPage() {
  const [rows, setRows] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setRows(await loadClientRows());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os clientes.");
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!term) return rows;
    return rows.filter((client) =>
      normalize(client.full_name ?? "").includes(term) ||
      normalize(client.phone ?? "").includes(term),
    );
  }, [query, rows]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <AdminShell title="Clientes" hideHeader>
      <div className="min-h-screen -m-4 md:-m-6 bg-[#f7f9fc] px-6 py-7 md:px-8 md:py-8 lg:px-9 lg:py-7">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[30px] font-extrabold leading-none tracking-[-0.035em] text-[#102a48] md:text-[36px]">CLIENTES</h1>
              <p className="mt-2 text-[12px] text-[#7890aa]">Clientes cadastrados na loja.</p>
            </div>
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d7dee7] bg-white px-3.5 text-[11px] font-semibold text-[#33475b] shadow-sm transition hover:bg-[#f9fafb] disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar dados
            </button>
          </div>

          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-[#edf0f4] bg-white px-5 py-4 shadow-[0_2px_7px_rgba(15,23,42,0.045)]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#61768d]">Total de clientes</p>
                <p className="mt-2 text-[23px] font-extrabold leading-none text-[#10233a]">{loading ? "—" : rows.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-rose-50">
                <Users className="h-[18px] w-[18px] text-rose-500" strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[#edf0f4] bg-white px-5 py-4 shadow-[0_2px_7px_rgba(15,23,42,0.045)]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#61768d]">Com telefone</p>
                <p className="mt-2 text-[23px] font-extrabold leading-none text-[#10233a]">{loading ? "—" : rows.filter((client) => Boolean(client.phone?.trim())).length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-100">
                <Phone className="h-[18px] w-[18px] text-slate-500" strokeWidth={1.8} />
              </div>
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <input
                value={query}
                onChange={(event) => {
                  setPage(0);
                  setQuery(event.target.value);
                }}
                placeholder="Buscar por nome ou telefone..."
                className="h-11 w-full rounded-xl border border-[#dbe2ea] bg-white pl-10 pr-4 text-[12px] text-[#10233a] outline-none transition focus:border-[#d9786e]"
              />
            </div>
            <span className="text-[11px] font-medium text-[#7890aa]">
              {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
            </span>
          </div>

          <section className="mt-4 overflow-hidden rounded-2xl border border-[#dbe2ea] bg-white shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-[#f7f9fc] text-left text-[10px] uppercase tracking-[0.08em] text-[#61768d]">
                  <tr>
                    <th className="px-5 py-3.5">Cliente</th>
                    <th className="px-5 py-3.5">Telefone</th>
                    <th className="px-5 py-3.5">Cadastro</th>
                    <th className="px-5 py-3.5 text-right">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f5]">
                  {!loading && visibleRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-16 text-center">
                        <Users className="mx-auto h-7 w-7 text-[#b5bfca]" />
                        <p className="mt-3 text-sm font-semibold text-[#34495e]">Nenhum cliente encontrado</p>
                        <p className="mt-1 text-[11px] text-[#8a9aae]">Quando uma conta de cliente for criada, ela aparecerá aqui.</p>
                      </td>
                    </tr>
                  )}
                  {visibleRows.map((client) => (
                    <tr key={client.id} className="transition hover:bg-[#fbfcfe]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff1f2] text-[12px] font-bold text-[#b4535c]">
                            {(client.full_name?.trim().charAt(0) || "C").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#1f3044]">{client.full_name?.trim() || "Cliente sem nome"}</p>
                            <p className="mt-0.5 text-[10px] text-[#8a9aae]">Cadastro de cliente</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#506784]">{client.phone?.trim() || "Não informado"}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[#506784]">
                          <CalendarDays className="h-3.5 w-3.5 text-[#94a3b8]" />
                          {formatDate(client.created_at)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-[10px] text-[#94a3b8]">{client.id.slice(0, 8)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#eef1f5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[11px] text-[#7890aa]">Página {safePage + 1} de {pageCount}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={safePage === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  className="rounded-lg border border-[#dbe2ea] px-3 py-1.5 text-[11px] font-semibold text-[#506784] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                  className="rounded-lg border border-[#dbe2ea] px-3 py-1.5 text-[11px] font-semibold text-[#506784] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
