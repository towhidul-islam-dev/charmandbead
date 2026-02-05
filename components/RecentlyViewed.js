"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState([]);

  const loadRecent = () => {
    const data = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    // Skip the first item (current product)
    setRecentProducts(data.slice(1, 5)); 
  };

  useEffect(() => {
    loadRecent(); // Initial load
    
    // 🟢 Listen for the update event from the ProductDetailsContent
    window.addEventListener("recentlyViewedUpdated", loadRecent);
    return () => window.removeEventListener("recentlyViewedUpdated", loadRecent);
  }, []);

  // Returns null if there are no OTHER products to show
  if (recentProducts.length === 0) return null;

  return (
    <section className="py-12 border-t border-gray-100 mt-16">
      {/* ... rest of your UI code ... */}
      <h2 className="text-[#3E442B] font-black italic uppercase mb-8">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {recentProducts.map((item) => (
            <ProductCard key={item._id} product={item} />
         ))}
      </div>
    </section>
  );
}