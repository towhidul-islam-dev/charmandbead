"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/image1.jpg", 
    link: "/products?category=new-arrivals",
    title: "New Arrivals",
  },
  {
    image: "/image2.jpg",
    link: "/products?category=charms",
    title: "Exquisite Charms",
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section 
      className="relative w-full mt-2 overflow-hidden bg-gray-100 aspect-[16/9] md:aspect-[21/9]" 
      style={{ minHeight: '320px' }} // Critical: Reserve space to prevent CLS
    >
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Only the active slide and the first slide (for LCP) are rendered with high priority */}
              <Link href={slide.link} className="relative block w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  // 🟢 Performance Secret: Force the first image to load with the HTML
                  priority={index === 0} 
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="object-cover"
                  quality={80} // 🟢 Dropping quality to 80 saves ~40% file size with minimal visual loss
                />
                <div className="absolute inset-0 bg-black/5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Optimized Navigation */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-4 pointer-events-none">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
          className="p-2 transition-all rounded-full pointer-events-auto bg-white/30 backdrop-blur-sm text-white hover:bg-white hover:text-[#3E442B] active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
          className="p-2 transition-all rounded-full pointer-events-auto bg-white/30 backdrop-blur-sm text-white hover:bg-white hover:text-[#3E442B] active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Branded Indicators */}
      <div className="absolute z-20 flex gap-2 -translate-x-1/2 bottom-4 left-1/2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 transition-all rounded-full ${
              current === i ? "w-8 bg-[#EA638C]" : "w-2 bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;