import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ShoppingBag, DollarSign, Package, Users, TrendingUp, Clock, Truck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Admin" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

const cards = [
  { label: "Pedidos hoje", value: "0", icon: ShoppingBag },
  { label: "Faturamento", value: "R$ 0,00", icon: DollarSign },
  { label: "Produtos", value: "—", icon: Package },
  { label: "Clientes", value: "0", icon: Users },
  { label: "Conversão", value: "0%", icon: TrendingUp },
  { label: "Pedidos pendentes", value: "0", icon: Clock },
  { label: "Pedidos enviados", value: "0", icon: Truck },
  { label: "Sem estoque", value: "0", icon: AlertTriangle },
];

function DashboardPage() {
  return (
    <AdminShell title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">{c.label}</span>
              <c.icon className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Vendas · últimos 30 dias</h2>
          <div className="mt-4 flex h-56 items-center justify-center rounded-lg border border-dashed border-neutral-200 text-xs text-neutral-400">
            Gráfico será exibido quando houver dados de pedidos.
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Atividades recentes</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-500">
            <li>Nenhuma atividade ainda.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Últimos pedidos</h2>
          <p className="mt-2 text-xs text-neutral-500">Nenhum pedido registrado.</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm font-semibold">Mais vendidos</h2>
          <p className="mt-2 text-xs text-neutral-500">Ainda sem histórico de vendas.</p>
        </div>
      </div>
    </AdminShell>
  );
}
