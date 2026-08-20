import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { findBySlug } from "@/lib/products";

export type StoryCard = {
  id: string | number;
  image: string;
  thumb?: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  href?: string;
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  cards: StoryCard[];
}

export function StoriesCarousel({ cards }: Props) {
  const [active, setActive] = useState(() => Math.floor(cards.length / 2));
  const [isMobile, setIsMobile] = useState(false);
  const { add } = useCart();
  const total = cards.length;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const go = (dir: number) => setActive((i) => (i + dir + total) % total);

  const onDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  return (
    <div className="relative w-full py-8 md:py-14">
      <div className="relative mx-auto h-[480px] w-full max-w-5xl md:h-[620px]">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {cards.map((card, i) => {
            const offset = i - active;
            const abs = Math.abs(offset);
            if (abs > 2) return null;
            const isActive = offset === 0;
            const translateX = offset * (isMobile ? 38 : 32); // Lower percentage for side-by-side overlap
            const scale = isActive ? 1 : 0.82;
            const opacity = abs > 1 ? 0 : 1;
            const zIndex = isActive ? 10 : 10 - abs - 1;

            return (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => (isActive ? undefined : setActive(i))}
                className="absolute top-1/2 left-1/2 aspect-[9/16] h-full max-h-[540px] overflow-hidden rounded-3xl bg-white"
                animate={{
                  x: `calc(-50% + ${translateX}%)`,
                  y: "-50%",
                  scale,
                  opacity,
                  zIndex,
                  filter: isActive ? "blur(0px)" : "blur(4px)",
                  boxShadow: isActive
                    ? "0 24px 60px rgba(0,0,0,0.22)"
                    : "0 10px 28px rgba(0,0,0,0.10)",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                style={{ pointerEvents: abs > 1 ? "none" : "auto" }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />


                {/* bottom info card */}
                <a
                  href={card.href ?? "#"}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-white/95 p-2.5 shadow-sm backdrop-blur transition hover:bg-white"
                >
                  <img
                    src={card.thumb ?? card.image}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <h4 className="line-clamp-2 text-[13px] font-medium leading-tight text-neutral-800">
                      {card.name}
                    </h4>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-black">
                        {brl(card.price)}
                      </span>
                      {card.oldPrice && (
                        <span className="text-[11px] text-neutral-400 line-through">
                          {brl(card.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (card.href) window.location.href = card.href;
                      }}
                      className="whitespace-nowrap rounded-lg bg-[#FF0080] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#FF0080]/90"
                    >
                      Comprar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Find the product by ID or Slug to add to cart properly
                        const productSlug = card.href?.split("/").pop();
                        if (productSlug) {
                          const product = findBySlug(productSlug);
                          if (product) {
                            add(product);
                          }
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#FF0080] text-[#FF0080] shadow-sm transition hover:bg-[#FF0080]/5 sm:h-8 sm:w-8"
                    >
                      <Plus className="h-2.5 w-2.5 mr-0.5" />
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </a>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Navigation buttons moved below if desired, but image shows arrows on sides or maybe no arrows. Keeping arrows but positioning them better for the "Instagram" look */}
        <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-4 md:px-12">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="anterior"
            className="rounded-full bg-white/30 p-2 text-white shadow-sm backdrop-blur-md transition hover:bg-white/50"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="próximo"
            className="rounded-full bg-white/30 p-2 text-white shadow-sm backdrop-blur-md transition hover:bg-white/50"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </div>

    </div>
  );
}
