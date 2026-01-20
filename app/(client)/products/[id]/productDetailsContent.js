"use client";
import { useState, useEffect } from "react";
import { Truck, ShieldCheck, RotateCcw, Zap } from "lucide-react";
import ProductPurchaseSection from "@/components/ProductPurchaseSection";
import { useRouter } from "next/navigation";

export default function ProductDetailsContent({ product }) {
  const router = useRouter();

  if (!product) return null;

  // 1. Image logic
  const allImages = Array.from(new Set([
    ...(Array.isArray(product?.imageUrl) ? product.imageUrl : [product?.imageUrl]),
    ...(product?.variants?.map(v => v.imageUrl || v.image).filter(Boolean) || [])
  ])).filter(img => img !== "/placeholder.png");

  const [mainImage, setMainImage] = useState(allImages[0] || "/placeholder.png");

  // 2. REFINED STOCK LOGIC
  // We only count a product as "In Stock" if there's at least one variant 
  // whose current stock is greater than or equal to its Minimum Order Quantity (MOQ).
  const sellableVariants = product.variants?.filter(v => 
    (v.stock || 0) >= (v.minOrderQuantity || product.minOrderQuantity || 1)
  ) || [];

  const stockCount = product.hasVariants 
    ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : (Number(product.stock) || 0);

  const displayMoq = product.hasVariants 
    ? Math.min(...product.variants.map(v => v.minOrderQuantity || 1)) 
    : (product.minOrderQuantity || 1);

  const isOutOfStock = sellableVariants.length === 0;
  const isLowStock = !isOutOfStock && stockCount <= (displayMoq * 3);

  // 3. Keep data fresh (Updates badges if stock is sold out by others)
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="grid items-start grid-cols-1 gap-10 p-4 lg:grid-cols-12 xl:gap-16 md:p-8">
      {/* LEFT COLUMN: IMAGES */}
      <div className="space-y-6 lg:col-span-5">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-xl aspect-square">
          <img 
            src={mainImage} 
            alt={product.name} 
            className="object-cover w-full h-full transition-opacity duration-300" 
          />
        </div>

        {allImages.length > 1 && (
          <div className="flex flex-wrap gap-3 px-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                  mainImage === img ? "border-[#EA638C] scale-110 shadow-md" : "border-gray-100 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} className="object-cover w-full h-full" alt="thumbnail" />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-around p-4 border border-white bg-gray-50/80 rounded-3xl">
          <FeatureItem icon={<Truck size={16} />} text="Fast Delivery" color="blue" />
          <FeatureItem icon={<ShieldCheck size={16} />} text="Secure" color="brand" />
          <FeatureItem icon={<RotateCcw size={16} />} text="7-Days" color="orange" />
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILS */}
      <div className="space-y-8 lg:col-span-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 🟢 DYNAMIC STOCK STATUS BADGE */}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-500 shadow-sm
              ${isOutOfStock ? 'bg-red-500 text-white' : 
                isLowStock ? 'bg-orange-100 text-orange-600 border border-orange-200 animate-pulse' : 
                'bg-gray-900 text-white'}`}>
              
              {!isOutOfStock && <div className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-orange-600' : 'bg-green-400'}`} />}
              
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isOutOfStock ? "Sold Out - Get Notified Below" : isLowStock ? `Hurry! Only ${stockCount} units left` : "In Stock"}
              </span>
            </div>

            {/* 🟢 WHOLESALE MOQ BADGE */}
            {displayMoq > 1 && (
              <div className="flex items-center gap-1.5 text-[#EA638C] font-black text-[10px] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
                <Zap size={12} className="fill-current" />
                <span>Min. Order: {displayMoq} Units</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl italic font-black leading-tight tracking-tighter text-gray-900 uppercase md:text-5xl">
            {product.name}
          </h1>
        </div>

        <div className="p-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3">Product Description</span>
           <p className="font-medium leading-relaxed text-gray-600">{product.description}</p>
        </div>

        {/* PURCHASE SECTION */}
        {/* We no longer lock the whole section if out of stock, 
            so users can still use the "Notify Me" buttons inside the table. */}
        <div className="relative">
          <ProductPurchaseSection 
            product={product} 
            isOutOfStock={isOutOfStock}
            onVariantChange={(imageUrl) => {
              if (imageUrl) setMainImage(imageUrl);
            }} 
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text, color }) {
  const colorMap = { blue: "text-blue-600", brand: "text-[#EA638C]", orange: "text-orange-600" };
  return (
    <div className="flex items-center gap-2">
      <div className={colorMap[color]}>{icon}</div>
      <span className="text-[9px] font-black text-gray-700 uppercase tracking-wider">{text}</span>
    </div>
  );
}