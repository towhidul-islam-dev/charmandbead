"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronRight, LayoutGrid } from "lucide-react";
import FeatureShowcase from "./FeatureShowcase";

export default function CategoryFilterSection({ products }) {
  const [activeTab, setActiveTab] = useState("All");

  // 🛠️ Logic: Grouping by your categoryName field
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

  const filteredProducts = activeTab === "All" 
    ? products 
    : products.filter(p => p.categoryName === activeTab);

  return (
    <div className="space-y-10">
      {/* 🟢 CATEGORY SLIDER WITH SOFT PINK BACKDROP */}
      <section className="relative py-8 -mx-4 px-4 md:-mx-8 md:px-8 bg-[#FBB6E6]/10 border-y border-[#FBB6E6]/20">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]">
              Browse Materials
            </h2>
            <div className="h-0.5 w-6 bg-[#EA638C] mt-1 rounded-full"></div>
          </div>
          <span className="text-[9px] font-black text-[#EA638C] uppercase flex items-center gap-1 italic">
            Slide Collection <ChevronRight size={10} />
          </span>
        </div>

        <div className="flex gap-3 pb-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(cat.name)}
              className={`snap-start flex-shrink-0 transition-all duration-500 ${
                activeTab === cat.name ? "scale-105" : "opacity-60 hover:opacity-100 grayscale-[0.3] hover:grayscale-0"
              }`}
            >
              {/* Compact Card Size: 85px Square */}
              <div className={`relative w-[85px] md:w-[95px] aspect-square rounded-[1.2rem] overflow-hidden border-2 transition-all duration-500 ${
                activeTab === cat.name 
                  ? "border-[#EA638C] shadow-lg shadow-pink-200/50 bg-white" 
                  : "border-white/50 shadow-sm bg-white/50"
              }`}>
                {cat.isAll ? (
                  <div className="absolute inset-0 bg-[#3E442B] flex flex-col items-center justify-center">
                    <LayoutGrid className="text-[#FBB6E6]" size={22} />
                  </div>
                ) : (
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    className="object-cover"
                    sizes="100px"
                  />
                )}
                
                {/* Brand Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E442B]/90 via-[#3E442B]/20 to-transparent" />
                
                {/* Labels */}
                <div className="absolute left-0 right-0 px-1 text-center bottom-2">
                  <p className="text-[8px] font-black text-white uppercase tracking-tighter truncate leading-tight drop-shadow-md">
                    {cat.name}
                  </p>
                  <p className="text-[6px] font-bold text-[#FBB6E6] uppercase tracking-widest">
                    {cat.count} {cat.count === 1 ? 'PC' : 'PCS'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 🟢 SHOWCASE */}
      <div className="duration-700 animate-in fade-in slide-in-from-bottom-2">
        <FeatureShowcase products={filteredProducts} />
      </div>
    </div>
  );
}