import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ShoppingBag } from "lucide-react";
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

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

  const go = (dir: number) => {
    if (!total) return;
    setActive((i) => (i + dir + total) % total);
  };

  const onDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  return (
    <div className="relative w-full overflow-hidden py-8 md:py-14">
      <div className="mb-8 text-center px-4 flex flex-col items-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          <span className="h-1.5 w-1.5 rounded-full bg-[#84cc16]"></span>
          VITRINE
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-neutral-900">
          Veja o iShorts <span className="text-[#84cc16]">em ação</span>
        </h2>
        <p className="mt-3 text-sm md:text-base text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Uma experiência de compra imersiva em qualquer dispositivo
        </p>
      </div>
      <div className="relative mx-auto h-[480px] w-full md:h-[600px]">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {cards.map((card, i) => {
            let offset = i - active;
            const half = Math.floor(total / 2);
            if (offset > half) offset -= total;
            else if (offset < -half) offset += total;

            const abs = Math.abs(offset);
            const isActive = offset === 0;
            const translateX = offset * (isMobile ? 88 : 92);
            const scale = isActive ? 1 : 0.85;
            const opacity = abs > 3 ? 0 : 1;
            const zIndex = isActive ? 10 : 10 - abs;

            return (
              <motion.div
                key={card.id}
                role="button"
                tabIndex={0}
                aria-label={`Selecionar ${card.name}`}
                onClick={() => {
                  if (!isActive) setActive(i);
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isActive) {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
                className="absolute top-1/2 left-1/2 aspect-[9/16] h-full max-h-[500px] overflow-hidden rounded-2xl bg-white"
                initial={{
                  x: `calc(-50% + ${translateX}%)`,
                  y: "-50%",
                  scale,
                  opacity,
                  zIndex,
                }}
                animate={{
                  x: `calc(-50% + ${translateX}%)`,
                  y: "-50%",
                  scale,
                  opacity,
                  zIndex,
                  boxShadow: isActive
                    ? "0 20px 40px rgba(0,0,0,0.15)"
                    : "0 4px 12px rgba(0,0,0,0.05)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ pointerEvents: abs > 2 ? "none" : "auto" }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />

                <div
                  className="absolute inset-x-3 bottom-4 flex items-center gap-3 rounded-2xl bg-white/95 p-2.5 shadow-lg backdrop-blur transition hover:bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.href) window.location.href = card.href;
                    }}
                    className="shrink-0"
                    aria-label={`Comprar ${card.name}`}
                  >
                    <img
                      src={card.thumb ?? card.image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  </button>
                  <div className="min-w-0 flex-1 text-left">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (card.href) window.location.href = card.href;
                      }}
                      className="block w-full text-left"
                    >
                      <h4 className="line-clamp-2 text-[13px] font-medium leading-tight text-neutral-800">
                        {card.name}
                      </h4>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-black">{brl(card.price)}</span>
                        {card.oldPrice && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            {brl(card.oldPrice)}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                  <div className="ml-2 flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={(e) => {
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
                        e.stopPropagation();
                        const productSlug = card.href?.split("/").pop();
                        if (productSlug) {
                          const product = findBySlug(productSlug);
                          if (product) add(product);
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#FF0080] text-[#FF0080] shadow-sm transition hover:bg-[#FF0080]/5 sm:h-8 sm:w-8"
                      aria-label={`Adicionar ${card.name} ao carrinho`}
                    >
                      <Plus className="h-2.5 w-2.5 mr-0.5" />
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
