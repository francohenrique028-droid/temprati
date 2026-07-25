"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { SparklesIcon } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Badge } from "@/components/ui/badge";

interface CarouselProps {
  images: { src: string; alt: string }[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
  title = "Card Carousel",
  subtitle = "Seamless Images carousel animation.",
  badgeLabel = "Latest component",
}) => {
  const css = `
  .card-carousel .swiper { width: 100%; padding-bottom: 50px; }
  .card-carousel .swiper-slide { background-position: center; background-size: cover; width: 300px; }
  .card-carousel .swiper-slide img { display: block; width: 100%; }
  .card-carousel .swiper-3d .swiper-slide-shadow-left { background-image: none; }
  .card-carousel .swiper-3d .swiper-slide-shadow-right { background: none; }
  .card-carousel .swiper-pagination-bullet-active { background: #1F1F1F; }
  .card-carousel .swiper-button-next, .card-carousel .swiper-button-prev { color: #1F1F1F; }
  `;

  return (
    <section className="card-carousel w-full">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-4xl rounded-[24px] border border-black/5 p-2 shadow-sm md:rounded-t-[44px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-black/5 bg-neutral-800/5 p-2 shadow-sm md:items-start md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px] md:p-2">
          <Badge
            variant="outline"
            className="absolute left-4 top-6 rounded-[14px] border border-black/10 text-base md:left-6"
          >
            <SparklesIcon className="mr-1 h-4 w-4 fill-[#EEBDE0] stroke-1 text-neutral-800" />
            {badgeLabel}
          </Badge>
          <div className="flex flex-col justify-center pb-2 pl-4 pt-14 md:items-center">
            <div className="flex gap-2">
              <div>
                <h3 className="text-4xl font-bold tracking-tight opacity-85">{title}</h3>
                <p>{subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-4">
            <div className="w-full">
              <Swiper
                spaceBetween={50}
                autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                slidesPerView={"auto"}
                coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
                pagination={showPagination}
                navigation={
                  showNavigation
                    ? { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
                    : undefined
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={`a-${index}`}>
                    <div className="size-full rounded-3xl">
                      <img
                        src={image.src}
                        width={500}
                        height={500}
                        className="size-full rounded-xl object-cover"
                        alt={image.alt}
                        loading="lazy"
                      />
                    </div>
                  </SwiperSlide>
                ))}
                {images.map((image, index) => (
                  <SwiperSlide key={`b-${index}`}>
                    <div className="size-full rounded-3xl">
                      <img
                        src={image.src}
                        width={200}
                        height={200}
                        className="size-full rounded-xl object-cover"
                        alt={image.alt}
                        loading="lazy"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
