import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Box,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Package,
  RefreshCw,
  ShoppingBag,
  Tags,
  Users,
  Warehouse,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard · Admin #temprati" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardPage,
});

type Metric = {
  label: string;
  value: number | string;
  icon: typeof Package;
  tone: string;
};

const menuSections = [
  {
    title: "Visão geral",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { label: "Produtos", icon: Package, href: "/admin/produtos" },
      { label: "Categorias", icon: Tags },
    ],
  },
  {
    title: "Vendas",
    items: [
      { label: "Pedidos", icon: ShoppingBag },
      { label: "Clientes", icon: Users },
    ],
  },
  {
    title: "Estoque",
    items: [{ label: "Controle de estoque", icon: Warehouse }],
  },
  {
    title: "Loja & marketing",
    items: [
      { label: "Conteúdo", icon: ClipboardList },
      { label: "Banners", icon: Boxes },
      { label: "Logística", icon: Box },
      { label: "Configurações", icon: CircleDollarSign },
    ],
  },
] as const;

function DashboardPage() {
  const [products, setProducts] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    setRefreshing(true);
    const { data, error } = await supabase.from("products").select("id,stock");
    if (!error) {
      const rows = data ?? [];
      setProducts(rows.length);
      setLowStock(rows.filter((row) => Number(row.stock ?? 0) <= 5).length);
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics: Metric[] = [
    { label: "Produtos", value: loading ? "—" : products, icon: Package, tone: "slate" },
    { label: "Pedidos", value: 0, icon: ShoppingBag, tone: "pink" },
    { label: "Clientes", value: 0, icon: Users, tone: "rose" },
    { label: "Estoque baixo", value: loading ? "—" : lowStock, icon: ArrowUpRight, tone: "red" },
    { label: "Aguardando logística", value: 0, icon: Box, tone: "blue" },
  ];

  return (
    <AdminShell title="Dashboard" hideHeader>
      <div className="min-h-[calc(100vh-3rem)] bg-[#f7f9fc] -m-4 md:-m-6 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#132c4d] sm:text-4xl">DASHBOARD</h1>
              <p className="mt-1 text-sm text-slate-500">Bem-vindo ao painel administrativo da #temprati.</p>
            </div>
            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar dados
            </button>
          </div>

          <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const iconBox =
                metric.tone === "blue"
                  ? "bg-sky-50 text-sky-500"
                  : metric.tone === "slate"
                    ? "bg-slate-100 text-slate-500"
                    : metric.tone === "pink"
                      ? "bg-pink-50 text-pink-500"
                      : metric.tone === "rose"
                        ? "bg-rose-50 text-rose-500"
                        : "bg-red-50 text-red-500";
              return (
                <div
                  key={metric.label}
                  className="flex min-h-[112px] items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{metric.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBox}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Resumo</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Acompanhe sua operação</h2>
                </div>
                <BarChart3 className="h-5 w-5 text-slate-300" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Catálogo", products, "produtos cadastrados"],
                  ["Estoque", lowStock, "itens em atenção"],
                  ["Pedidos", 0, "pedidos recebidos"],
                ].map(([label, value, helper]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="mt-2 text-xl font-extrabold text-slate-900">{value}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Acesso rápido</p>
              <div className="mt-4 space-y-2">
                <a href="/admin/produtos" className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <span className="flex items-center gap-3"><Package className="h-4 w-4 text-slate-400" />Gerenciar produtos</span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </a>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-400">
                  <span className="flex items-center gap-3"><Users className="h-4 w-4" />Gerenciar clientes</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-400">
                  <span className="flex items-center gap-3"><ShoppingBag className="h-4 w-4" />Ver pedidos</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
