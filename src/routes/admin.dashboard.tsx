import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Box, Package, RefreshCw, ShoppingBag, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Admin #temprati" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

type Metric = {
  label: string;
  value: number | string;
  icon: typeof Package;
  iconClass: string;
  iconBg: string;
  to?: "/admin/produtos" | "/admin/categorias";
};

function DashboardPage() {
  const [products, setProducts] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard(isManualRefresh = false) {
    if (isManualRefresh) setRefreshing(true);

    // Não bloqueia a navegação/renderização do Dashboard: a consulta roda em background.
    const { data, error } = await supabase
      .from("products")
      .select("id,stock");

    if (!error) {
      const rows = data ?? [];
      setProducts(rows.length);
      setLowStock(rows.filter((row) => Number(row.stock ?? 0) <= 5).length);
    }

    setLoading(false);
    if (isManualRefresh) setRefreshing(false);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const metrics: Metric[] = [
    { label: "Produtos", value: loading ? "—" : products, icon: Package, iconClass: "text-slate-500", iconBg: "bg-slate-100", to: "/admin/produtos" },
    { label: "Pedidos", value: 0, icon: ShoppingBag, iconClass: "text-pink-500", iconBg: "bg-pink-50" },
    { label: "Clientes", value: 0, icon: Users, iconClass: "text-rose-500", iconBg: "bg-rose-50" },
    { label: "Estoque baixo", value: loading ? "—" : lowStock, icon: ArrowUpRight, iconClass: "text-rose-500", iconBg: "bg-rose-50" },
    { label: "Aguardando logística", value: 0, icon: Box, iconClass: "text-sky-500", iconBg: "bg-sky-50" },
  ];

  return (
    <AdminShell title="Dashboard" hideHeader>
      <div className="min-h-screen -m-4 md:-m-6 bg-[#f7f9fc] px-6 py-7 md:px-8 md:py-8 lg:px-9 lg:py-7">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-[30px] font-extrabold leading-none tracking-[-0.035em] text-[#102a48] md:text-[36px]">DASHBOARD</h1>
              <p className="mt-2 text-[12px] text-[#7890aa]">Bem-vindo ao painel administrativo da #temprati.</p>
            </div>
            <button type="button" onClick={() => void loadDashboard(true)} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-[#d7dee7] bg-white px-3.5 text-[11px] font-semibold text-[#33475b] shadow-sm transition hover:bg-[#f9fafb]">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />Atualizar dados
            </button>
          </div>
          <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const cardClass = "group flex h-[82px] items-center justify-between rounded-2xl border border-[#edf0f4] bg-white px-5 shadow-[0_2px_7px_rgba(15,23,42,0.045)] transition-all";
              const interactiveClass = "cursor-pointer hover:-translate-y-0.5 hover:border-[#d9e0e8] hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)]";
              const content = (
                <>
                  <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-[0.09em] text-[#61768d]">{metric.label}</p><p className="mt-2 text-[21px] font-extrabold leading-none text-[#10233a]">{metric.value}</p></div>
                  <div className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${metric.iconBg}`}><Icon className={`h-[18px] w-[18px] ${metric.iconClass}`} strokeWidth={1.8} /></div>
                </>
              );

              if (metric.to) {
                return <Link key={metric.label} to={metric.to} aria-label={`Abrir ${metric.label}`} className={`${cardClass} ${interactiveClass}`}>{content}</Link>;
              }

              return <div key={metric.label} className={cardClass}>{content}</div>;
            })}
          </section>
          <div className="min-h-[520px]" />
        </div>
      </div>
    </AdminShell>
  );
}
