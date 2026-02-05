"use client";
import { useState, useEffect } from "react";
import { Truck, ShieldCheck, RotateCcw, Zap, Barcode, Copy, Check, Share2 } from "lucide-react"; 
import ProductPurchaseSection from "@/components/ProductPurchaseSection";
import { useRouter } from "next/navigation";
import { useCart } from "@/Context/CartContext";
import toast from "react-hot-toast";

export default function ProductDetailsContent({ product }) {
  const router = useRouter();
  const { cart } = useCart(); 
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 🟢 Fixes Hydration Error

  // Handle Mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!product) return null;

  // --- RECENTLY VIEWED TRACKING LOGIC (Preserved) ---
  useEffect(() => {
  if (product && product._id) {
    const history = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const filteredHistory = history.filter((item) => item._id !== product._id);
    const newHistory = [product, ...filteredHistory].slice(0, 10);
    localStorage.setItem("recentlyViewed", JSON.stringify(newHistory));

    // 🟢 Trigger a custom event so other components know storage changed
    window.dispatchEvent(new Event("recentlyViewedUpdated"));
  }
}, [product]);

  // 1. Image logic (Preserved)
  const allImages = Array.from(new Set([
    ...(Array.isArray(product?.imageUrl) ? product.imageUrl : [product?.imageUrl]),
    ...(product?.variants?.map(v => v.imageUrl || v.image).filter(Boolean) || [])
  ])).filter(img => img !== "/placeholder.png");

  const [mainImage, setMainImage] = useState(allImages[0] || "/placeholder.png");
  const [activeSku, setActiveSku] = useState(product.sku || null);

  // 🟢 LOGIC: Copy Shortlink
  const handleCopyLink = () => {
    const shortlink = typeof window !== 'undefined' ? window.location.href : "";
    navigator.clipboard.writeText(shortlink);
    setCopied(true);
    
    toast.success("Link copied to clipboard!", {
      style: { borderRadius: '10px', background: '#3E442B', color: '#fff', fontSize: '12px' },
    });

    setTimeout(() => setCopied(false), 2000);
  };

  // 2. STOCK LOGIC (Preserved)
  const baseStockTotal = product.hasVariants 
    ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : (Number(product.stock) || 0);
  
  const inCartQtyTotal = cart.reduce((acc, item) => {
    return item.productId === product._id ? acc + item.quantity : acc;
  }, 0);

  const currentStock = Math.max(0, baseStockTotal - inCartQtyTotal);
  const displayMoq = product.hasVariants 
    ? Math.min(...product.variants.map(v => v.minOrderQuantity || 1)) 
    : (product.minOrderQuantity || 1);

  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= (displayMoq * 3);

  // 3. Keep data fresh (Preserved)
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="grid items-start grid-cols-1 gap-10 p-4 lg:grid-cols-12 xl:gap-16 md:p-8">
      
      {/* 🟢 SEO STRUCTURED DATA (Fixed Hydration) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": allImages,
            "description": product.description,
            "sku": activeSku || product._id,
            "offers": {
              "@type": "Offer",
              "url": isMounted ? window.location.href : "",
              "priceCurrency": "BDT",
              "price": product.price,
              "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              "priceValidUntil": "2026-12-31"
            }
          })
        }}
      />

      {/* LEFT COLUMN: IMAGES (Preserved) */}
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

        {/* DESCRIPTION & SHORTLINK (Fixed Hydration) */}
        <div className="space-y-4">
          <div className="p-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3">Product Description</span>
             <p className="font-medium leading-relaxed text-gray-600">{product.description}</p>
          </div>

          {/* Share Link Tool */}
          <div className="p-4 border border-dashed border-gray-200 bg-gray-50/50 rounded-[2rem] flex items-center gap-4">
            <div className="flex-1 px-2">
               <span className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest block mb-1">Direct Share Link</span>
               <p className="text-[11px] text-gray-400 font-mono truncate">
                 {/* 🟢 FIXED: Only render window.location.href after client-side mounting */}
                 {isMounted ? window.location.href : "..."}
               </p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300
                ${copied ? 'bg-[#3E442B] text-white' : 'bg-white text-[#EA638C] border border-gray-100 hover:shadow-md active:scale-95'}`}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* PURCHASE SECTION (Preserved) */}
        <div className="relative">
          <ProductPurchaseSection 
            product={product} 
            isOutOfStock={isOutOfStock}
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