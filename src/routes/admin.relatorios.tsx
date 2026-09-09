import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Package, RefreshCw, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Order = {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
};

type Product = { id: string; stock: number };
type Client = { id: string };

function monthKey(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(year, month - 1, 1)).replace(".", "");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
}

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios · Admin #temprati" }, { name: "robots", content: "noindex" }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const [ordersResult, productsResult, clientsResult] = await Promise.all([
      supabase.from("orders").select("id,status,payment_status,total,created_at").order("created_at", { ascending: true }).range(0, 4999),
      supabase.from("products").select("id,stock"),
      supabase.from("profiles").select("id"),
    ]);
    if (ordersResult.error) toast.error(ordersResult.error.message); else setOrders((ordersResult.data ?? []) as Order[]);
    if (productsResult.error) toast.error(productsResult.error.message); else setProducts((productsResult.data ?? []) as Product[]);
    if (clientsResult.error) toast.error(clientsResult.error.message); else setClients((clientsResult.data ?? []) as Client[]);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { void load(); }, []);

  const metrics = useMemo(() => {
    const validOrders = orders.filter((order) => order.status !== "cancelled");
    const revenue = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const paid = orders.filter((order) => ["paid", "authorized"].includes(order.payment_status)).length;
    const pending = orders.filter((order) => order.status === "pending").length;
    const averageTicket = validOrders.length ? revenue / validOrders.length : 0;
    return { revenue, paid, pending, averageTicket };
  }, [orders]);

  const chart = useMemo(() => {
    const now = new Date();
    const keys = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });
    const values = keys.map((key) => orders.filter((order) => order.status !== "cancelled" && monthKey(order.created_at) === key).reduce((sum, order) => sum + Number(order.total || 0), 0));
    const max = Math.max(...values, 1);
    return { keys, values, max };
  }, [orders]);

  const statusRows = useMemo(() => [
    ["Pendentes", orders.filter((o) => o.status === "pending").length, "text-amber-600"],
    ["Confirmados", orders.filter((o) => o.status === "confirmed").length, "text-blue-600"],
    ["Em preparo", orders.filter((o) => o.status === "processing").length, "text-indigo-600"],
    ["Enviados", orders.filter((o) => o.status === "shipped").length, "text-sky-600"],
    ["Entregues", orders.filter((o) => o.status === "delivered").length, "text-emerald-600"],
    ["Cancelados", orders.filter((o) => o.status === "cancelled").length, "text-rose-600"],
  ] as const, [orders]);

  return (
    <AdminShell title="Relatórios" hideHeader>
      <div className="min-h-screen -m-4 md:-m-6 bg-[#f7f9fc] px-6 py-7 md:px-8 md:py-8 lg:px-9 lg:py-7">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[30px] font-extrabold leading-none tracking-[-0.035em] text-[#102a48] md:text-[36px]">RELATÓRIOS</h1>
              <p className="mt-2 text-[12px] text-[#7890aa]">Acompanhe o desempenho da loja com dados do catálogo, clientes e pedidos.</p>
            </div>
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d7dee7] bg-white px-3.5 text-[11px] font-semibold text-[#33475b] shadow-sm disabled:opacity-60">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Atualizar dados
            </button>
          </div>

          <section className="mt-10 grid gap-4 md:grid-cols-4">
            <Stat label="FATURAMENTO" value={formatPrice(metrics.revenue)} icon={<TrendingUp className="h-[18px] w-[18px] text-emerald-500" />} />
            <Stat label="PEDIDOS PAGOS" value={metrics.paid} icon={<CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />} />
            <Stat label="PEDIDOS PENDENTES" value={metrics.pending} icon={<Clock3 className="h-[18px] w-[18px] text-amber-500" />} />
            <Stat label="TICKET MÉDIO" value={formatPrice(metrics.averageTicket)} icon={<ShoppingBag className="h-[18px] w-[18px] text-sky-500" />} />
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <div className="rounded-2xl border border-[#dbe2ea] bg-white p-6 shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
              <div className="flex items-start justify-between">
                <div><h2 className="text-[13px] font-extrabold text-[#10233a]">Faturamento por mês</h2><p className="mt-1 text-[10px] text-[#8a9aae]">Últimos 6 meses</p></div>
                <BarChart3 className="h-5 w-5 text-[#94a3b8]" />
              </div>
              <div className="mt-8 flex h-52 items-end gap-3 sm:gap-5">
                {chart.values.map((value, index) => {
                  const height = Math.max(5, Math.round((value / chart.max) * 100));
                  return <div key={chart.keys[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-12 rounded-t-md bg-[#d9786e] transition-all" style={{ height: `${height}%` }} title={formatPrice(value)} /><span className="text-[10px] text-[#7890aa]">{monthLabel(chart.keys[index])}</span></div>;
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#dbe2ea] bg-white p-6 shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
              <h2 className="text-[13px] font-extrabold text-[#10233a]">Resumo da operação</h2>
              <div className="mt-6 space-y-5">
                <MiniStat label="Pedidos" value={orders.length} icon={<ShoppingBag className="h-4 w-4" />} />
                <MiniStat label="Clientes cadastrados" value={clients.length} icon={<Users className="h-4 w-4" />} />
                <MiniStat label="Produtos no catálogo" value={products.length} icon={<Package className="h-4 w-4" />} />
                <MiniStat label="Estoque total" value={products.reduce((sum, product) => sum + Number(product.stock || 0), 0)} icon={<Package className="h-4 w-4" />} />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-[#dbe2ea] bg-white p-6 shadow-[0_2px_7px_rgba(15,23,42,0.035)]">
            <div className="flex items-center justify-between"><div><h2 className="text-[13px] font-extrabold text-[#10233a]">Pedidos por status</h2><p className="mt-1 text-[10px] text-[#8a9aae]">Distribuição atual dos pedidos</p></div><ShoppingBag className="h-5 w-5 text-[#94a3b8]" /></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {statusRows.map(([label, value, color]) => <div key={label} className="flex items-center justify-between rounded-xl border border-[#edf0f4] bg-[#fbfcfe] px-4 py-3"><span className="text-[11px] font-semibold text-[#506784]">{label}</span><span className={`text-[18px] font-extrabold ${color}`}>{value}</span></div>)}
            </div>
          </section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#dbe2ea] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#61768d]">Taxa de conclusão</p><p className="mt-2 text-2xl font-extrabold text-[#10233a]">{orders.length ? Math.round((orders.filter((o) => o.status === "delivered").length / orders.length) * 100) : 0}%</p></div>
            <div className="rounded-2xl border border-[#dbe2ea] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#61768d]">Ticket médio</p><p className="mt-2 text-2xl font-extrabold text-[#10233a]">{formatPrice(metrics.averageTicket)}</p></div>
            <div className="rounded-2xl border border-[#dbe2ea] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#61768d]">Pedidos não cancelados</p><p className="mt-2 text-2xl font-extrabold text-[#10233a]">{orders.filter((o) => o.status !== "cancelled").length}</p></div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return <div className="flex items-center justify-between rounded-2xl border border-[#edf0f4] bg-white px-5 py-4 shadow-[0_2px_7px_rgba(15,23,42,0.045)]"><div><p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#61768d]">{label}</p><p className="mt-2 text-[21px] font-extrabold leading-none text-[#10233a]">{loadingPlaceholder(value)}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-100">{icon}</div></div>;
}

function loadingPlaceholder(value: string | number) {
  return value;
}

function MiniStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="flex items-center justify-between border-b border-[#eef1f5] pb-4 last:border-0 last:pb-0"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f6f9] text-[#6f849a]">{icon}</div><span className="text-[11px] font-semibold text-[#506784]">{label}</span></div><span className="text-[18px] font-extrabold text-[#10233a]">{value}</span></div>;
}
