"use client";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
  Barcode,
  Check,
  Share2,
  X,
  MousePointer2,
  Images,
} from "lucide-react";
import ProductPurchaseSection from "@/components/ProductPurchaseSection";
import { useRouter } from "next/navigation";
import { useCart } from "@/Context/CartContext";
import toast from "react-hot-toast";

export default function ProductDetailsContent({ product }) {
  const router = useRouter();
  const { cart } = useCart();
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  // --- 📸 MASTER IMAGE LOGIC (Preserving your exact logic + Server Gallery) ---
  const allImages = useMemo(() => {
    if (!product) return [];
    const images = new Set();
    
    if (product.imageUrl) images.add(product.imageUrl);
    if (product.image) images.add(product.image);
    
    // Using "gallery" strictly from your server data
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach(img => {
        if (img && typeof img === 'string') images.add(img);
      });
    }
    
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(v => {
        const vImg = v.imageUrl || v.image;
        if (vImg && typeof vImg === 'string') images.add(vImg);
      });
    }

    return Array.from(images).filter(img => 
      img && img !== "/placeholder.png" && !img.includes("undefined")
    );
  }, [product]);

  const [mainImage, setMainImage] = useState(allImages[0] || "/placeholder.png");
  const [activeSku, setActiveSku] = useState(product?.sku || null);

  useEffect(() => {
    if (allImages.length > 0) {
      setMainImage(allImages[0]);
    }
  }, [allImages]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- RECENTLY VIEWED TRACKING ---
  useEffect(() => {
    if (product?._id) {
      const history = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const filteredHistory = history.filter((item) => item._id !== product._id);
      const newHistory = [product, ...filteredHistory].slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(newHistory));
      window.dispatchEvent(new Event("recentlyViewedUpdated"));
    }
  }, [product]);

  // --- ZOOM LOGIC ---
  const handleMouseMove = (e) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${mainImage})`,
      backgroundSize: "250%",
    });
  };

  const handleMouseLeave = () => setZoomStyle({ display: "none" });

  const handleCopyLink = () => {
    const shortlink = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(shortlink);
    setCopied(true);
    toast.success("Link copied!", {
      style: { borderRadius: "10px", background: "#3E442B", color: "#fff", fontSize: "12px" },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // --- STOCK & MOQ LOGIC (Original preserved) ---
  const baseStockTotal = product?.hasVariants
    ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : Number(product?.stock) || 0;

  const inCartQtyTotal = cart.reduce((acc, item) => {
    return item.productId === product?._id ? acc + item.quantity : acc;
  }, 0);

  const currentStock = Math.max(0, baseStockTotal - inCartQtyTotal);
  const displayMoq = product?.hasVariants
    ? Math.min(...product.variants.map((v) => v.minOrderQuantity || 1))
    : product?.minOrderQuantity || 1;

  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= displayMoq * 3;

  const ModalPortal = () => {
    if (!isMounted || !isModalOpen) return null;
    return createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-xl z-[999999] p-4 md:p-12 cursor-pointer"
        onClick={() => setIsModalOpen(false)}
      >
        <button className="absolute top-6 right-6 p-4 bg-[#EA638C] text-white rounded-full shadow-2xl transition-all hover:rotate-90">
          <X size={32} />
        </button>
        <img src={mainImage} className="object-contain max-w-full max-h-full rounded-lg shadow-2xl" alt="Enlarged" onClick={(e) => e.stopPropagation()} />
      </div>,
      document.body
    );
  };

  if (!product) return null;

  return (
    <div className="grid items-start w-full max-w-full grid-cols-1 gap-6 p-4 overflow-x-hidden bg-white lg:grid-cols-12 xl:gap-16 md:p-8">
      <ModalPortal />

      {/* LEFT COLUMN: IMAGES */}
      <div className="space-y-4 lg:col-span-5">
        <div
          className="relative rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-2xl aspect-square cursor-zoom-in group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={() => setIsModalOpen(true)}
        >
          <img src={mainImage} alt={product.name} className="object-cover w-full h-full transition-opacity duration-300" />
          <div className="absolute inset-0 transition-opacity duration-200 pointer-events-none" style={{ ...zoomStyle, backgroundRepeat: "no-repeat" }} />
          <div className="absolute p-3 transition-all border border-gray-100 rounded-full shadow-lg opacity-0 bottom-6 right-6 bg-white/90 backdrop-blur-sm group-hover:opacity-100">
              <MousePointer2 size={18} className="text-[#EA638C]" />
          </div>
        </div>

        {/* THUMBNAIL GRID (Original preserved) */}
        {allImages.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 px-1 md:gap-3 md:justify-start">
            {allImages.map((img, idx) => {
              const matchingVariant = product.variants?.find(v => (v.imageUrl || v.image) === img);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setMainImage(img);
                    if (matchingVariant?.sku) setActiveSku(matchingVariant.sku);
                    else setActiveSku(product.sku);
                  }}
                  className={`relative w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all active:scale-90 ${
                    mainImage === img ? "border-[#EA638C] scale-105 shadow-xl z-10" : "border-gray-50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="object-cover w-full h-full" alt="thumbnail" />
                  {matchingVariant && (
                    <div className="absolute top-0 right-0 p-1 bg-[#EA638C] rounded-bl-xl shadow-sm">
                      <Check size={10} className="text-white stroke-[4]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 🖼️ NEW: DETAIL GALLERY (Integrated under thumbnails) */}
        {product.gallery && product.gallery.length > 0 && (
          <div className="p-5 bg-[#FBB6E6]/10 rounded-[2rem] border border-[#FBB6E6]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-white rounded-full shadow-sm">
                <Images size={14} className="text-[#EA638C]" />
              </div>
              <span className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.3em]">Detail Gallery</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.gallery.map((url, idx) => (
                <div 
                  key={idx} 
                  className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:border-[#EA638C] transition-all"
                  onClick={() => setMainImage(url)}
                >
                  <img src={url} alt={`Detail ${idx}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURE ITEMS (Original preserved) */}
        <div className="flex items-center justify-around p-4 border border-white bg-gray-50/80 rounded-[2rem] shadow-inner">
          <FeatureItem icon={<Truck size={16} />} text="Express" color="blue" />
          <FeatureItem icon={<ShieldCheck size={16} />} text="Genuine" color="brand" />
          <FeatureItem icon={<RotateCcw size={16} />} text="7-Day Return" color="orange" />
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILS */}
      <div className="space-y-6 md:space-y-8 lg:col-span-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-sm font-black text-[10px] uppercase tracking-widest ${isOutOfStock ? "bg-red-500 text-white" : isLowStock ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-gray-900 text-white"}`}>
              {!isOutOfStock && <div className={`w-2 h-2 rounded-full ${isLowStock ? "bg-orange-600 animate-pulse" : "bg-green-400"}`} />}
              {isOutOfStock ? "Sold Out" : isLowStock ? `Hurry Up! ${currentStock} Left` : "In Stock"}
            </div>

            {displayMoq > 1 && (
              <div className="flex items-center gap-1.5 text-[#EA638C] font-black text-[10px] uppercase tracking-widest bg-pink-50 px-5 py-2 rounded-full border border-pink-100">
                <Zap size={12} className="fill-current" />
                <span>MOQ : {displayMoq} Units</span>
              </div>
            )}

            {activeSku && (
              <div className="flex items-center gap-1.5 text-[#3E442B] font-black text-[10px] uppercase tracking-widest bg-gray-50 px-5 py-2 rounded-full border border-gray-100">
                <Barcode size={12} />
                <span>SKU: {activeSku}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl italic font-black leading-[1.1] tracking-tighter text-gray-900 uppercase">
            {product.name}
          </h1>
        </div>

        {/* DESCRIPTION (Preserving your exact logic) */}
        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] block mb-6">Product Essence</span>
          <div className="flex flex-col gap-y-4">
            {product.description?.split(".").filter(p => p.trim()).map((point, i) => {
              const parts = point.split(":");
              return (
                <div key={i} className="text-base leading-relaxed text-gray-600 md:text-lg">
                  {parts.length > 1 ? (
                    <p><span className="mr-2 text-sm font-black text-gray-900 uppercase">{parts[0].trim()} :</span>{parts.slice(1).join(":").trim()}.</p>
                  ) : (
                    <p className="font-semibold">{point.trim()}.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SHARE LINK (Original preserved) */}
        <div className="p-5 border-2 border-dashed border-gray-100 bg-gray-50/30 rounded-[2rem] flex items-center gap-4">
          <div className="flex-1 min-w-0 px-2">
            <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest block mb-1">Share Treasure</span>
            <p className="font-mono text-xs text-gray-400 truncate">{isMounted ? window.location.href : "..."}</p>
          </div>
          <button onClick={handleCopyLink} className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${copied ? "bg-[#3E442B] text-white" : "bg-white text-[#EA638C] border border-gray-200 shadow-xl hover:translate-y-[-2px]"}`}>
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>

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
  );
}

function FeatureItem({ icon, text, color }) {
  const colorMap = { blue: "text-blue-500", brand: "text-[#EA638C]", orange: "text-orange-500" };
  return (
    <div className="flex flex-col items-center gap-2 md:flex-row">
      <div className={`${colorMap[color]} bg-white p-1.5 rounded-full shadow-sm`}>{icon}</div>
      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{text}</span>
    </div>
  );
}