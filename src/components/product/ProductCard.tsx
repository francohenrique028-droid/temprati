import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { formatPrice, installment } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.2, 0.6, 0.2, 1] }}
      className="group relative flex h-full w-full"
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-300 hover:shadow-md">
        {/* Image Area */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          <Link to="/produto/$slug" params={{ slug: product.slug }} className="block h-full w-full">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
            />
            {product.images[1] && (
              <img
                src={product.images[1]}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </Link>
        </div>

        {/* Info Area */}
        <div className="flex flex-1 flex-col p-4">
          <Link
            to="/produto/$slug"
            params={{ slug: product.slug }}
            className="mb-1 line-clamp-2 min-h-[40px] text-sm font-semibold text-black transition-colors hover:text-[#FF0080]"
          >
            {product.name}
          </Link>

          <p className="mb-4 text-[11px] text-muted-foreground line-clamp-1">
            {installment(product.price)}
          </p>

          <div className="mt-auto space-y-1">
            {product.oldPrice && (
              <span className="text-[13px] text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-lg font-bold text-black">{formatPrice(product.price)}</span>
              <span className="text-[11px] text-muted-foreground">
                ou 6x {formatPrice(product.price / 6)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
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
              className="h-11 flex-1 truncate rounded-xl bg-[#FF0080] px-2 text-[10px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 sm:px-4"
            >
              Comprar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                add(product);
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#FF0080] text-[#FF0080] transition-colors hover:bg-[#FF0080]/5"
            >
              <Plus className="h-3 w-3 mr-0.5" />
              <ShoppingBag className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
