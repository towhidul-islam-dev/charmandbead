"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Search, X, SlidersHorizontal, ChevronDown, ArrowUp } from "lucide-react";

export default function FeatureShowcase({ products }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(8); 
  const [showBackToTop, setShowBackToTop] = useState(false);
  const loadMoreRef = useRef(null);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], [products]);

  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
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

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < processedProducts.length) {
        setVisibleCount((prev) => prev + 4);
      }
    }, { threshold: 0.5 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, processedProducts.length]);

  // Back to Top Logic
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative space-y-10 md:space-y-16">
      {/* --- FILTER BAR DESIGN --- */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        
        {/* Category Section */}
<div className="w-full lg:w-auto">
  <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 mb-3 md:mb-5 tracking-[0.25em] ml-1">
    Select Material
  </p>
  
  {/* 🟢 FIXED: Added px-1 and py-1 to prevent edge clipping during horizontal scroll */}
  <div className="flex gap-2 px-1 py-1 overflow-x-auto md:gap-4 no-scrollbar scroll-smooth items-center">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => { setActiveCategory(cat); setVisibleCount(8); }}
        className={`whitespace-nowrap px-6 py-3 md:px-10 md:py-4 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-200 border flex items-center justify-center leading-none overflow-visible ${
          activeCategory === cat
            ? "bg-[#3E442B] text-white border-[#3E442B]"
            : "bg-transparent text-gray-400 border-gray-100 hover:border-[#EA638C] hover:text-[#EA638C]"
        }`}
      >
        {/* Relative span ensures the bold text baseline is perfectly centered */}
        <span className="relative inline-block">{cat}</span>
      </button>
    ))}
  </div>
</div>

        {/* Controls Section */}
        <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center lg:w-auto">
          
          {/* Custom Sort Dropdown */}
          <div className="relative group">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-48 appearance-none pl-5 pr-10 py-4 bg-gray-50/80 border border-gray-100 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low-High</option>
              <option value="price-high">Price: High-Low</option>
            </select>
            <ChevronDown className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2" size={12} />
          </div>

          {/* Price Slider */}
          <div className="px-5 py-3 bg-gray-50/80 border border-gray-100 rounded-xl md:rounded-[1.5rem] sm:w-48">
              <div className="flex justify-between mb-1">
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Budget</span>
                <span className="text-[8px] font-black text-black">৳{maxPrice}</span>
              </div>
              <input 
               type="range" min="0" max="10000" step="100"
               value={maxPrice}
               onChange={(e) => setMaxPrice(Number(e.target.value))}
               className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#EA638C]"
              />
          </div>

          {/* Search Input */}
          <div className="relative group sm:w-64">
            <Search className="absolute text-gray-400 -translate-y-1/2 left-5 top-1/2" size={14} />
            <input
              type="text"
              placeholder="SEARCH SHOWCASE..."
              value={searchQuery}
              className="w-full pl-12 pr-5 py-4 bg-gray-50/80 border border-gray-100 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white transition-all"
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(8); }}
            />
          </div>
        </div>
      </div>

      {/* --- GRID DESIGN --- */}
      {/* 💡 FIXED: grid-cols-2 for mobile compatibility */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-1 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4 md:px-0">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 md:py-40 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] md:rounded-[4rem] bg-gray-50/20 mx-2">
          <p className="text-[9px] md:text-[10px] font-black tracking-[0.3em] text-gray-300 uppercase">
            No Materials Found
          </p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="flex items-center justify-center w-full h-10 md:h-20">
        {visibleCount < processedProducts.length && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        )}
      </div>

      {/* BACK TO TOP BUTTON */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-24 md:bottom-10 right-6 md:right-10 z-[100] p-4 md:p-5 rounded-full bg-[#3E442B] text-white shadow-xl transition-all duration-700 ${
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
        } hover:bg-[#EA638C] active:scale-90`}
      >
        {/* FIXED: Removed the md:size prop which caused the build error */}
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}