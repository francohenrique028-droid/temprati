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
        className="relative block overflow-hidden rounded-xl bg-secondary shadow-soft"
      >
        <div className="relative aspect-square w-full">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={product.images[1]}
            alt=""
            aria-hidden
            loading="lazy"
            width={800}
            height={800}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        </div>

        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-medium lowercase tracking-wide ${
              product.badge === "Promoção"
                ? "bg-primary text-primary-foreground"
                : product.badge === "Novo"
                ? "bg-background text-foreground border border-border"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
            toast(isFav ? "removido dos favoritos" : "adicionado aos favoritos");
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/95 backdrop-blur-sm shadow-soft transition-all duration-300 hover:bg-background"
          aria-label="Favoritar"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>

        {/* Buy button on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            add(product);
          }}
          className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-primary py-3 text-[11px] font-medium lowercase tracking-wide text-primary-foreground opacity-0 shadow-elevated transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[color-mix(in_oklab,var(--primary)_88%,black)]"
        >
          comprar
        </button>
      </Link>

      {/* Info */}
      <div className="pt-4">
        <Link
          to="/produto/$slug"
          params={{ slug: product.slug }}
          className="block text-sm font-medium lowercase text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <span className="text-base font-semibold text-primary">{formatPrice(product.price)}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{installment(product.price)}</p>
      </div>
    </motion.div>
  );
}
