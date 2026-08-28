import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, LogOut, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
] as const;

export function AdminSidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (v: boolean) => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <>
      <div className={cn("fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity", mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setMobileOpen?.(false)} />
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 md:w-60 shrink-0 flex-col border-r border-neutral-200 bg-white transition-transform md:translate-x-0 md:static flex", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-200">
          <span className="text-sm font-semibold tracking-tight">#temprati · admin</span>
          <button onClick={() => setMobileOpen?.(false)} className="md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {items.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setMobileOpen?.(false)}
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
    </>
  );
}
