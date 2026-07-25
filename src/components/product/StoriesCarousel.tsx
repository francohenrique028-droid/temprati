import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type StoryCard = {
  id: string | number;
  image: string;
  name: string;
  price: number;
  username: string;
  avatar: string;
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
        {/* Cards */}
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
            const translateX = offset * 62; // % of card width
            const scale = isActive ? 1.05 : 0.82;
            const opacity = isActive ? 1 : 0.55;
            const zIndex = 10 - abs;

            return (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => (isActive ? undefined : setActive(i))}
                className="absolute top-1/2 left-1/2 aspect-[9/16] h-full max-h-[600px] overflow-hidden rounded-2xl shadow-2xl"
                animate={{
                  x: `calc(-50% + ${translateX}%)`,
                  y: "-50%",
                  scale,
                  opacity,
                  zIndex,
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
                {/* gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

                {/* top: avatar + username */}
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <div className="rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-yellow-400 p-[2px]">
                    <img
                      src={card.avatar}
                      alt={card.username}
                      className="h-8 w-8 rounded-full border-2 border-black object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-white drop-shadow">
                    @{card.username}
                  </span>
                </div>

                {/* bottom: name + price + cta */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <div className="min-w-0 text-left">
                    <h4 className="truncate text-base font-bold leading-tight text-white md:text-lg">
                      {card.name}
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-emerald-400 md:text-base">
                      {brl(card.price)}
                    </p>
                  </div>
                  <a
                    href={card.href ?? "#"}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-black backdrop-blur transition hover:bg-white md:text-xs"
                  >
                    Ver produto
                  </a>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="anterior"
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 md:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="próximo"
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 md:right-6"
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
              i === active ? "w-8 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
