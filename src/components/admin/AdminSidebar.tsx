import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Users, Ticket,
  Image as ImageIcon, FileText, ListTree, Layers, Boxes, Settings,
  UserCog, Palette, LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/cupons", label: "Cupons", icon: Ticket },
  { to: "/admin/banner", label: "Banner", icon: ImageIcon },
  { to: "/admin/colecoes", label: "Coleções", icon: Layers },
  { to: "/admin/menu", label: "Menu", icon: ListTree },
  { to: "/admin/paginas", label: "Páginas", icon: FileText },
  { to: "/admin/estoque", label: "Estoque", icon: Boxes },
  { to: "/admin/tema", label: "Editor de Tema", icon: Palette },
  { to: "/admin/aparencia", label: "Aparência", icon: Palette },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { to: "/admin/usuarios", label: "Usuários", icon: UserCog },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="h-14 flex items-center px-5 border-b border-neutral-200">
        <span className="text-sm font-semibold tracking-tight">#temprati · admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-5 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors",
                active && "bg-neutral-100 text-neutral-950 font-medium",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-3 text-sm text-neutral-700 hover:bg-neutral-50 border-t border-neutral-200"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </aside>
  );
}
