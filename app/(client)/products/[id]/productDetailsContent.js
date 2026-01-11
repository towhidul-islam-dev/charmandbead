"use client";
import { useState } from "react";
import { Truck, ShieldCheck, RotateCcw, ShoppingCart } from "lucide-react";
import ProductPurchaseSection from "@/components/ProductPurchaseSection";

export default function ProductDetailsContent({ product }) {
  if (!product) return null;

  // Initialize gallery with all available images (main + variant images)
  const allImages = Array.from(new Set([
    ...(Array.isArray(product?.imageUrl) ? product.imageUrl : [product?.imageUrl]),
    ...(product?.variants?.map(v => v.image).filter(Boolean) || [])
  ])).filter(img => img !== "/placeholder.png");

  const [mainImage, setMainImage] = useState(allImages[0] || "/placeholder.png");

  const stockCount = product.stock || 0;
  const displayMoq = product.hasVariants 
    ? Math.min(...product.variants.map(v => v.minOrderQuantity || 1)) 
    : (product.minOrderQuantity || 1);

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

        {/* VARIANT THUMBNAILS GALLERY */}
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
          <FeatureItem icon={<Truck size={16} />} text="Shipping" color="blue" />
          <FeatureItem icon={<ShieldCheck size={16} />} text="Secure" color="brand" />
          <FeatureItem icon={<RotateCcw size={16} />} text="7-Days" color="orange" />
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILS */}
      <div className="space-y-8 lg:col-span-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
              stockCount > 0 ? "bg-gray-900 text-white" : "bg-red-100 text-red-600"
            }`}>
              {stockCount > 0 ? "In Stock" : "Out of Stock"}
            </span>

            {displayMoq > 1 && (
              <div className="flex items-center gap-1.5 text-[#EA638C] font-black text-[10px] uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-lg border border-pink-100">
                <ShoppingCart size={12} />
                <span>Min. Order From: {displayMoq} Units</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl italic font-black leading-tight tracking-tighter text-gray-900 uppercase md:text-5xl">
            {product.name}
          </h1>
        </div>

        <div className="p-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3">Description</span>
           <p className="font-medium leading-relaxed text-gray-600">{product.description}</p>
        </div>

        <div className={stockCount <= 0 ? "opacity-50 pointer-events-none" : ""}>
          <ProductPurchaseSection 
            product={product} 
            productSizes={product.hasVariants ? [...new Set(product.variants.map(v => v.size))] : ["Standard"]}
            isOutOfStock={stockCount <= 0}
            // This is the CRITICAL part: it updates the main image when the user interacts with variant rows
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