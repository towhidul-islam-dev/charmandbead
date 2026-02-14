"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/giveaway1.png", 
    link: "/products?category=new-arrivals",
    title: "New Arrivals",
  },
  {
    image: "/c&b1.png",
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
      /* 🟢 UPDATED: Shorter aspect ratios (21/9 for mobile, 3/1 for desktop) */
      className="relative w-full mt-2 overflow-hidden bg-gray-100 aspect-[21/9] md:aspect-[3/1] lg:aspect-[3.5/1]" 
      style={{ minHeight: '220px' }} // Reduced minHeight for a sleeker look
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
              <Link href={slide.link} className="relative block w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0} 
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  /* 🟢 UPDATED: Added object-center to keep focus in middle */
                  className="object-cover object-center" 
                  quality={80}
                />
                <div className="absolute inset-0 bg-black/5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Navigation - Made slightly smaller to match shorter height */}
      <div className="absolute inset-0 z-20 flex items-center justify-between px-3 pointer-events-none md:px-6">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
          className="p-1.5 md:p-2 transition-all rounded-full pointer-events-auto bg-white/30 backdrop-blur-sm text-white hover:bg-white hover:text-[#3E442B] active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
          className="p-1.5 md:p-2 transition-all rounded-full pointer-events-auto bg-white/30 backdrop-blur-sm text-white hover:bg-white hover:text-[#3E442B] active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="md:w-6 md:h-6" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute z-20 flex gap-1.5 -translate-x-1/2 bottom-3 left-1/2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all rounded-full ${
              current === i ? "w-6 bg-[#EA638C]" : "w-1.5 bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;