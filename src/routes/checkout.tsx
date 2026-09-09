import { createFileRoute } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/products";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Finalizar compra — #temprati" }] }),
  component: CheckoutPage,
});

const steps = ["Identificação", "Entrega", "Pagamento", "Resumo"] as const;

type CheckoutForm = {
  email: string;
  name: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

const initialForm: CheckoutForm = {
  email: "",
  name: "",
  phone: "",
  cpf: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [finishing, setFinishing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const setField = (field: keyof CheckoutForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  function nextStep() {
    if (step === 0 && (!form.email.trim() || !form.name.trim())) {
      toast.error("Informe seu nome e e-mail para continuar.");
      return;
    }
    if (step === 1 && (!form.cep.trim() || !form.address.trim() || !form.number.trim() || !form.city.trim() || !form.state.trim())) {
      toast.error("Preencha o endereço de entrega.");
      return;
    }
    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  async function finalizeOrder() {
    if (!items.length) {
      toast.error("Sua sacola está vazia.");
      return;
    }
    if (!form.email.trim() || !form.name.trim()) {
      setStep(0);
      toast.error("Informe seu nome e e-mail.");
      return;
    }
    setFinishing(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: numberData, error: numberError } = await supabase.rpc("generate_order_number");
      if (numberError) throw numberError;

      const generatedOrderNumber = String(numberData);
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: generatedOrderNumber,
          user_id: userData.user?.id ?? null,
          customer_name: form.name.trim(),
          customer_email: form.email.trim().toLowerCase(),
          customer_phone: form.phone.trim() || null,
          cpf: form.cpf.trim() || null,
          shipping_cep: form.cep.trim() || null,
          shipping_address: form.address.trim() || null,
          shipping_number: form.number.trim() || null,
          shipping_complement: form.complement.trim() || null,
          shipping_neighborhood: form.neighborhood.trim() || null,
          shipping_city: form.city.trim() || null,
          shipping_state: form.state.trim() || null,
          payment_method: paymentMethod,
          payment_status: "pending",
          status: "pending",
          subtotal,
          shipping_cost: 0,
          discount: 0,
          total: subtotal,
        })
        .select("id,order_number")
        .single();
      if (orderError || !order) throw orderError ?? new Error("Não foi possível criar o pedido.");

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        size: item.size || null,
        color: item.color || null,
        quantity: item.qty,
        unit_price: item.product.price,
        total_price: item.product.price * item.qty,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderNumber(order.order_number);
      clear();
      toast.success("Pedido realizado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível finalizar o pedido.");
    } finally {
      setFinishing(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-7 w-7" /></div>
          <h1 className="mt-6 text-3xl font-semibold">Pedido recebido</h1>
          <p className="mt-3 text-muted-foreground">Seu pedido foi registrado com sucesso.</p>
          <div className="mt-6 rounded-2xl bg-secondary p-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Número do pedido</p><p className="mt-2 text-xl font-bold">{orderNumber}</p></div>
          <a href="/" className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground">Voltar para a loja</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-14">
      <h1 className="text-3xl font-light tracking-tight md:text-4xl">Finalizar compra</h1>

      <div className="mt-10 flex items-center gap-3 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-background/20">{i < step ? <Check className="h-3 w-3" /> : i + 1}</span>
              {s}
            </button>
            {i < steps.length - 1 && <span className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Identificação</h2>
              <Field label="E-mail" placeholder="voce@email.com" value={form.email} onChange={(value) => setField("email", value)} />
              <div className="grid gap-4 md:grid-cols-2"><Field label="Nome" value={form.name} onChange={(value) => setField("name", value)} /><Field label="Telefone" value={form.phone} onChange={(value) => setField("phone", value)} /></div>
              <Field label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(value) => setField("cpf", value)} />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Endereço de entrega</h2>
              <Field label="CEP" value={form.cep} onChange={(value) => setField("cep", value)} />
              <Field label="Endereço" value={form.address} onChange={(value) => setField("address", value)} />
              <div className="grid gap-4 md:grid-cols-3"><Field label="Número" value={form.number} onChange={(value) => setField("number", value)} /><Field label="Complemento" value={form.complement} onChange={(value) => setField("complement", value)} /><Field label="Bairro" value={form.neighborhood} onChange={(value) => setField("neighborhood", value)} /></div>
              <div className="grid gap-4 md:grid-cols-2"><Field label="Cidade" value={form.city} onChange={(value) => setField("city", value)} /><Field label="Estado" value={form.state} onChange={(value) => setField("state", value)} /></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Pagamento</h2>
              <div className="grid gap-3 md:grid-cols-3">{["Cartão", "Pix", "Boleto"].map((method) => <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`rounded-2xl border p-4 text-sm transition-colors ${paymentMethod === method ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary"}`}>{method}</button>)}</div>
              <p className="text-xs text-muted-foreground">A forma de pagamento escolhida será registrada no pedido. Os dados completos do cartão não são armazenados nesta etapa.</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4"><h2 className="text-xl font-medium">Confirme seu pedido</h2><p className="text-sm text-muted-foreground">Revise os dados antes de finalizar.</p><div className="rounded-xl bg-secondary p-4 text-sm"><p className="font-medium">{items.length} item(s) na sacola</p><p className="mt-1 text-muted-foreground">Cliente: {form.name}</p><p className="mt-1 text-muted-foreground">Pagamento: {paymentMethod}</p><p className="mt-1 text-muted-foreground">Total: {formatPrice(subtotal)}</p></div></div>
          )}
          <div className="mt-8 flex justify-between"><button type="button" disabled={step === 0 || finishing} onClick={() => setStep((s) => s - 1)} className="rounded-2xl border border-border px-5 py-3 text-xs uppercase tracking-[0.15em] disabled:opacity-40">Voltar</button><button type="button" disabled={finishing} onClick={step === steps.length - 1 ? () => void finalizeOrder() : nextStep} className="rounded-2xl bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground hover:bg-[#333] transition-colors disabled:opacity-50">{finishing ? "Registrando..." : step === steps.length - 1 ? "Finalizar" : "Continuar"}</button></div>
        </motion.div>

        <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-32 lg:self-start"><h3 className="text-xs font-semibold uppercase tracking-[0.2em]">Resumo</h3><div className="mt-5 space-y-4">{items.length === 0 && <p className="text-sm text-muted-foreground">Sacola vazia.</p>}{items.map((item) => <div key={item.product.id + item.size + item.color} className="flex gap-3"><img src={item.product.images[0]} alt="" className="h-16 w-14 rounded-lg object-cover" /><div className="flex-1 text-sm"><p className="font-medium">{item.product.name}</p><p className="text-xs text-muted-foreground">Tam {item.size} · Qtd {item.qty}</p></div><p className="text-sm">{formatPrice(item.product.price * item.qty)}</p></div>)}</div><div className="mt-6 space-y-2 border-t border-border pt-5 text-sm"><div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between text-muted-foreground"><span>Frete</span><span>Grátis</span></div><div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span>{formatPrice(subtotal)}</span></div></div></aside>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value?: string; onChange?: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</span><input value={value ?? ""} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary transition-colors" /></label>;
}
