import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
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
      {/* Image */}
      <Link
        to="/produto/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden bg-card"
      >
        <div className="relative aspect-[4/5] w-full">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0"
          />
          <img
            src={product.images[1]}
            alt=""
            aria-hidden
            loading="lazy"
            width={800}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        </div>

        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
              product.badge === "Promoção"
                ? "bg-primary text-primary-foreground"
                : product.badge === "Novo"
                ? "bg-background text-foreground border border-border"
                : "bg-foreground/90 text-primary-foreground"
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
            toast(isFav ? "Removido dos favoritos" : "Adicionado aos favoritos");
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur-sm opacity-0 shadow-soft transition-all duration-300 group-hover:opacity-100 hover:bg-background"
          aria-label="Favoritar"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
        </button>
      </Link>

      {/* Info */}
      <div className="pt-5 text-center">
        <Link
          to="/produto/$slug"
          params={{ slug: product.slug }}
          className="block text-[13px] font-semibold tracking-wide text-foreground transition-colors hover:text-muted-foreground"
        >
          {product.name}
        </Link>

        <div className="mx-auto my-3 h-px w-full bg-border" />

        <div className="flex items-baseline justify-center gap-2">
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <span className="text-[15px] font-semibold">{formatPrice(product.price)}</span>
        </div>
        <p className="mt-1 text-[11.5px] text-muted-foreground">{installment(product.price)}</p>

        <button
          onClick={() => add(product)}
          className="mt-4 block w-full rounded-md bg-primary py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-[#333]"
        >
          Comprar
        </button>
      </div>
    </motion.div>
  );
}
