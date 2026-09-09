import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Box,
  Boxes,
  CircleDollarSign,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Tags,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sections = [
  {
    title: "VISÃO GERAL",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
      { label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    title: "CATÁLOGO",
    items: [
      { label: "Produtos", icon: Package, to: "/admin/produtos" },
      { label: "Categorias", icon: Tags, to: "/admin/categorias" },
    ],
  },
  {
    title: "VENDAS",
    items: [
      { label: "Pedidos", icon: ShoppingBag },
      { label: "Clientes", icon: Users },
    ],
  },
  {
    title: "CONTROLE DE ACESSO",
    items: [{ label: "Logins", icon: KeyRound }],
  },
  {
    title: "LOJA & MARKETING",
    items: [
      { label: "Conteúdo & Shorts", icon: Boxes },
      { label: "Banners", icon: Boxes, to: "/admin/banners" },
      { label: "Logística", icon: Box },
      { label: "Configurações", icon: CircleDollarSign },
      { label: "Estoque", icon: Warehouse },
    ],
  },
] as const;

export function AdminSidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  function comingSoon(label: string) {
    toast.info(`${label}: módulo será ativado nesta próxima etapa.`);
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen?.(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] shrink-0 flex-col bg-[#091a2e] text-white transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-h-[68px] items-center justify-between border-b border-white/10 px-5">
          <div>
            <div className="text-[14px] font-extrabold tracking-tight">PAINEL ADMIN</div>
            <div className="mt-0.5 text-[10px] font-semibold tracking-[0.12em] text-slate-400">TEMPRATI</div>
          </div>
          <button onClick={() => setMobileOpen?.(false)} className="md:hidden" aria-label="Fechar menu">
            <X className="h-4 w-4 text-slate-300" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 pb-2 text-[9px] font-bold tracking-[0.16em] text-slate-500">{section.title}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = "to" in item && pathname === item.to;
                  if ("to" in item && item.to) {
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setMobileOpen?.(false)}
                        className={cn(
                          "flex h-9 items-center gap-3 rounded-xl px-3 text-[12px] font-semibold text-slate-300 transition-all hover:bg-white/5 hover:text-white",
                          active && "bg-[#d9786e] text-white shadow-sm hover:bg-[#d9786e]",
                        )}
                      >
                        <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => comingSoon(item.label)}
                      className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] font-semibold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <a
            href="/"
            className="flex h-9 items-center gap-3 rounded-xl px-3 text-[12px] font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-[15px] w-[15px]" strokeWidth={1.8} />
            Ver Loja Virtual
          </a>
          <button
            onClick={handleLogout}
            className="flex h-9 w-full items-center gap-3 rounded-xl px-3 text-[12px] font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-[15px] w-[15px]" strokeWidth={1.8} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
