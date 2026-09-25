"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, ArrowRight, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function LabTeaser() {
  const [topTrends, setTopTrends] = useState([]);
  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchTopThree = async () => {
      const res = await fetch("/api/recommend/top-trends");
      const data = await res.json();
      setTopTrends(data.filter(t => t.status !== "Stocked"));
    };
    fetchTopThree();
  }, []);

  // Tripling the items array for the infinite loop buffer
  const loopTrends = topTrends.length > 0 ? [...topTrends, ...topTrends, ...topTrends] : [];

  // Center initial scroll on mount to the middle set
  useEffect(() => {
    if (sliderRef.current && topTrends.length > 0) {
      const container = sliderRef.current;
      const singleSetWidth = container.scrollWidth / 3;
      container.scrollLeft = singleSetWidth;
    }
  }, [topTrends.length]);

  // Seamless scroll boundary reset handler
  const handleScroll = useCallback(() => {
    if (!sliderRef.current || topTrends.length === 0) return;
    const container = sliderRef.current;
    const singleSetWidth = container.scrollWidth / 3;

    if (container.scrollLeft >= singleSetWidth * 2) {
      container.scrollLeft -= singleSetWidth;
    } else if (container.scrollLeft <= 5) {
      container.scrollLeft += singleSetWidth;
    }
  }, [topTrends.length]);

  // Automatic interval timer to loop forward smoothly
  useEffect(() => {
    if (isHovered || isDown || topTrends.length === 0) return;

    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const cardWidth = 380 + 24; // card width + gap
      sliderRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, isDown, topTrends.length]);

  if (topTrends.length === 0) return null;

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
    const scrollAmount = 380 + 24;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 overflow-hidden bg-white">
      <div className="px-6 mx-auto max-w-7xl">
        
        {/* HEADER */}
        <div className="flex flex-col justify-between gap-6 mb-12 md:flex-row md:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-pink-100 rounded-full bg-pink-50">
              <Zap size={12} className="text-[#EA638C] fill-current" />
              <span className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest text-nowrap">Live from the Lab</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-[#3E442B] leading-[0.85]">
              VOTED BY <br /> <span className="text-[#EA638C]">YOU.</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Navigation Arrows for Slider */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollByAmount("left")}
                className="p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-[#EA638C] hover:text-white hover:border-[#EA638C] text-[#3E442B] shadow-sm transition-all duration-300 cursor-pointer"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollByAmount("right")}
                className="p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-[#EA638C] hover:text-white hover:border-[#EA638C] text-[#3E442B] shadow-sm transition-all duration-300 cursor-pointer"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Link 
              href="/product-lab" 
              className="group hidden sm:flex items-center gap-3 text-sm font-black uppercase tracking-tighter text-[#3E442B] hover:text-[#EA638C] transition-colors"
            >
              Enter the Lab <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>

        {/* TREND CARDS INFINITE SLIDER */}
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsDown(false);
          }}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className="flex gap-6 pb-4 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loopTrends.map((trend, index) => {
            // Recalculate rank badge index based on original array length
            const originalIndex = index % topTrends.length;

            return (
              <div 
                key={`${trend._id}-${index}`} 
                className="group relative flex-shrink-0 w-[80vw] sm:w-[350px] md:w-[380px]"
              >
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-lg select-none">
                  <img 
                    src={trend.imageUrl} 
                    className="object-cover w-full h-full transition-transform duration-1000 pointer-events-none group-hover:scale-110" 
                    alt="trending" 
                  />
                  
                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3E442B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <p className="text-2xl italic font-black leading-none tracking-tighter text-white uppercase">
                      {trend.aiAnalysis.category}
                    </p>
                    <p className="text-pink-300 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                      <Sparkles size={10} /> {trend.votes} Votes
                    </p>
                  </div>

                  {/* Rank Badge */}
                  <div className="absolute flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl top-6 left-6">
                    <span className="text-[#3E442B] font-black italic text-lg">#{originalIndex + 1}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA FOOTER */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-[10px] font-black tracking-[0.4em] uppercase mb-6">
            Have a style in mind? Upload it now.
          </p>
          <Link 
            href="/product-lab"
            className="inline-block bg-[#3E442B] text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-[#EA638C] hover:scale-105 transition-all shadow-2xl"
          >
            Suggest a Treasure
          </Link>
        </div>
      </div>
    </section>
  );
}