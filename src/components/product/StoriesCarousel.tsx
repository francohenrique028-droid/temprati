import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

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
  const [active, setActive] = useState(0);
  const total = cards.length;

  const go = (dir: number) => setActive((i) => (i + dir + total) % total);

  const onDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) go(1);
    else if (info.offset.x > 60) go(-1);
  };

  return (
    <div className="relative w-full overflow-hidden py-10 md:py-14">
      <div className="relative mx-auto h-[560px] w-full max-w-6xl md:h-[640px]">
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
            const translateX = offset * 78; // % of card width — side cards fully visible
            const scale = isActive ? 1 : 0.9;
            const opacity = abs > 1 ? 0 : 1;
            const zIndex = isActive ? 10 : 10 - abs - 1;

            return (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => (isActive ? undefined : setActive(i))}
                className="absolute top-1/2 left-1/2 aspect-[9/16] h-full max-h-[600px] overflow-hidden rounded-3xl bg-white"
                animate={{
                  x: `calc(-50% + ${translateX}%)`,
                  y: "-50%",
                  scale,
                  opacity,
                  zIndex,
                  boxShadow: isActive
                    ? "0 24px 60px rgba(0,0,0,0.18)"
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

                {/* rating badge */}
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-white/85 px-2 py-1 text-[11px] font-semibold text-black backdrop-blur">
                  <Star className="h-3 w-3 fill-black text-black" />
                  {(card.rating ?? 5).toFixed(2)}
                </div>

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
                </a>
              </motion.button>
            );
          })}
        </motion.div>

        {/* arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="anterior"
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md backdrop-blur transition hover:bg-white md:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="próximo"
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md backdrop-blur transition hover:bg-white md:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`ir para ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-8 bg-foreground" : "w-1.5 bg-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
