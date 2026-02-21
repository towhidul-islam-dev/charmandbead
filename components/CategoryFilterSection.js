"use client";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { ChevronRight, LayoutGrid, X } from "lucide-react";
import FeatureShowcase from "./FeatureShowcase";

export default function CategoryFilterSection({ products }) {
  const [activeTab, setActiveTab] = useState("All");
  const [animatingId, setAnimatingId] = useState(null);
  const scrollRef = useRef(null); // Reference for the slider container

  const categories = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      const name = p.categoryName || "General";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const unique = Object.keys(counts).map(name => ({
      name,
      count: counts[name],
      image: products.find(p => p.categoryName === name)?.imageUrl || products[0]?.imageUrl
    }));

    return [{ name: "All", count: products.length, isAll: true }, ...unique];
  }, [products]);

  const handleCategoryClick = (name, index, e) => {
    setActiveTab(name);
    
    // 1. Advance Animation: Nudge the next neighbor
    setAnimatingId(index + 1);
    setTimeout(() => setAnimatingId(null), 600);

    // 2. Auto-Scroll Logic: Center the clicked card
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = e.currentTarget;
      const scrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const filteredProducts = activeTab === "All" 
    ? products 
    : products.filter(p => p.categoryName === activeTab);

  return (
    <div className="space-y-10">
      <style jsx>{`
        @keyframes nudgeNext {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(12px); }
          40% { transform: translateX(-6px); }
          60% { transform: translateX(4px); }
          80% { transform: translateX(-2px); }
        }
        .animate-nudge {
          animation: nudgeNext 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <section className="relative">
        {/* Header Controls */}
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]">
              Browse Materials
            </h2>
            {activeTab !== "All" && (
              <button 
                onClick={() => setActiveTab("All")}
                className="flex items-center gap-1 px-3 py-1 bg-[#EA638C]/10 hover:bg-[#EA638C]/20 text-[#EA638C] rounded-full text-[8px] font-black uppercase transition-all"
              >
                <X size={10} /> Reset
              </button>
            )}
          </div>
          <span className="text-[9px] font-black text-[#EA638C] uppercase flex items-center gap-1 italic">
            Slide <ChevronRight size={10} />
          </span>
        </div>

        {/* Scrollable Slider Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 px-2 pt-6 pb-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {categories.map((cat, i) => {
            const isActive = activeTab === cat.name;
            const isNudging = animatingId === i;

            return (
              <button
                key={i}
                onClick={(e) => handleCategoryClick(cat.name, i, e)}
                className={`snap-center flex-shrink-0 transition-all duration-500 outline-none relative
                  ${isActive ? "scale-110 z-10" : "scale-100 opacity-60 hover:opacity-100"}
                  ${isNudging ? "animate-nudge" : ""}
                `}
              >
                {/* Visual Card */}
                <div className={`relative w-[85px] md:w-[100px] aspect-square rounded-[1.4rem] overflow-hidden border-2 transition-all duration-500 ${
                  isActive 
                    ? "border-[#EA638C] shadow-[0_12px_24px_rgba(234,99,140,0.35)] bg-white" 
                    : "border-gray-100 shadow-sm bg-gray-50"
                }`}>
                  {cat.isAll ? (
                    <div className="absolute inset-0 bg-[#3E442B] flex flex-col items-center justify-center">
                      <LayoutGrid className={`${isActive ? "text-[#EA638C]" : "text-[#FBB6E6]"} transition-colors`} size={24} />
                    </div>
                  ) : (
                    <Image 
                      src={cat.image} 
                      alt={cat.name} 
                      fill 
                      className={`object-cover transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                      sizes="100px"
                    />
                  )}
                  
                  {/* Styling Overlays */}
                  <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
                    isActive ? "from-[#3E442B] opacity-95" : "from-[#3E442B]/80 opacity-60"
                  }`} />
                  
                  {/* Labels */}
                  <div className="absolute bottom-2.5 left-0 right-0 px-1 text-center">
                    <p className="text-[8px] font-black text-white uppercase tracking-tighter truncate leading-tight drop-shadow-sm">
                      {cat.name}
                    </p>
                    <p className={`text-[6px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? "text-[#FBB6E6]" : "text-gray-400"}`}>
                      {cat.count} PCS
                    </p>
                  </div>
                </div>

                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#EA638C] rounded-full shadow-[0_0_8px_#EA638C]"></div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Showcase Grid */}
      <div className="px-2">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <FeatureShowcase products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}