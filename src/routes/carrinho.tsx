import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/products";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Sacola — Ateliê" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, update, remove, subtotal } = useCart();
  return (
    <div className="container-x py-14">
      <h1 className="text-4xl font-light tracking-tight md:text-5xl">Sua sacola</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Sacola vazia.</p>
          <Link to="/" className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-[#333]">Continuar comprando</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="divide-y divide-border">
            {items.map(i => (
              <div key={i.product.id + i.size} className="flex gap-6 py-6">
                <img src={i.product.images[0]} alt={i.product.name} className="h-40 w-32 rounded-2xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{i.product.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Tam {i.size}</p>
                    </div>
                    <button onClick={() => remove(i.product.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button onClick={() => update(i.product.id, i.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                      <span className="min-w-8 text-center text-sm">{i.qty}</span>
                      <button onClick={() => update(i.product.id, i.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                    </div>
                    <p className="font-semibold">{formatPrice(i.product.price * i.qty)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-32 lg:self-start">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em]">Resumo</h3>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Frete</span><span>Calculado no checkout</span></div>
              <div className="flex justify-between pt-3 text-base font-semibold"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            </div>
            <Link to="/checkout" className="mt-6 block rounded-2xl bg-primary py-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground hover:bg-[#333]">Finalizar Compra</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
