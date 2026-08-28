import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Heart, MapPin, User, Loader2 } from "lucide-react";
import { formatPrice, products } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [{ title: "Minha Conta — #temprati" }, { name: "robots", content: "noindex" }],
  }),
  component: AccountPage,
});

const tabs = [
  { id: "orders", label: "Pedidos", icon: Package },
  { id: "favs", label: "Favoritos", icon: Heart },
  { id: "addr", label: "Endereços", icon: MapPin },
  { id: "profile", label: "Perfil", icon: User },
] as const;

function AccountPage() {
  const navigate = useNavigate();
  const { loading, user, isAdmin } = useAdminAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("orders");
  const { ids } = useFavorites();
  const favs = products.filter((p) => ids.has(p.id));

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || isAdmin) {
    return (
      <div className="container-x flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName =
    (user.user_metadata?.nome as string) || user.email?.split("@")[0] || "cliente";

  return (
    <div className="container-x py-14">
      <h1 className="text-3xl font-light tracking-tight md:text-4xl">Minha Conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">Olá, {displayName}. Bem-vindo(a).</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-left transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/", replace: true });
            }}
            className="mt-6 block w-full px-4 py-3 text-left text-xs text-muted-foreground hover:text-foreground"
          >
            Sair
          </button>
        </aside>
        <section className="rounded-2xl border border-border bg-card p-8">
          {tab === "orders" && (
            <div>
              <h2 className="text-xl font-medium">Pedidos</h2>
              <div className="mt-6 space-y-4">
                {[
                  { id: "#00214", date: "12 Mai 2026", total: 2180, status: "Entregue" },
                  { id: "#00189", date: "27 Abr 2026", total: 790, status: "Enviado" },
                ].map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-xl border border-border p-5"
                  >
                    <div>
                      <p className="font-medium">{o.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.date} · {o.status}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(o.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "favs" && (
            <div>
              <h2 className="mb-6 text-xl font-medium">Favoritos</h2>
              {favs.length ? (
                <ProductGrid items={favs} />
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum favorito ainda.</p>
              )}
            </div>
          )}
          {tab === "addr" && (
            <div>
              <h2 className="text-xl font-medium">Endereços</h2>
              <div className="mt-6 rounded-xl border border-border p-5 text-sm">
                <p className="font-medium">Casa</p>
                <p className="mt-1 text-muted-foreground">
                  Rua das Flores, 123 · São Paulo, SP · 01000-000
                </p>
              </div>
              <button className="mt-4 rounded-2xl border border-border px-5 py-3 text-xs uppercase tracking-[0.15em] hover:bg-secondary">
                + Adicionar endereço
              </button>
            </div>
          )}
          {tab === "profile" && (
            <div className="max-w-md space-y-4">
              <h2 className="text-xl font-medium">Perfil</h2>
              <Field label="Nome completo" value="Cliente Ateliê" />
              <Field label="E-mail" value="cliente@ateliê.com" />
              <Field label="Telefone" value="(11) 99999-9999" />
              <button className="rounded-2xl bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground hover:bg-[#333]">
                Salvar
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <input
        defaultValue={value}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
