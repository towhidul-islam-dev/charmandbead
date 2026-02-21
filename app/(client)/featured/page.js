"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronRight, Layers } from "lucide-react";
import FeatureShowcase from "@components/FeatureShowcase";

export default function CategoryFilter({ products }) {
  const [activeCategory, setActiveCategory] = useState("All");

  // Logic to build category list from product data
  const categories = useMemo(() => {
    const counts = products.reduce((acc, product) => {
      const cat = product.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const uniqueCats = Object.keys(counts).map((name) => ({
      name,
      count: counts[name],
      image: products.find((p) => p.category === name)?.imageUrl || products[0]?.imageUrl,
    }));

    // Add 'All' option at the beginning
    return [{ name: "All", count: products.length, isAll: true }, ...uniqueCats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  return (
    <div className="space-y-10">
      {/* 🚀 CATEGORY CARD SLIDER */}
      <section>
        <div className="flex items-center justify-between px-2 mb-5">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#EA638C]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]">
              Materials
            </h2>
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase italic">
            {activeCategory} Viewing
          </span>
        </div>

        {/* Small, compact cards */}
        <div className="flex gap-3 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(cat.name)}
              className={`snap-center flex-shrink-0 w-[110px] md:w-[140px] group transition-all duration-300 ${
                activeCategory === cat.name ? "scale-105" : "hover:opacity-100 opacity-80"
              }`}
            >
              <div className={`relative aspect-[1/1.2] rounded-[1.8rem] overflow-hidden border-2 transition-all duration-500 ${
                activeCategory === cat.name 
                  ? "border-[#EA638C] shadow-lg shadow-pink-100" 
                  : "border-gray-100 shadow-sm"
              }`}>
                {cat.isAll ? (
                  <div className="absolute inset-0 bg-[#3E442B] flex items-center justify-center">
                    <Layers className="text-[#FBB6E6]" size={32} />
                  </div>
                ) : (
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    className="object-cover" 
                  />
                )}
                
                {/* Count Tag */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-[#EA638C] px-2 py-0.5 rounded-full text-[8px] font-black border border-gray-100">
                  {cat.count}
                </div>

                {/* Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute left-0 right-0 px-2 text-center bottom-3">
                  <p className="text-[9px] font-black text-white uppercase tracking-tighter truncate px-1">
                    {cat.name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. SHOWCASE SECTION (Dynamic filtering) */}
      <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        <FeatureShowcase products={filteredProducts} />
      </div>
    </div>
  );
}