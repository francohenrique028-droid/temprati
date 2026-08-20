import { X, Minus, Plus, Trash2, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/products";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

export function CartDrawer() {
  const { open, setOpen, items, update, remove, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/30" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.35, ease: [0.2, 0.6, 0.2, 1] }} className="absolute inset-y-0 right-0 flex w-[90%] max-w-md flex-col bg-background shadow-2xl sm:w-full">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Sacola ({items.length})</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar"><X className="h-5 w-5" /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-muted-foreground">Sua sacola está vazia.</p>
                <button onClick={() => setOpen(false)} className="rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-[#333] transition-colors">Continuar comprando</button>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-border overflow-y-auto px-6">
                  {items.map(i => (
                    <div key={i.product.id + i.size + i.color} className="flex gap-4 py-5">
                      <img src={i.product.images[0]} alt={i.product.name} className="h-28 w-24 rounded-xl object-cover" />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{i.product.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Tam {i.size}</p>
                          </div>
                          <button onClick={() => remove(i.product.id)} className="text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border">
                            <button onClick={() => update(i.product.id, i.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                            <span className="min-w-6 text-center text-sm">{i.qty}</span>
                            <button onClick={() => update(i.product.id, i.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                          </div>
                          <p className="text-sm font-medium">{formatPrice(i.product.price * i.qty)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border p-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        value={coupon} 
                        onChange={e => setCoupon(e.target.value)} 
                        placeholder="Cupom de desconto" 
                        className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary" 
                      />
                      <button className="rounded-2xl border border-border px-4 text-sm hover:bg-secondary font-medium transition-colors">Aplicar</button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Truck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          placeholder="Calcular frete (CEP)" 
                          className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary" 
                        />
                      </div>
                      <button className="rounded-2xl border border-border px-4 text-sm hover:bg-secondary font-medium transition-colors">Calcular</button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-foreground uppercase tracking-wider">descontos</span>
                      <span className="text-[#FF0080]">-R$ 0,00</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-foreground uppercase tracking-wider">total</span>
                      <span className="text-[#FF0080]">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button 
                      onClick={() => setOpen(false)} 
                      className="text-xs font-bold uppercase underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
                    >
                      continuar comprando
                    </button>
                    <Link 
                      to="/checkout" 
                      onClick={() => setOpen(false)} 
                      className="flex-1 rounded-2xl bg-[#FF0080] py-4 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-[#FF0080]/90 transition-colors shadow-lg shadow-[#FF0080]/20"
                    >
                      finalizar compra
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
