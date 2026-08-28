import { createFileRoute } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/products";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ateliê" }] }),
  component: CheckoutPage,
});

const steps = ["Identificação", "Entrega", "Pagamento", "Resumo"] as const;

function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [step, setStep] = useState(0);

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
              <span className="grid h-5 w-5 place-items-center rounded-full bg-background/20">
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </button>
            {i < steps.length - 1 && <span className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Identificação</h2>
              <Field label="E-mail" placeholder="voce@email.com" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome" />
                <Field label="Sobrenome" />
              </div>
              <Field label="CPF" placeholder="000.000.000-00" />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Endereço de entrega</h2>
              <Field label="CEP" />
              <Field label="Endereço" />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Número" />
                <Field label="Complemento" />
                <Field label="Bairro" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cidade" />
                <Field label="Estado" />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Pagamento</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {["Cartão", "Pix", "Boleto"].map((m) => (
                  <button
                    key={m}
                    className="rounded-2xl border border-border bg-background p-4 text-sm hover:border-primary transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Field label="Número do cartão" />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Validade" />
                <Field label="CVV" />
                <Field label="Parcelas" />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Confirme seu pedido</h2>
              <p className="text-sm text-muted-foreground">Revise os dados antes de finalizar.</p>
              <div className="rounded-xl bg-secondary p-4 text-sm">
                <p className="font-medium">{items.length} peça(s) na sacola</p>
                <p className="mt-1 text-muted-foreground">Total: {formatPrice(subtotal)}</p>
              </div>
            </div>
          )}
          <div className="mt-8 flex justify-between">
            <button
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="rounded-2xl border border-border px-5 py-3 text-xs uppercase tracking-[0.15em] disabled:opacity-40"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              className="rounded-2xl bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground hover:bg-[#333] transition-colors"
            >
              {step === steps.length - 1 ? "Finalizar" : "Continuar"}
            </button>
          </div>
        </motion.div>

        <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-32 lg:self-start">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em]">Resumo</h3>
          <div className="mt-5 space-y-4">
            {items.length === 0 && <p className="text-sm text-muted-foreground">Sacola vazia.</p>}
            {items.map((i) => (
              <div key={i.product.id + i.size} className="flex gap-3">
                <img
                  src={i.product.images[0]}
                  alt=""
                  className="h-16 w-14 rounded-lg object-cover"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Tam {i.size} · Qtd {i.qty}
                  </p>
                </div>
                <p className="text-sm">{formatPrice(i.product.price * i.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <input
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
      />
    </label>
  );
}
