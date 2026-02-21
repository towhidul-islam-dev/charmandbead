"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Search, X, ChevronDown, ArrowUp, LayoutGrid, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function FeatureShowcase({ products }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(8); 
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [animatingId, setAnimatingId] = useState(null);
  
  const scrollRef = useRef(null);
  const loadMoreRef = useRef(null);

  const categoriesData = useMemo(() => {
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
    setActiveCategory(name);
    setVisibleCount(8);
    setAnimatingId(index + 1);
    setTimeout(() => setAnimatingId(null), 600);

    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = e.currentTarget;
      const scrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.categoryName === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price <= maxPrice;
      return matchesCategory && matchesSearch && matchesPrice;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [products, activeCategory, searchQuery, maxPrice, sortBy]);

  const visibleProducts = processedProducts.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < processedProducts.length) {
        setVisibleCount((prev) => prev + 4);
      }
    }, { threshold: 0.5 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, processedProducts.length]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative space-y-10">
      <style jsx>{`
        @keyframes nudgeNext {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(15px); }
          40% { transform: translateX(-8px); }
          60% { transform: translateX(5px); }
        }
        .animate-nudge {
          animation: nudgeNext 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        /* Custom Range Slider Styling */
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #EA638C;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(234, 99, 140, 0.4);
        }
        input[type='range']::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #EA638C;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
        }
      `}</style>

      {/* --- CATEGORY SLIDER --- */}
      <section className="relative w-full overflow-hidden">
        {/* <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]">Materials</h2>
            {activeCategory !== "All" && (
              <button 
                onClick={() => setActiveCategory("All")}
                className="flex items-center gap-1 px-3 py-1 bg-[#EA638C]/10 text-[#EA638C] rounded-full text-[8px] font-black uppercase transition-all active:scale-95"
              >
                <X size={10} /> Reset
              </button>
            )}
          </div>
          <span className="text-[9px] font-black text-[#EA638C] uppercase flex items-center gap-1 italic">
            Slide <ChevronRight size={10} />
          </span>
        </div> */}

        <div ref={scrollRef} className="flex gap-4 px-2 pt-6 pb-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
          {categoriesData.map((cat, i) => {
            const isActive = activeCategory === cat.name;
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
                <div className={`relative w-[85px] md:w-[100px] aspect-square rounded-[1.4rem] overflow-hidden border-2 transition-all duration-500 ${
                  isActive ? "border-[#EA638C] shadow-lg shadow-pink-200" : "border-gray-100 shadow-sm bg-gray-50"
                }`}>
                  {cat.isAll ? (
                    <div className="absolute inset-0 bg-[#3E442B] flex flex-col items-center justify-center">
                      <LayoutGrid className={`${isActive ? "text-[#EA638C]" : "text-[#FBB6E6]"}`} size={24} />
                    </div>
                  ) : (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="100px" />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t ${isActive ? "from-[#3E442B] opacity-90" : "from-[#3E442B]/70 opacity-60"}`} />
                  <div className="absolute bottom-2.5 left-0 right-0 px-1 text-center">
                    <p className="text-[8px] font-black text-white uppercase tracking-tighter truncate leading-tight">{cat.name}</p>
                    <p className={`text-[6px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? "text-[#FBB6E6]" : "text-gray-400"}`}>{cat.count} PCS</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* --- CONTROLS SECTION --- */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center">
        {/* Sort Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none px-5 py-3 bg-gray-50 border border-gray-100 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low-High</option>
            <option value="price-high">Price: High-Low</option>
          </select>
          <ChevronDown className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2" size={12} />
        </div>

        {/* Custom Price Slider */}
        <div className="w-full sm:w-64 px-5 py-2 bg-gray-50 border border-gray-100 rounded-[1.2rem]">
          <div className="flex justify-between mb-1">
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Budget</span>
            <span className="text-[8px] font-black text-[#3E442B]">৳{maxPrice}</span>
          </div>
          <input 
            type="range" min="0" max="10000" step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#EA638C]"
          />
        </div>

        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={14} />
          <input
            type="text" placeholder="SEARCH MATERIALS..."
            value={searchQuery}
            className="w-full pl-10 pr-5 py-3 bg-gray-50 border border-gray-100 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest focus:outline-none focus:bg-white transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-1 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/20">
          <p className="text-[9px] font-black tracking-[0.3em] text-gray-300 uppercase">No Materials Found</p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-10" />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-10 right-10 z-[100] p-5 rounded-full bg-[#3E442B] text-white shadow-xl transition-all duration-700 ${
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
        } hover:bg-[#EA638C] active:scale-90`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}