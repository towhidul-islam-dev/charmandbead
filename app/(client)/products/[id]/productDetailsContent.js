"use client";
import { useState, useEffect } from "react";
import { Truck, ShieldCheck, RotateCcw, Zap, Barcode } from "lucide-react"; 
import ProductPurchaseSection from "@/components/ProductPurchaseSection";
import { useRouter } from "next/navigation";
import { useCart } from "@/Context/CartContext";

export default function ProductDetailsContent({ product }) {
  const router = useRouter();
  const { cart } = useCart(); // 🟢 Pull cart to calculate true global stock

  if (!product) return null;

  // 1. Image logic
  const allImages = Array.from(new Set([
    ...(Array.isArray(product?.imageUrl) ? product.imageUrl : [product?.imageUrl]),
    ...(product?.variants?.map(v => v.imageUrl || v.image).filter(Boolean) || [])
  ])).filter(img => img !== "/placeholder.png");

  const [mainImage, setMainImage] = useState(allImages[0] || "/placeholder.png");
  const [activeSku, setActiveSku] = useState(product.sku || null);

  // 🟢 2. DYNAMIC STOCK CALCULATION
  // Calculate total stock minus what is currently in the cart
  const calculateLiveStock = () => {
    const baseStock = product.hasVariants 
      ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
      : (Number(product.stock) || 0);
    
    const inCartQty = cart.reduce((acc, item) => {
      return item.productId === product._id ? acc + item.quantity : acc;
    }, 0);

    return Math.max(0, baseStock - inCartQty);
  };

  const [currentStock, setCurrentStock] = useState(calculateLiveStock());

  // Update stock whenever the cart changes
  useEffect(() => {
    setCurrentStock(calculateLiveStock());
  }, [cart, product]);

  const displayMoq = product.hasVariants 
    ? Math.min(...product.variants.map(v => v.minOrderQuantity || 1)) 
    : (product.minOrderQuantity || 1);

  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= (displayMoq * 3);

  // 3. Keep data fresh from server
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
            
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-500 shadow-sm
              ${isOutOfStock ? 'bg-red-500 text-white' : 
                isLowStock ? 'bg-orange-100 text-orange-600 border border-orange-200 animate-pulse' : 
                'bg-gray-900 text-white'}`}>
              
              {!isOutOfStock && <div className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-orange-600' : 'bg-green-400'}`} />}
              
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isOutOfStock ? "Sold Out" : isLowStock ? `Hurry! Only ${currentStock} units left` : "In Stock"}
              </span>
            </div>

            {displayMoq > 1 && (
              <div className="flex items-center gap-1.5 text-[#EA638C] font-black text-[10px] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
                <Zap size={12} className="fill-current" />
                <span>Min. Order: {displayMoq} Units</span>
              </div>
            )}

            {activeSku && (
              <div className="flex items-center gap-1.5 text-[#3E442B] font-black text-[10px] uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                <Barcode size={12} />
                <span>SKU: {activeSku}</span>
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
        <div className="relative">
          <ProductPurchaseSection 
            product={product} 
            isOutOfStock={isOutOfStock}
            // 🟢 UPDATED: Parent updates its visual state when children interact
            onVariantChange={(variantData) => {
              if (variantData?.imageUrl) setMainImage(variantData.imageUrl);
              if (variantData?.sku) setActiveSku(variantData.sku);
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