"use client";
import { useState, useEffect } from "react";
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
  Expand,
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

  // --- ZOOM STATE LOGIC ---
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!product) return null;

  // --- RECENTLY VIEWED TRACKING ---
  useEffect(() => {
    if (product && product._id) {
      const history = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const filteredHistory = history.filter((item) => item._id !== product._id);
      const newHistory = [product, ...filteredHistory].slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(newHistory));
      window.dispatchEvent(new Event("recentlyViewedUpdated"));
    }
  }, [product]);

  // --- IMAGE AGGREGATION (Main + Gallery + Variant Images) ---
  const allImages = Array.from(
    new Set([
      ...(Array.isArray(product?.imageUrl) ? product.imageUrl : [product?.imageUrl]),
      ...(product?.gallery || []),
      ...(product?.variants?.map((v) => v.imageUrl || v.image).filter(Boolean) || []),
    ]),
  ).filter((img) => img && img !== "/placeholder.png");

  const [mainImage, setMainImage] = useState(allImages[0] || "/placeholder.png");
  const [activeSku, setActiveSku] = useState(product.sku || null);

  // Sync main image if the product ID changes (for navigation between products)
  useEffect(() => {
    if (allImages.length > 0) {
      setMainImage(allImages[0]);
    }
  }, [product?._id]);

  const handleCopyLink = () => {
    const shortlink = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(shortlink);
    setCopied(true);
    toast.success("Link copied to clipboard!", {
      style: {
        borderRadius: "10px",
        background: "#3E442B",
        color: "#fff",
        fontSize: "12px",
      },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // --- STOCK & MOQ LOGIC ---
  const baseStockTotal = product.hasVariants
    ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : Number(product.stock) || 0;

  const inCartQtyTotal = cart.reduce((acc, item) => {
    return item.productId === product._id ? acc + item.quantity : acc;
  }, 0);

  const currentStock = Math.max(0, baseStockTotal - inCartQtyTotal);
  const displayMoq = product.hasVariants
    ? Math.min(...product.variants.map((v) => v.minOrderQuantity || 1))
    : product.minOrderQuantity || 1;

  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= displayMoq * 3;

  // --- PORTAL MODAL FOR ENLARGED VIEW ---
  const ModalPortal = () => {
    if (!isMounted || !isModalOpen) return null;
    return createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center p-4 duration-200 cursor-pointer bg-black/95 backdrop-blur-xl md:p-12 animate-in fade-in"
        style={{ zIndex: 100000 }}
        onClick={() => setIsModalOpen(false)}
      >
        <button
          className="absolute top-6 right-6 p-4 bg-[#EA638C] text-white rounded-full transition-all shadow-2xl hover:rotate-90"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <X size={32} />
        </button>
        <img
          src={mainImage}
          className="object-contain max-w-full max-h-full duration-300 rounded-lg shadow-2xl animate-in zoom-in-95"
          alt="Enlarged"
          onClick={(e) => e.stopPropagation()}
        />
      </div>,
      document.body,
    );
  };

  return (
    <div className="grid items-start w-full max-w-full grid-cols-1 gap-6 p-4 overflow-x-hidden lg:grid-cols-12 xl:gap-16 md:p-8">
      <ModalPortal />

      {/* LEFT COLUMN: IMAGES & GALLERY */}
      <div className="space-y-6 lg:col-span-5">
        <div className="space-y-4">
          <div
            className="relative rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-2xl aspect-square cursor-zoom-in group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src={mainImage}
              alt={product.name}
              className="object-cover w-full h-full transition-opacity duration-300"
            />
            <div
              className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
              style={{ ...zoomStyle, backgroundRepeat: "no-repeat" }}
            />
            <div className="absolute p-3 transition-opacity border border-gray-100 shadow-sm opacity-0 bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl group-hover:opacity-100">
               <Expand size={20} className="text-[#EA638C]" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-0.5 opacity-60">
            <MousePointer2 size={10} className="text-[#EA638C]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
              Click to expand full view
            </span>
          </div>

          {/* DETAIL GALLERY (Including Variants) */}
          {allImages.length > 1 && (
            <div className="space-y-3">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                Product Gallery & Variants
              </span>
              <div className="flex flex-wrap justify-center gap-3 px-1 md:justify-start">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-[1.2rem] overflow-hidden border-2 transition-all group
                      ${mainImage === img 
                        ? "border-[#EA638C] ring-4 ring-pink-50 scale-105 shadow-lg" 
                        : "border-transparent bg-gray-50 hover:border-gray-200"}`}
                  >
                    <img src={img} className="object-cover w-full h-full" alt={`media-${idx}`} />
                    {mainImage !== img && (
                        <div className="absolute inset-0 bg-[#3E442B]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-around p-4 border border-white bg-gray-50/80 rounded-[2rem] shadow-inner">
          <FeatureItem icon={<Truck size={14} />} text="Fast Delivery" color="blue" />
          <FeatureItem icon={<ShieldCheck size={14} />} text="Secure" color="brand" />
          <FeatureItem icon={<RotateCcw size={14} />} text="7-Days" color="orange" />
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILS */}
      <div className="space-y-6 md:space-y-8 lg:col-span-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm
              ${isOutOfStock ? "bg-red-500 text-white" : isLowStock ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-gray-900 text-white"}`}>
              {!isOutOfStock && <div className={`w-1.5 h-1.5 rounded-full ${isLowStock ? "bg-orange-600 animate-pulse" : "bg-green-400"}`} />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isOutOfStock ? "Sold Out" : isLowStock ? `Only ${currentStock} Left` : "Available"}
              </span>
            </div>

            {displayMoq > 1 && (
              <div className="flex items-center gap-1.5 text-[#EA638C] font-black text-[10px] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">
                <Zap size={12} className="fill-current" />
                <span>MOQ: {displayMoq} Units</span>
              </div>
            )}

            {activeSku && (
              <div className="flex items-center gap-1.5 text-[#3E442B] font-black text-[10px] uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                <Barcode size={12} />
                <span>SKU: {activeSku}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl italic font-black leading-none tracking-tighter text-gray-900 uppercase md:text-6xl">
            {product.name}
          </h1>
        </div>

        <div className="space-y-4">
          {/* DESCRIPTION BLOCK */}
          <div className="p-7 md:p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-pink-50/50 blur-3xl" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-6 relative">
              Product Description
            </span>
            <div className="relative flex flex-col gap-y-4">
              {product.description.split(".").filter((p) => p.trim()).map((point, i) => {
                  const parts = point.split(":");
                  return (
                    <div key={i} className="leading-relaxed">
                      {parts.length > 1 ? (
                        <p className="text-sm text-gray-600 md:text-base">
                          <span className="font-extrabold text-[#3E442B] mr-1">{parts[0].trim()}:</span>
                          {parts.slice(1).join(":").trim()}.
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-gray-600 md:text-base">{point.trim()}.</p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* SHARE LINK */}
          <div className="p-4 border border-dashed border-gray-200 bg-gray-50/50 rounded-[2rem] flex items-center gap-4">
            <div className="flex-1 min-w-0 px-2">
              <span className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest block mb-1">Direct Share Link</span>
              <p className="text-[11px] text-gray-400 font-mono truncate">{isMounted ? window.location.href : "..."}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                ${copied ? "bg-[#3E442B] text-white" : "bg-white text-[#EA638C] border border-gray-100 hover:shadow-md active:scale-95"}`}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? "Copy" : "Share"}
            </button>
          </div>
        </div>

        {/* PURCHASE SECTION */}
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
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    brand: "text-[#EA638C] bg-pink-50",
    orange: "text-orange-600 bg-orange-50",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
      <span className="text-[9px] font-black text-gray-700 uppercase tracking-wider hidden sm:block">
        {text}
      </span>
    </div>
  );
}