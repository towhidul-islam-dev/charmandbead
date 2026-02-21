"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ChevronRight, LayoutGrid, X } from "lucide-react";
import FeatureShowcase from "./FeatureShowcase";

export default function CategoryFilterSection({ products }) {
  const [activeTab, setActiveTab] = useState("All");
  const [animatingId, setAnimatingId] = useState(null);

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

  const handleCategoryClick = (name, index) => {
    setActiveTab(name);
    // Trigger animation for the "next" neighbor
    setAnimatingId(index + 1);
    
    // Reset animation state after it completes
    setTimeout(() => setAnimatingId(null), 600);
  };

  const filteredProducts = activeTab === "All" 
    ? products 
    : products.filter(p => p.categoryName === activeTab);

  return (
    <div className="space-y-10">
      <style jsx>{`
        @keyframes nudgeNext {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(8px); }
          50% { transform: translateX(-4px); }
          75% { transform: translateX(2px); }
        }
        .animate-nudge {
          animation: nudgeNext 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      <section className="relative">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]">
              Browse Materials
            </h2>
            {activeTab !== "All" && (
              <button 
                onClick={() => setActiveTab("All")}
                className="flex items-center gap-1 px-3 py-1 bg-[#FBB6E6]/20 hover:bg-[#FBB6E6]/40 text-[#EA638C] rounded-full text-[8px] font-black uppercase transition-all active:scale-95"
              >
                <X size={10} /> Reset
              </button>
            )}
          </div>
          <span className="text-[9px] font-black text-[#EA638C] uppercase flex items-center gap-1 italic animate-pulse">
            Slide <ChevronRight size={10} />
          </span>
        </div>

        <div className="flex gap-4 px-2 pt-6 pb-8 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {categories.map((cat, i) => {
            const isActive = activeTab === cat.name;
            const isNudging = animatingId === i;

            return (
              <button
                key={i}
                onClick={() => handleCategoryClick(cat.name, i)}
                className={`snap-start flex-shrink-0 transition-all duration-500 outline-none
                  ${isActive ? "scale-110 z-10" : "scale-100 opacity-60 hover:opacity-100"}
                  ${isNudging ? "animate-nudge" : ""}
                `}
              >
                <div className={`relative w-[85px] md:w-[95px] aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 ${
                  isActive 
                    ? "border-[#EA638C] shadow-[0_10px_20px_rgba(234,99,140,0.3)] bg-white" 
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
                  
                  <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
                    isActive ? "from-[#3E442B] opacity-90" : "from-[#3E442B]/70 opacity-60"
                  }`} />
                  
                  <div className="absolute bottom-2.5 left-0 right-0 px-1 text-center">
                    <p className="text-[8px] font-black text-white uppercase tracking-tighter truncate leading-tight">
                      {cat.name}
                    </p>
                    <p className={`text-[6px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? "text-[#FBB6E6]" : "text-gray-300"}`}>
                      {cat.count} PCS
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="px-2">
        <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
          <FeatureShowcase products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}