"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSlides = useCallback(async () => {
    try {
      // 🟢 Added a cache-busting timestamp to ensure you see fresh data
      const res = await fetch(`/api/hero-slides?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // 🟢 Debugging: Check your browser console (F12) to see if data arrives
      console.log("HeroCarousel Data:", data);
      
      setSlides(data);
    } catch (err) {
      console.error("Hero Carousel Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, slides.length]);

  if (loading) {
    return (
      <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#EA638C]" size={32} />
      </div>
    );
  }

  // If no slides are found after loading, the section won't render at all
  if (slides.length === 0) return null;

  return (
    <section 
      className="relative w-full mt-2 overflow-hidden bg-gray-100 aspect-[21/9] md:aspect-[3/1] lg:aspect-[3.5/1]" 
      style={{ minHeight: '220px' }}
    >
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === current;
          
          // Improved check for PDF/SVG
          const imageUrl = slide.image || "";
          const isPdf = imageUrl.toLowerCase().endsWith('.pdf') || slide.format === 'pdf';
          const isSvg = imageUrl.toLowerCase().endsWith('.svg') || slide.format === 'svg';

          return (
            <div
              key={slide._id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {isPdf ? (
                <div className="relative w-full h-full bg-gray-200">
                  <iframe 
                    src={`${imageUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                    className="w-full h-full border-none pointer-events-none"
                    title={slide.title}
                  />
                  <Link href={slide.link || "#"} className="absolute inset-0 z-20" />
                </div>
              ) : (
                <Link href={slide.link || "#"} className="relative block w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={slide.title || "Banner"}
                    fill
                    priority={index === 0}
                    unoptimized={isSvg}
                    className="object-cover object-center"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute inset-0 z-30 flex items-center justify-between px-3 pointer-events-none md:px-6">
            <button 
              onClick={(e) => { e.preventDefault(); prevSlide(); }}
              className="p-1.5 md:p-2 transition-all rounded-full pointer-events-auto bg-white/40 backdrop-blur-md text-[#3E442B] hover:bg-white active:scale-95 shadow-sm"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); nextSlide(); }}
              className="p-1.5 md:p-2 transition-all rounded-full pointer-events-auto bg-white/40 backdrop-blur-md text-[#3E442B] hover:bg-white active:scale-95 shadow-sm"
            >
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          <div className="absolute z-30 flex gap-1.5 -translate-x-1/2 bottom-4 left-1/2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 transition-all rounded-full ${
                  current === i ? "w-8 bg-[#EA638C]" : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;