import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Heart, Loader2, MapPin, Package, Truck, User, XCircle } from "lucide-react";
import { formatPrice, products } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/conta")({
  head: () => ({ meta: [{ title: "Minha Conta — #temprati" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

const tabs = [
  { id: "orders", label: "Pedidos", icon: Package },
  { id: "favs", label: "Favoritos", icon: Heart },
  { id: "addr", label: "Endereços", icon: MapPin },
  { id: "profile", label: "Perfil", icon: User },
] as const;

type Order = { id: string; order_number: string; total: number; status: string; logistics_status: string; tracking_code: string | null; tracking_url: string | null; carrier: string | null; shipping_service: string | null; estimated_delivery_date: string | null; last_tracking_status: string | null; created_at: string };
type EventRow = { id: string; title: string; description: string | null; location: string | null; event_at: string; source: string };

function statusLabel(status: string) { return ({ pending: "Pendente", confirmed: "Confirmado", processing: "Em preparo", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado" } as Record<string, string>)[status] ?? status; }
function formatDate(value: string) { const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d); }
function formatDateOnly(value: string | null) { if (!value) return "—"; const d = new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d); }

function AccountPage() {
  const navigate = useNavigate();
  const { loading, user, isAdmin } = useAdminAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Record<string, EventRow[]>>({});
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { ids } = useFavorites();
  const favs = products.filter((p) => ids.has(p.id));

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!user || isAdmin) return;
    let active = true;
    const loadOrders = async () => {
      setLoadingOrders(true);
      const { data, error } = await (supabase as any).from("orders")
        .select("id,order_number,total,status,logistics_status,tracking_code,tracking_url,carrier,shipping_service,estimated_delivery_date,last_tracking_status,created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false });
      if (active) {
        if (error) console.error(error);
        else setOrders((data ?? []) as Order[]);
        setLoadingOrders(false);
      }
    };
    void loadOrders();
    const channel = supabase.channel(`customer-orders-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === "DELETE") setOrders((current) => current.filter((o) => o.id !== (payload.old as any).id));
        else { const next = payload.new as Order; setOrders((current) => current.some((o) => o.id === next.id) ? current.map((o) => o.id === next.id ? { ...o, ...next } : o) : [next, ...o]); }
      }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || isAdmin || !orders.length) return;
    let active = true;
    const ids = orders.map((o) => o.id);
    void (async () => {
      const { data, error } = await (supabase as any).from("order_tracking_events").select("id,order_id,title,description,location,event_at,source").in("order_id", ids).order("event_at", { ascending: false });
      if (!active) return;
      if (!error) setEvents((data ?? []).reduce((acc: Record<string, EventRow[]>, row: any) => { (acc[row.order_id] ??= []).push(row); return acc; }, {}));
    })();
    const channel = supabase.channel(`customer-tracking-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_tracking_events" }, (payload) => {
        const row = payload.new as any;
        if (payload.eventType === "DELETE") setEvents((current) => Object.fromEntries(Object.entries(current).map(([id, list]) => [id, list.filter((e) => e.id !== (payload.old as any).id)])));
        else if (ids.includes(row.order_id)) setEvents((current) => ({ ...current, [row.order_id]: [row as EventRow, ...(current[row.order_id] ?? []).filter((e) => e.id !== row.id)] }));
      }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [orders, user, isAdmin]);

  if (loading || !user || isAdmin) return <div className="container-x flex min-h-[60vh] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  const displayName = (user.user_metadata?.nome as string) || user.email?.split("@")[0] || "cliente";

  return (
    <div className="container-x py-14">
      <h1 className="text-3xl font-light tracking-tight md:text-4xl">Minha Conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">Olá, {displayName}. Bem-vindo(a).</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1">
          {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-left transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}><t.icon className="h-4 w-4" /> {t.label}</button>)}
          <button onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); }} className="mt-6 block w-full px-4 py-3 text-left text-xs text-muted-foreground hover:text-foreground">Sair</button>
        </aside>
        <section className="rounded-2xl border border-border bg-card p-8">
          {tab === "orders" && <OrdersPanel orders={orders} events={events} loading={loadingOrders} />}
          {tab === "favs" && <div><h2 className="mb-6 text-xl font-medium">Favoritos</h2>{favs.length ? <ProductGrid items={favs} /> : <p className="text-sm text-muted-foreground">Nenhum favorito ainda.</p>}</div>}
          {tab === "addr" && <div><h2 className="text-xl font-medium">Endereços</h2><p className="mt-4 text-sm text-muted-foreground">Seus endereços salvos serão exibidos aqui quando forem cadastrados.</p></div>}
          {tab === "profile" && <div className="max-w-md space-y-4"><h2 className="text-xl font-medium">Perfil</h2><Field label="Nome completo" value={(user.user_metadata?.nome as string) || ""} /><Field label="E-mail" value={user.email || ""} /><Field label="Telefone" value={(user.user_metadata?.telefone as string) || ""} /><p className="text-xs text-muted-foreground">Os dados exibidos vêm da sua conta autenticada.</p></div>}
        </section>
      </div>
    </div>
  );
}

