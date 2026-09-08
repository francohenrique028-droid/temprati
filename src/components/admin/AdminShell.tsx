import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import { Menu } from "lucide-react";

export function AdminShell({
  children,
  title,
  hideHeader = false,
}: {
  children: ReactNode;
  title?: string;
  hideHeader?: boolean;
}) {
  const { loading, user, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/admin/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-sm text-neutral-500">Carregando…</div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-neutral-500">Sua conta não tem permissão de administrador.</p>
          <button
            onClick={async () => {
              const { supabase } = await import("@/integrations/supabase/client");
              await supabase.auth.signOut();
              window.location.href = "/admin/login";
            }}
            className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      <AdminSidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        {!hideHeader && (
          <header className="h-14 shrink-0 flex items-center gap-4 border-b border-neutral-200 bg-white px-6">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden">
              <Menu className="h-5 w-5 text-neutral-600" />
            </button>
            <h1 className="text-sm font-medium flex-1">{title}</h1>
            <span className="text-xs text-neutral-500 hidden sm:inline">{user.email}</span>
          </header>
        )}
        {hideHeader && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="fixed left-4 top-4 z-30 rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
