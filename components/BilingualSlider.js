"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Globe, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from "lucide-react";

export default function BilingualSlider({ slides = [] }) {
  const [lang, setLang] = useState("en");
  const [isMounted, setIsMounted] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!slides || slides.length === 0) return null;

  // Tripling the slides array to create a seamless infinite buffer track
  const loopSlides = [...slides, ...slides, ...slides];

  // Center initial scroll on mount (middle set)
  useEffect(() => {
    if (sliderRef.current && slides.length > 0) {
      const container = sliderRef.current;
      const singleSetWidth = container.scrollWidth / 3;
      container.scrollLeft = singleSetWidth;
    }
  }, [slides.length]);

  // Seamless scroll boundary reset handler
  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const singleSetWidth = container.scrollWidth / 3;

    if (container.scrollLeft >= singleSetWidth * 2) {
      container.scrollLeft -= singleSetWidth;
    } else if (container.scrollLeft <= 5) {
      container.scrollLeft += singleSetWidth;
    }
  }, []);

  // Automatic interval timer to loop slides forward smoothly (paused if any card is expanded or being dragged)
  useEffect(() => {
    const hasExpanded = Object.values(expandedCards).some(Boolean);
    if (hasExpanded) return;

    const interval = setInterval(() => {
      if (!sliderRef.current || isDown) return;
      const cardWidth = 420; // card width + gap step
      sliderRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }, 4500);

    return () => clearInterval(interval);
  }, [isDown, expandedCards]);

  const toggleExpand = (index, e) => {
    e.stopPropagation();
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleTouchStart = (e) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setStartX(e.touches ? e.touches[0].pageX - sliderRef.current.offsetLeft : e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDown(false);
  };

  const handleTouchMove = (e) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.touches ? e.touches[0].pageX - sliderRef.current.offsetLeft : e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollByAmount = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = 420;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 mt-10 mb-6 relative z-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EA638C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EA638C]"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#3E442B]/70">
            {isMounted && lang === "bn" ? "ঘোষণা এবং সুবিধাসমূহ" : "Announcements & Perks"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollByAmount("left")}
              className="p-2 rounded-xl bg-white border border-gray-100 hover:bg-[#EA638C] hover:text-white hover:border-[#EA638C] text-[#3E442B] shadow-sm transition-all duration-300 cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scrollByAmount("right")}
              className="p-2 rounded-xl bg-white border border-gray-100 hover:bg-[#EA638C] hover:text-white hover:border-[#EA638C] text-[#3E442B] shadow-sm transition-all duration-300 cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Ultra-Modern Dual-Pill Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-md shadow-gray-100">
            <button
              onClick={() => setLang("en")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isMounted && lang === "en"
                  ? "bg-[#EA638C] text-white shadow-md shadow-[#EA638C]/30"
                  : "text-gray-400 hover:text-[#3E442B]"
              }`}
            >
              <Globe size={11} />
              <span>EN</span>
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all duration-300 cursor-pointer ${
                isMounted && lang === "bn"
                  ? "bg-[#3E442B] text-white shadow-md shadow-[#3E442B]/30"
                  : "text-gray-400 hover:text-[#EA638C]"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        onMouseDown={handleTouchStart}
        onMouseLeave={handleTouchEnd}
        onMouseUp={handleTouchEnd}
        onMouseMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing pb-6 pt-2 items-start"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loopSlides.map((item, index) => {
          const isExpanded = !!expandedCards[index];
          const titleText = isMounted && lang === "bn" ? item.bnTitle : item.enTitle;
          const subtitleText = isMounted && lang === "bn" ? item.bnSubtitle : item.enSubtitle;
          
          const hasLongText = subtitleText && subtitleText.length > 90;

          return (
            <div
              key={`${item._id || index}-${index}`}
              onMouseLeave={() => setExpandedCards((prev) => ({ ...prev, [index]: false }))}
              // 🟢 Narrower, more compact height (h-[160px])
              className={`w-[88vw] sm:w-[450px] md:w-[500px] lg:w-[550px] max-w-[550px] flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-white via-white to-[#FBB6E6]/15 border border-gray-100/80 p-5 sm:p-6 rounded-[2rem] shadow-xl shadow-gray-100/60 hover:shadow-2xl hover:shadow-[#EA638C]/10 hover:border-[#EA638C]/40 transition-all duration-300 flex flex-col justify-between select-none group ${
                isExpanded ? "h-auto z-30 bg-white shadow-2xl ring-2 ring-[#EA638C]/40" : "h-[160px]"
              }`}
            >
              {/* Luxury Glassmorphism Lighting FX */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FBB6E6]/30 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#3E442B]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Card Content Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  {item.badge ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 backdrop-blur-md border border-[#EA638C]/20 text-[#EA638C] text-[9px] font-black uppercase tracking-widest shadow-sm">
                      <Sparkles size={10} />
                      {item.badge}
                    </div>
                  ) : <div />}

                  {/* 🟢 Shifted Explore Feature indicator to top-right corner */}
                  <div className="flex items-center gap-1 text-[9px] font-black text-[#EA638C] uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                    <span>{isMounted && lang === "bn" ? "বিস্তারিত" : "Explore"}</span>
                    <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
                
                {/* Title */}
                <h4 className="text-sm sm:text-base font-black text-[#3E442B] tracking-tight mb-1.5 group-hover:text-[#EA638C] transition-colors duration-300">
                  {titleText}
                </h4>

                {/* Subtitle with external block button placed safely below */}
                <div className="relative">
                  <p
                    className={`text-xs sm:text-sm text-gray-500 font-medium leading-relaxed transition-all duration-300 ${
                      isExpanded ? "max-h-[300px] overflow-y-auto pr-1" : "line-clamp-2"
                    }`}
                  >
                    {subtitleText}
                  </p>

                  {hasLongText && !isExpanded && (
                    <button
                      onClick={(e) => toggleExpand(index, e)}
                      className="mt-1 inline-block text-[11px] font-bold text-[#EA638C] hover:text-[#3E442B] underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      {lang === "bn" ? "সম্পূর্ণ পড়ুন" : "Read more"}
                    </button>
                  )}

                  {isExpanded && (
                    <button
                      onClick={(e) => toggleExpand(index, e)}
                      className="mt-1 inline-block text-[11px] font-bold text-[#EA638C] hover:text-[#3E442B] underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      {lang === "bn" ? "সংক্ষিপ্ত করুন" : "Show less"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}