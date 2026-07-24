import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { formatPrice, installment } from "@/lib/products";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { has, toggle } = useFavorites();
  const { add } = useCart();
  const isFav = has(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24), ease: [0.2, 0.6, 0.2, 1] }}
      className="group flex flex-col"
    >
      <Link to="/produto/$slug" params={{ slug: product.slug }} className="relative block overflow-hidden rounded-2xl bg-card">
        <div className="relative aspect-[4/5] w-full">
          <img src={product.images[0]} alt={product.name} loading="lazy" width={800} height={1000} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0" />
          <img src={product.images[1]} alt="" aria-hidden loading="lazy" width={800} height={1000} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        </div>
        {product.badge && (
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
            product.badge === "Promoção" ? "bg-primary text-primary-foreground" :
            product.badge === "Novo" ? "bg-background text-foreground border border-border" :
            "bg-foreground/90 text-primary-foreground"
          }`}>{product.badge}</span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); toast(isFav ? "Removido dos favoritos" : "Adicionado aos favoritos"); }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur-sm opacity-0 shadow-soft transition-all duration-300 group-hover:opacity-100 hover:bg-background"
          aria-label="Favoritar"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); add(product); }}
          className="absolute inset-x-4 bottom-4 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#333]"
        >
          <ShoppingBag className="h-4 w-4" /> Comprar
        </button>
      </Link>
      <div className="mt-4 space-y-1 px-1">
        <Link to="/produto/$slug" params={{ slug: product.slug }} className="text-sm font-medium hover:text-muted-foreground transition-colors">{product.name}</Link>
        <div className="flex items-baseline gap-2">
          {product.oldPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>}
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{installment(product.price)}</p>
      </div>
    </motion.div>
  );
}
