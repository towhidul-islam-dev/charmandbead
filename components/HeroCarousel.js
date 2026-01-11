"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";


const slides = [
  {
    id: 1,
    title: "BLACK FRIDAY",
    subTitle: "সাধ্যের মধ্যে সবটুকু",
    brand: "আমেরিকা",
    bg: "from-[#e8f5e9] via-[#f1f8f6] to-[#e0f2f1]",
    accent: "#1b5e20",
    image: "/man-with-laptop.png",
  },
  {
    id: 2,
    title: "WINTER SALE",
    subTitle: "নতুন কালেকশন",
    brand: "লন্ডন",
    bg: "from-[#e3f2fd] via-[#f0f4f8] to-[#e1f5fe]",
    accent: "#0d47a1",
    image: "/man-with-laptop.png", // Replace with another image if available
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section
      className={`relative min-h-[550px] w-full bg-gradient-to-r ${slides[current].bg} transition-all duration-1000 overflow-hidden flex items-center`}
    >
      {/* City Skyline Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale">
        <div className="absolute bottom-0 w-full h-72 bg-[url('https://www.transparenttextures.com/patterns/city-skyline.png')] bg-repeat-x"></div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12">
        {/* Left Side (Content) */}
        <div
          key={slides[current].id}
          className="space-y-8 animate-in fade-in slide-in-from-left duration-700"
        >
          <div className="relative inline-block">
            <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-gray-900 leading-[0.8]">
              {slides[current].title.split(" ")[0]} <br />
              <span className="text-6xl md:text-8xl">
                {slides[current].title.split(" ")[1]}
              </span>
            </h2>
            <span className="absolute -top-6 -left-8 text-gray-400 text-2xl">
              ✦
            </span>
          </div>

          <div className="space-y-4">
            <div
              className="inline-block px-8 py-3 rounded-md transform -skew-x-12 shadow-lg"
              style={{ backgroundColor: slides[current].accent }}
            >
              <h3 className="text-white text-3xl md:text-5xl font-bold skew-x-12">
                {slides[current].subTitle}
              </h3>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-[#0d47a1] tracking-tight">
              {slides[current].brand}
            </h1>
          </div>

          <Link href="/products">
            <button className="group flex items-center gap-3 bg-[#0d47a1] text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:bg-blue-800 transition-all">
              Shop Now{" "}
              <ArrowRight
                size={24}
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>
          </Link>
        </div>

        {/* Right Side (Image/Visuals) */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Browser Mockup */}
          <div className="absolute top-0 left-0 lg:-left-16 z-10 w-full max-w-[420px] bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-5 hidden md:block">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200"
                >
                  <ShoppingBag className="text-blue-600/20" size={32} />
                </div>
              ))}
            </div>
          </div>
          <img
            src={slides[current].image}
            alt="Hero"
            className="relative z-20 w-[320px] h-[450px] md:w-[500px] md:h-[600px] object-contain drop-shadow-2xl animate-in zoom-in duration-1000"
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-30 p-2 bg-white/50 rounded-full hover:bg-white transition-colors"
      >
        <ChevronLeft size={30} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 z-30 p-2 bg-white/50 rounded-full hover:bg-white transition-colors"
      >
        <ChevronRight size={30} />
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${current === i ? "w-8 bg-blue-600" : "w-2 bg-gray-300"}`}
          />
        ))}
      </div>
    </section>
  );
}
