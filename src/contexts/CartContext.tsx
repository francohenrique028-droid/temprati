import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Product } from "@/lib/products";

export type CartItem = { product: Product; qty: number; size: string; color: string };

type Ctx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, opts?: { size?: string; color?: string; qty?: number }) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  subtotal: number;
  count: number;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add: Ctx["add"] = useCallback((p, opts) => {
    setItems((prev) => {
      const size = opts?.size ?? p.sizes[0];
      const color = opts?.color ?? p.colors[0];
      const qty = opts?.qty ?? 1;
      const existing = prev.find(
        (i) => i.product.id === p.id && i.size === size && i.color === color,
      );
      if (existing) return prev.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { product: p, qty, size, color }];
    });
    setOpen(true);
  }, []);
  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id)),
    [],
  );
  const update = useCallback(
    (id: string, qty: number) =>
      setItems((prev) =>
        prev.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
      ),
    [],
  );
  const clear = useCallback(() => setItems([]), []);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.product.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, open, setOpen, add, remove, update, subtotal, count, clear }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => {
  const v = useContext(CartCtx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
};
