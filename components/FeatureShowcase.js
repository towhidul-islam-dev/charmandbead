"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Search, ChevronDown, ArrowUp } from "lucide-react";

export default function FeatureShowcase({ products }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(8); 
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const loadMoreRef = useRef(null);

  // Filter products based on Search (Name/Category) and Price
  const processedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesPrice;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [products, searchQuery, maxPrice, sortBy]);

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
    <div className="relative space-y-8">
      {/* Custom Slider Styling */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #EA638C;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(234, 99, 140, 0.3);
        }
      `}</style>

      {/* --- REFINED CONTROL BAR --- */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between pt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1 w-full">
          
          {/* Search Input */}
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={14} />
            <input
              type="text"
              placeholder="Search charms, beads, or materials..."
              value={searchQuery}
              className="w-full pl-10 pr-5 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest focus:outline-none focus:bg-white transition-all focus:border-[#FBB6E6]"
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(8); }}
            />
          </div>

          {/* Price Slider */}
          <div className="w-full sm:w-56 px-5 py-2 bg-gray-50 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1">
              <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Max Budget</span>
              <span className="text-[8px] font-black text-[#3E442B]">৳{maxPrice}</span>
            </div>
            <input 
              type="range" min="0" max="10000" step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#EA638C]"
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[160px]">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none px-5 py-3 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:border-[#EA638C] transition-colors"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </div>

      {/* --- GRID DESIGN --- */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-1 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4 md:px-0">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/20 mx-2">
          <p className="text-[9px] font-black tracking-[0.3em] text-gray-300 uppercase">
            No materials matching your filters
          </p>
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {visibleCount < processedProducts.length && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 bg-[#FBB6E6] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* BACK TO TOP */}
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