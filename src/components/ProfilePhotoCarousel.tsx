"use client";

import { motion } from "motion/react";
import { Autoplay, EffectCards, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/effect-cards";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";
import { cn } from "./ui/utils";

interface ProfilePhotoCarouselProps {
  images: { src: string; alt?: string }[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
  height?: string;
  width?: string;
}

export function ProfilePhotoCarousel({
  images,
  className,
  showPagination = false,
  showNavigation = false,
  loop = true,
  autoplay = false,
  spaceBetween = 40,
  height = "260px",
  width = "100%",
}: ProfilePhotoCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center bg-gradient-to-br from-teal-100 to-navy-100 rounded-3xl", className)}
        style={{ height, width }}
      >
        <div className="text-gray-400 text-sm">No photos</div>
      </div>
    );
  }

  // If only one image, don't use carousel
  if (images.length === 1) {
    return (
      <div 
        className={cn("overflow-hidden rounded-3xl", className)}
        style={{ height, width }}
      >
        <img
          src={images[0].src}
          alt={images[0].alt || "Profile photo"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const css = `
    .ProfilePhotoCarousel {
      padding-bottom: 0 !important;
    }
    .ProfilePhotoCarousel .swiper-slide {
      border-radius: 1.5rem;
      overflow: hidden;
    }
  `;

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
      }}
      className={cn("relative w-full", className)}
      style={{ height, width }}
    >
      <style>{css}</style>

      <Swiper
        spaceBetween={spaceBetween}
        autoplay={
          autoplay
            ? {
                delay: 3000,
                disableOnInteraction: false,
              }
            : false
        }
        effect="cards"
        grabCursor={true}
        loop={loop && images.length > 2}
        pagination={
          showPagination
            ? {
                clickable: true,
              }
            : false
        }
        navigation={
          showNavigation
            ? {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }
            : false
        }
        className="ProfilePhotoCarousel h-full w-full"
        modules={[EffectCards, Autoplay, Pagination, Navigation]}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="rounded-3xl">
            <img
              className="h-full w-full object-cover"
              src={image.src}
              alt={image.alt || `Photo ${index + 1}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}