function OrdersPanel({ orders, events, loading }: { orders: Order[]; events: Record<string, EventRow[]>; loading: boolean }) {
  if (loading) return <div><h2 className="text-xl font-medium">Pedidos</h2><div className="mt-8 flex items-center justify-center py-10 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Carregando seus pedidos...</div></div>;
  if (!orders.length) return <div><h2 className="text-xl font-medium">Pedidos</h2><div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center"><Package className="mx-auto h-8 w-8 text-muted-foreground"/><p className="mt-3 text-sm font-medium">Nenhum pedido</p><p className="mt-1 text-xs text-muted-foreground">Seus pedidos realizados na loja aparecerão aqui.</p></div></div>;
  return <div><h2 className="text-xl font-medium">Pedidos</h2><div className="mt-6 space-y-6">{orders.map((order) => { const history = events[order.id] ?? []; return <article key={order.id} className="rounded-2xl border border-border p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{order.order_number}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(order.created_at)} · {statusLabel(order.status)}</p>{order.carrier && <p className="mt-1 text-xs text-muted-foreground">{order.carrier}{order.shipping_service ? ` · ${order.shipping_service}` : ""}</p>}</div><p className="text-sm font-semibold">{formatPrice(order.total)}</p></div><div className="mt-5 grid gap-2 sm:grid-cols-5">{["confirmed","processing","shipped","delivered"].map((step, index) => <div key={step} className="flex items-center gap-2 text-xs"><span className={`h-6 w-6 rounded-full border flex items-center justify-center ${["confirmed","processing","shipped","delivered"].indexOf(order.status) >= index && order.status !== "cancelled" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-border text-muted-foreground"}`}>{["confirmed","processing","shipped","delivered"].indexOf(order.status) >= index && order.status !== "cancelled" ? <CheckCircle2 className="h-3.5 w-3.5"/> : <span>{index + 1}</span>}</span><span>{statusLabel(step)}</span></div>)}</div>{order.tracking_code && <div className="mt-5 rounded-xl bg-secondary/50 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold">Rastreamento: {order.tracking_code}</p><p className="mt-1 text-xs text-muted-foreground">Última atualização: {order.last_tracking_status || "aguardando atualização da transportadora"}</p><p className="mt-1 text-xs text-muted-foreground">Previsão: {formatDateOnly(order.estimated_delivery_date)}</p></div>{order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-background"><Truck className="h-3.5 w-3.5"/>Acompanhar</a>}</div></div>} {history.length > 0 && <div className="mt-5 border-t border-border pt-4"><p className="text-xs font-semibold">Histórico</p><div className="mt-3 space-y-3">{history.map((event) => <div key={event.id} className="flex gap-3 text-xs"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"/><div><p className="font-medium">{event.title}</p><p className="text-muted-foreground">{event.description || "Atualização logística"} · {formatDate(event.event_at)}</p>{event.location && <p className="text-muted-foreground">{event.location}</p>}</div></div>)}</div></div>}</article>; })}</div></div>;
}

function Field({ label, value }: { label: string; value?: string }) { return <label className="block"><span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</span><input defaultValue={value} readOnly className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none" /></label>; }
