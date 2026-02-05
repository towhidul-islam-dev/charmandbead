"use client";
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  return (
    // Reduced height from h-screen to h-[40vh] md:h-[50vh]
    <section className="relative w-full h-[45vh] md:h-[55vh] overflow-hidden bg-gray-100 mt-2">
      <div className="flex w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* 🟢 The entire slide is now a clickable Link */}
            <Link href={slide.link} className="relative block w-full h-full group">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover transition-transform duration-[10s] group-hover:scale-110"
              />
              {/* Subtle Overlay to make text pop if you add any */}
              <div className="absolute inset-0 transition-colors bg-black/10 group-hover:bg-black/5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#3E442B] transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#3E442B] transition-all"
      >
        <ChevronRight size={24} />
      </button>

      {/* 🟢 Branded Indicators (Pink: #EA638C) */}
      <div className="absolute z-20 flex gap-3 -translate-x-1/2 bottom-6 left-1/2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 transition-all rounded-full ${
              current === i ? "w-8 bg-[#EA638C]" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;