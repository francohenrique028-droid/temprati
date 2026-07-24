import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { formatPrice, installment } from "@/lib/products";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { has, toggle } = useFavorites();
  const { add } = useCart();
  const navigate = useNavigate();
  const isFav = has(product.id);

  const discount = product.oldPrice
    ? `${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.2, 0.6, 0.2, 1] }}
      className="group relative w-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-300 hover:shadow-md">
        {/* Image */}
        <Link
          to="/produto/$slug"
          params={{ slug: product.slug }}
          className="relative block aspect-square overflow-hidden bg-muted"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={product.images[1]}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {(discount || product.badge) && (
            <div
              className={cn(
                "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold lowercase tracking-wide",
                discount
                  ? "bg-green-200 text-green-900"
                  : product.badge === "Novo"
                  ? "bg-background text-foreground border border-border"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {discount ?? product.badge}
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
              toast(isFav ? "removido dos favoritos" : "adicionado aos favoritos");
            }}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/95 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-background"
            aria-label="Favoritar"
          >
            <Heart className={cn("h-4 w-4", isFav ? "fill-primary text-primary" : "text-foreground")} />
          </button>
        </Link>

        {/* Details */}
        <div className="flex flex-1 flex-col space-y-3 p-4">
          <Link
            to="/produto/$slug"
            params={{ slug: product.slug }}
            className="line-clamp-2 h-10 text-sm font-medium lowercase text-foreground transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
          <p className="text-[11px] lowercase text-muted-foreground">{installment(product.price)}</p>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                if (product.sizes.length > 1) {
                  navigate({ to: "/produto/$slug", params: { slug: product.slug } });
                } else {
                  add(product);
                }
              }}
              className="rounded-lg border border-primary bg-background px-5 py-2 text-xs font-bold lowercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              add
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
