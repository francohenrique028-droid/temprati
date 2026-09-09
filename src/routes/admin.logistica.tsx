import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Clock3, PackageCheck, RefreshCw, Search, Truck, XCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_cep: string | null;
  shipping_address: string | null;
  shipping_number: string | null;
  shipping_complement: string | null;
  shipping_neighborhood: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  payment_status: string;
  status: string;
  logistics_status: string;
  carrier: string | null;
  shipping_service: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  shipping_label_url: string | null;
  estimated_delivery_date: string | null;
  last_tracking_status: string | null;
  last_tracking_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  total: number;
  created_at: string;
};

type EventRow = { id: string; status: string; title: string; description: string | null; location: string | null; event_at: string; source: string };

const columns = [
  { key: "awaiting_processing", label: "Aguardando processamento", icon: Clock3 },
  { key: "preparing", label: "Em preparação", icon: ClipboardCheck },
  { key: "awaiting_post", label: "Aguardando postagem", icon: PackageCheck },
  { key: "in_transit", label: "Em trânsito", icon: Truck },
  { key: "delivered", label: "Entregues", icon: CheckCircle2 },
] as const;

function formatPrice(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0); }
function formatDate(value: string | null) { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d); }
function formatDateOnly(value: string | null) { if (!value) return "—"; const d = new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d); }
function statusFromOrder(order: Order) {
  if (order.status === "cancelled") return "cancelled";
  if (order.status === "delivered" || order.logistics_status === "delivered") return "delivered";
  if (order.status === "shipped" || ["in_transit", "out_for_delivery"].includes(order.logistics_status)) return "in_transit";
  if (order.logistics_status === "awaiting_post") return "awaiting_post";
  if (order.status === "processing" || order.logistics_status === "preparing") return "preparing";
  return "awaiting_processing";
}
function statusTitle(status: string) { return ({ pending: "Pendente", confirmed: "Confirmado", processing: "Em preparo", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado" } as Record<string, string>)[status] ?? status; }

export const Route = createFileRoute("/admin/logistica")({
  head: () => ({ meta: [{ title: "Logística · Admin #temprati" }, { name: "robots", content: "noindex" }] }),
  component: LogisticaPage,
});

function LogisticaPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ carrier: "", shipping_service: "", tracking_code: "", tracking_url: "", shipping_label_url: "", estimated_delivery_date: "" });

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    const { data, error } = await (supabase as any).from("orders")
      .select("id,order_number,customer_name,customer_email,customer_phone,shipping_cep,shipping_address,shipping_number,shipping_complement,shipping_neighborhood,shipping_city,shipping_state,payment_status,status,logistics_status,carrier,shipping_service,tracking_code,tracking_url,shipping_label_url,estimated_delivery_date,last_tracking_status,last_tracking_at,shipped_at,delivered_at,total,created_at")
      .order("created_at", { ascending: false }).range(0, 4999);
    if (error) toast.error(error.message); else setOrders((data ?? []) as Order[]);
    setLoading(false); setRefreshing(false);
  }

  useEffect(() => {
    void load();
    const channel = supabase.channel("admin-logistica-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "DELETE") setOrders((current) => current.filter((o) => o.id !== (payload.old as any).id));
        else {
          const next = payload.new as Order;
          setOrders((current) => { const exists = current.some((o) => o.id === next.id); return exists ? current.map((o) => o.id === next.id ? { ...o, ...next } : o) : [next, ...o]; });
        }
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!selected) { setEvents([]); return; }
    setForm({ carrier: selected.carrier ?? "", shipping_service: selected.shipping_service ?? "", tracking_code: selected.tracking_code ?? "", tracking_url: selected.tracking_url ?? "", shipping_label_url: selected.shipping_label_url ?? "", estimated_delivery_date: selected.estimated_delivery_date ?? "" });
    let active = true;
    void (async () => {
      const { data, error } = await (supabase as any).from("order_tracking_events").select("id,status,title,description,location,event_at,source").eq("order_id", selected.id).order("event_at", { ascending: false });
      if (active) { if (error) toast.error(error.message); else setEvents((data ?? []) as EventRow[]); }
    })();
    const channel = supabase.channel(`admin-order-events-${selected.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_tracking_events", filter: `order_id=eq.${selected.id}` }, (payload) => {
        if (payload.eventType === "DELETE") setEvents((current) => current.filter((e) => e.id !== (payload.old as any).id));
        else { const next = payload.new as EventRow; setEvents((current) => [next, ...current.filter((e) => e.id !== next.id)]); }
      }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [selected]);

  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return orders.filter((o) => !q || [o.order_number, o.customer_name, o.customer_email, o.tracking_code ?? ""].some((v) => v.toLowerCase().includes(q))); }, [orders, search]);
  const counts = useMemo(() => Object.fromEntries(columns.map((c) => [c.key, filtered.filter((o) => statusFromOrder(o) === c.key).length])), [filtered]);

  async function updateFulfillment(order: Order, next: string) {
    setSaving(true);
    const status = next === "preparing" ? "processing" : next === "in_transit" ? "shipped" : next === "delivered" ? "delivered" : next === "awaiting_post" ? "processing" : "confirmed";
    const patch: Record<string, unknown> = { logistics_status: next, status, updated_at: new Date().toISOString() };
    if (next === "in_transit") patch.shipped_at = order.shipped_at ?? new Date().toISOString();
    if (next === "delivered") patch.delivered_at = order.delivered_at ?? new Date().toISOString();
    const { data, error } = await (supabase as any).from("orders").update(patch).eq("id", order.id).select().single();
    if (error) toast.error(error.message); else { setSelected(data as Order); setOrders((current) => current.map((o) => o.id === order.id ? { ...o, ...(data as Order) } : o)); toast.success("Logística atualizada em tempo real."); }
    setSaving(false);
  }

  async function saveShipping() {
    if (!selected) return;
    setSaving(true);
    const { data, error } = await (supabase as any).from("orders").update({ ...form, logistics_status: selected.logistics_status || "awaiting_processing", updated_at: new Date().toISOString() }).eq("id", selected.id).select().single();
    if (error) toast.error(error.message); else { setSelected(data as Order); setOrders((current) => current.map((o) => o.id === selected.id ? { ...o, ...(data as Order) } : o)); toast.success("Dados de envio salvos."); }
    setSaving(false);
  }

  return (
    <AdminShell title="Logística" hideHeader>
      <div className="min-h-screen -m-4 md:-m-6 bg-[#f7f9fc] px-6 py-7 md:px-8 md:py-8 lg:px-9 lg:py-7">
        <div className="mx-auto max-w-[1550px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div><h1 className="text-[30px] font-extrabold leading-none tracking-[-0.035em] text-[#102a48] md:text-[36px]">LOGÍSTICA</h1><p className="mt-2 text-[12px] text-[#7890aa]">Acompanhe separação, postagem e entrega usando os dados reais dos pedidos.</p></div>
            <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d7dee7] bg-white px-3.5 text-[11px] font-semibold text-[#33475b] shadow-sm"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Atualizar dados</button>
          </div>

          <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {columns.map((c) => { const Icon = c.icon; return <div key={c.key} className="rounded-2xl border border-[#e5e9ee] bg-white p-4 shadow-[0_2px_7px_rgba(15,23,42,0.035)]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.07em] text-[#61768d]"><Icon className="h-4 w-4" />{c.label}</div><p className="mt-2 text-2xl font-extrabold text-[#10233a]">{counts[c.key] ?? 0}</p></div>; })}
          </section>

          <div className="mt-6 flex items-center gap-3"><div className="relative w-full max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por pedido, cliente ou rastreio..." className="h-10 w-full rounded-xl border border-[#dbe2ea] bg-white pl-10 pr-4 text-[12px] outline-none focus:border-[#d9786e]"/></div><span className="text-[11px] text-[#7890aa]">{filtered.length} pedido(s)</span></div>

          {loading ? <div className="mt-8 rounded-2xl border border-[#dbe2ea] bg-white p-10 text-center text-sm text-[#7890aa]">Carregando logística...</div> : filtered.length === 0 ? <div className="mt-8 rounded-2xl border border-[#dbe2ea] bg-white p-12 text-center"><Truck className="mx-auto h-8 w-8 text-[#b7c1cb]"/><p className="mt-3 text-sm font-semibold text-[#34495e]">Nenhum pedido aguardando logística</p><p className="mt-1 text-[11px] text-[#8a9aae]">Quando uma compra real for registrada, ela aparecerá aqui automaticamente.</p></div> : (
            <section className="mt-6 grid gap-4 xl:grid-cols-5">
              {columns.map((column) => <div key={column.key} className="min-h-[360px] rounded-2xl border border-[#e2e7ed] bg-white p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-[11px] font-extrabold text-[#33475b]">{column.label}</h2><span className="rounded-full bg-[#f3f6f9] px-2 py-1 text-[10px] font-bold text-[#6d8196]">{counts[column.key] ?? 0}</span></div><div className="space-y-3">{filtered.filter((o) => statusFromOrder(o) === column.key).map((order) => <button key={order.id} type="button" onClick={() => setSelected(order)} className="w-full rounded-xl border border-[#e9edf1] bg-[#fbfcfe] p-3 text-left transition hover:border-[#d7dee7] hover:shadow-sm"><div className="flex items-start justify-between gap-2"><span className="font-extrabold text-[#10233a]">{order.order_number}</span>{order.tracking_code && <Truck className="h-4 w-4 text-sky-500"/>}</div><p className="mt-1 truncate text-[11px] font-semibold text-[#506784]">{order.customer_name}</p><p className="mt-1 text-[10px] text-[#8a9aae]">{formatPrice(order.total)}</p>{order.last_tracking_status && <p className="mt-2 line-clamp-2 text-[10px] text-[#506784]">{order.last_tracking_status}</p>}</button>)}</div></div>)}
            </section>
          )}

          {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#edf0f3] bg-white px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a9aae]">Pedido</p><h2 className="mt-1 text-xl font-extrabold text-[#10233a]">{selected.order_number}</h2><p className="mt-1 text-[11px] text-[#61768d]">{selected.customer_name} · {statusTitle(selected.status)}</p></div><button type="button" onClick={() => setSelected(null)} className="text-2xl leading-none text-[#8a9aae]">×</button></div>
              <div className="space-y-6 p-6">
                <div><h3 className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#61768d]">Fluxo operacional</h3><div className="mt-3 grid gap-2 sm:grid-cols-5">{[...columns, { key: "cancelled", label: "Cancelado", icon: XCircle }].map((step) => <button key={step.key} type="button" disabled={saving || step.key === "cancelled"} onClick={() => void updateFulfillment(selected, step.key)} className={`rounded-xl border px-3 py-3 text-[10px] font-bold transition ${statusFromOrder(selected) === step.key ? "border-[#d9786e] bg-[#fff4f2] text-[#a54d45]" : "border-[#e5e9ee] bg-white text-[#61768d] hover:border-[#d6dde5]"}`}>{step.label}</button>)}</div></div>

                <div className="rounded-2xl border border-[#e5e9ee] bg-[#fbfcfe] p-4"><h3 className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#61768d]">Envio</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Transportadora"><input value={form.carrier} onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))} className={inputClass}/></Field><Field label="Serviço"><input value={form.shipping_service} onChange={(e) => setForm((f) => ({ ...f, shipping_service: e.target.value }))} placeholder="Ex.: PAC, SEDEX" className={inputClass}/></Field><Field label="Código de rastreio"><input value={form.tracking_code} onChange={(e) => setForm((f) => ({ ...f, tracking_code: e.target.value }))} className={inputClass}/></Field><Field label="Previsão de entrega"><input type="date" value={form.estimated_delivery_date} onChange={(e) => setForm((f) => ({ ...f, estimated_delivery_date: e.target.value }))} className={inputClass}/></Field><Field label="URL de rastreio"><input value={form.tracking_url} onChange={(e) => setForm((f) => ({ ...f, tracking_url: e.target.value }))} className={inputClass}/></Field><Field label="URL da etiqueta"><input value={form.shipping_label_url} onChange={(e) => setForm((f) => ({ ...f, shipping_label_url: e.target.value }))} className={inputClass}/></Field></div><button type="button" disabled={saving} onClick={() => void saveShipping()} className="mt-4 rounded-xl bg-[#102a48] px-5 py-2.5 text-[11px] font-extrabold text-white disabled:opacity-60">{saving ? "SALVANDO..." : "SALVAR DADOS DE ENVIO"}</button></div>

                <div><h3 className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#61768d]">Endereço de entrega</h3><div className="mt-3 rounded-2xl border border-[#e5e9ee] p-4 text-[11px] text-[#506784]"><p>{selected.shipping_address || "—"}, {selected.shipping_number || "s/n"}{selected.shipping_complement ? ` · ${selected.shipping_complement}` : ""}</p><p className="mt-1">{selected.shipping_neighborhood || "—"} · {selected.shipping_city || "—"} / {selected.shipping_state || "—"} · CEP {selected.shipping_cep || "—"}</p></div></div>

                <div><div className="flex items-center justify-between"><h3 className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#61768d]">Histórico do pedido</h3><span className="text-[10px] text-[#8a9aae]">Tempo real</span></div><div className="mt-3 space-y-3">{events.length ? events.map((event) => <div key={event.id} className="flex gap-3 rounded-xl border border-[#edf0f3] p-3"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d9786e]"/><div><p className="text-[11px] font-bold text-[#33475b]">{event.title}</p>{event.description && <p className="mt-1 text-[10px] text-[#7890aa]">{event.description}</p>}<p className="mt-1 text-[9px] text-[#9aa8b8]">{formatDate(event.event_at)}{event.location ? ` · ${event.location}` : ""} · {event.source}</p></div></div>) : <p className="rounded-xl border border-dashed border-[#dce3e9] p-5 text-center text-[11px] text-[#8a9aae]">Nenhum evento de rastreamento registrado.</p>}</div></div>
              </div>
            </div></div>}
        </div>
      </div>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-[#172c43]">{label}</span>{children}</label>; }
const inputClass = "h-10 w-full rounded-xl border border-[#dce2e8] bg-white px-3 text-[11px] text-[#25384c] outline-none focus:border-[#d9786e]";
