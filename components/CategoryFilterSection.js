"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronRight, LayoutGrid } from "lucide-react";
import FeatureShowcase from "./FeatureShowcase";

export default function CategoryFilterSection({ products }) {
  const [activeTab, setActiveTab] = useState("All");

  // Extract categories and count items
  const categories = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      const name = p.category || "General";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const unique = Object.keys(counts).map(name => ({
      name,
      count: counts[name],
      image: products.find(p => p.category === name)?.imageUrl || products[0].imageUrl
    }));

    return [{ name: "All", count: products.length, isAll: true }, ...unique];
  }, [products]);

  // Filter logic
  const filteredProducts = activeTab === "All" 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="space-y-12">
      {/* 🟢 Compact Category Slider */}
      <div className="overflow-hidden">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B]">Filter by Material</h2>
          <span className="text-[10px] font-black text-[#EA638C] uppercase flex items-center gap-2 italic">
            Swipe <ChevronRight size={12} />
          </span>
        </div>

        <div className="flex gap-4 px-4 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(cat.name)}
              className={`snap-start flex-shrink-0 transition-all duration-300 ${
                activeTab === cat.name ? "scale-105" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className={`relative w-[120px] md:w-[150px] aspect-[4/5] rounded-[2rem] overflow-hidden border-2 transition-all duration-500 ${
                activeTab === cat.name ? "border-[#EA638C] shadow-lg shadow-pink-100" : "border-white shadow-sm"
              }`}>
                {cat.isAll ? (
                  <div className="absolute inset-0 bg-[#3E442B] flex flex-col items-center justify-center gap-2">
                    <LayoutGrid className="text-[#FBB6E6]" size={24} />
                  </div>
                ) : (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                )}
                
                {/* Count Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#EA638C] px-2 py-0.5 rounded-full text-[8px] font-black border border-gray-100">
                  {cat.count}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#3E442B] via-transparent to-transparent opacity-80" />
                <div className="absolute left-0 right-0 px-2 text-center bottom-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest italic truncate px-1">
                    {cat.name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 Dynamic Showcase */}
      <div className="duration-700 animate-in fade-in">
        <FeatureShowcase products={filteredProducts} />
      </div>
    </div>
  );
}