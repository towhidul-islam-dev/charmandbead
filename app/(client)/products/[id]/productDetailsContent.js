"use client";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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

const FALLBACK_IMAGE = "/placeholder.png";

// Helper function to filter out invalid or nullish image paths
const cleanImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "undefined" || trimmed.includes("null")) return null;
  return trimmed;
};

export default function ProductDetailsContent({ product }) {
  const router = useRouter();
  const { cart } = useCart();
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  // --- 📸 MASTER IMAGE LOGIC ---
  const allImages = useMemo(() => {
    if (!product) return [];
    const images = new Set();
    
    const mainImg = cleanImageUrl(product.imageUrl) || cleanImageUrl(product.image);
    if (mainImg) images.add(mainImg);

    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((g) => {
        const cleaned = cleanImageUrl(g);
        if (cleaned) images.add(cleaned);
      });
    }

    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        const vImg = cleanImageUrl(v.imageUrl) || cleanImageUrl(v.image);
        if (vImg) images.add(vImg);
      });
    }

    const result = Array.from(images);
    return result.length > 0 ? result : [FALLBACK_IMAGE];
  }, [product]);

  const [mainImage, setMainImage] = useState(
    allImages[0] || FALLBACK_IMAGE,
  );
  const [detailGalleryImage, setDetailGalleryImage] = useState(null);
  const [activeSku, setActiveSku] = useState(product?.sku || null);

  useEffect(() => {
    if (allImages.length > 0) setMainImage(allImages[0]);
    if (product?.gallery?.length > 0) {
      const validGalleryFirst = product.gallery.map(cleanImageUrl).find(Boolean);
      setDetailGalleryImage(validGalleryFirst || null);
    }
  }, [allImages, product?.gallery]);

  useEffect(() => {
    console.log("New product");
    console.log(product);
    setIsMounted(true);
  }, []);

  // --- RECENTLY VIEWED TRACKING ---
  useEffect(() => {
    if (product?._id) {
      const history = JSON.parse(
        localStorage.getItem("recentlyViewed") || "[]",
      );
      const filteredHistory = history.filter(
        (item) => item._id !== product._id,
      );
      const newHistory = [product, ...filteredHistory].slice(0, 10);
      localStorage.setItem("recentlyViewed", JSON.stringify(newHistory));
      window.dispatchEvent(new Event("recentlyViewedUpdated"));
    }
  }, [product?._id, product]);

  // --- 🔍 ENHANCED ZOOM LOGIC ---
  const handleMouseMove = (e) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

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
  const baseStockTotal = product?.hasVariants
    ? (product.variants || []).reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : Number(product?.stock) || 0;

  const inCartQtyTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      return item.productId === product?._id ? acc + item.quantity : acc;
    }, 0);
  }, [cart, product?._id]);

  const currentStock = Math.max(0, baseStockTotal - inCartQtyTotal);
  const displayMoq = product?.hasVariants && product.variants?.length
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
        <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
          <Image
            src={mainImage}
            fill
            className="object-contain rounded-lg"
            alt="Enlarged"
            onClick={(e) => e.stopPropagation()}
            unoptimized
            onError={() => setMainImage(FALLBACK_IMAGE)}
          />
        </div>
      </div>,
      document.body,
    );
  };

  if (!product) return null;

  return (
    <div className="grid items-start w-full max-w-full grid-cols-1 gap-6 p-4 overflow-x-hidden bg-white lg:grid-cols-12 xl:gap-16 md:p-8">
      <ModalPortal />

      {/* LEFT COLUMN: IMAGES */}
      <div className="space-y-4 lg:col-span-5">
        <div
          className="relative rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-2xl aspect-square cursor-none group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={() => setIsModalOpen(true)}
        >
          <Image
            src={mainImage}
            alt={product.name || "Product Image"}
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 40vw"
            onError={() => setMainImage(FALLBACK_IMAGE)}
          />
          <div
            className="absolute inset-0 z-30 transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100"
            style={{ ...zoomStyle, backgroundRepeat: "no-repeat" }}
          />
          <div className="absolute z-40 p-3 transition-all border border-gray-100 rounded-full shadow-lg opacity-0 pointer-events-none bottom-6 right-6 bg-white/90 backdrop-blur-sm group-hover:opacity-100">
            <MousePointer2 size={18} className="text-[#EA638C]" />
          </div>
        </div>

        {allImages.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 px-1 md:gap-3 md:justify-start">
            {allImages.map((img, idx) => {
              const matchingVariant = product.variants?.find(
                (v) => (cleanImageUrl(v.imageUrl) || cleanImageUrl(v.image)) === img,
              );
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setMainImage(img);
                    if (matchingVariant?.sku) setActiveSku(matchingVariant.sku);
                    else setActiveSku(product.sku);
                  }}
                  className={`relative w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all active:scale-90 ${
                    mainImage === img
                      ? "border-[#EA638C] scale-105 shadow-xl z-10"
                      : "border-gray-50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    fill
                    className="object-cover"
                    alt={`thumbnail-${idx}`}
                    sizes="80px"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  {matchingVariant && (
                    <div className="absolute top-0 right-0 p-1 bg-[#EA638C] rounded-bl-xl shadow-sm z-10">
                      <Check size={10} className="text-white stroke-[4]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {product.gallery && product.gallery.length > 0 && (
          <div className="p-5 bg-[#FBB6E6]/10 rounded-[2rem] border border-[#FBB6E6]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-white rounded-full shadow-sm">
                <Images size={14} className="text-[#EA638C]" />
              </div>
              <span className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.3em]">
                Detail Image Gallery
              </span>
            </div>
            <div
              className="relative w-full mb-3 overflow-hidden border-2 border-white shadow-sm aspect-video rounded-2xl cursor-none group/gallery"
              onMouseMove={(e) => {
                if (typeof window !== "undefined" && window.innerWidth < 768)
                  return;
                const { width, height } =
                  e.currentTarget.getBoundingClientRect();
                const x = (e.nativeEvent.offsetX / width) * 100;
                const y = (e.nativeEvent.offsetY / height) * 100;
                const activeGalleryImg =
                  detailGalleryImage ||
                  cleanImageUrl(product.gallery[0]) ||
                  FALLBACK_IMAGE;

                setZoomStyle({
                  display: "block",
                  backgroundPosition: `${x}% ${y}%`,
                  backgroundImage: `url(${activeGalleryImg})`,
                  backgroundSize: "250%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                });
              }}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={
                  detailGalleryImage ||
                  cleanImageUrl(product.gallery[0]) ||
                  FALLBACK_IMAGE
                }
                fill
                className="z-10 object-cover"
                alt="Gallery Active"
                sizes="(max-width: 1024px) 100vw, 40vw"
                onError={() => setDetailGalleryImage(FALLBACK_IMAGE)}
              />
              <div
                className="absolute inset-0 z-20 transition-opacity duration-200 opacity-0 pointer-events-none group-hover/gallery:opacity-100"
                style={{ ...zoomStyle, backgroundRepeat: "no-repeat" }}
              />
              <div className="absolute z-30 p-2 transition-all border border-gray-100 rounded-full shadow-lg opacity-0 pointer-events-none bottom-4 right-4 bg-white/90 backdrop-blur-sm group-hover/gallery:opacity-100">
                <MousePointer2 size={14} className="text-[#EA638C]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.gallery.map((url, idx) => {
                const cleanedUrl = cleanImageUrl(url) || FALLBACK_IMAGE;
                return (
                  <div
                    key={idx}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 shadow-sm cursor-pointer transition-all ${
                      detailGalleryImage === cleanedUrl
                        ? "border-[#EA638C]"
                        : "border-white"
                    }`}
                    onClick={() => setDetailGalleryImage(cleanedUrl)}
                  >
                    <Image
                      src={cleanedUrl}
                      fill
                      alt={`Detail ${idx}`}
                      className="object-cover"
                      sizes="150px"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-around p-4 border border-white bg-gray-50/80 rounded-[2rem] shadow-inner">
          <FeatureItem icon={<Truck size={16} />} text="Express" color="blue" />
          <FeatureItem
            icon={<ShieldCheck size={16} />}
            text="Genuine"
            color="brand"
          />
          <FeatureItem
            icon={<RotateCcw size={16} />}
            text="7-Day Return"
            color="orange"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILS */}
      <div className="space-y-6 md:space-y-8 lg:col-span-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-sm font-black text-[10px] uppercase tracking-widest ${
                isOutOfStock
                  ? "bg-red-500 text-white"
                  : isLowStock
                  ? "bg-orange-100 text-orange-600 border border-orange-200"
                  : "bg-gray-900 text-white"
              }`}
            >
              {!isOutOfStock && (
                <div
                  className={`w-2 h-2 rounded-full ${
                    isLowStock ? "bg-orange-600 animate-pulse" : "bg-green-400"
                  }`}
                />
              )}
              {isOutOfStock
                ? "Sold Out"
                : isLowStock
                ? `Hurry Up! ${currentStock} Left`
                : "In Stock"}
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

        {/* DESCRIPTION */}
        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] block mb-6">
            Product Essence
          </span>
          <div className="flex flex-col gap-y-4">
            {product.description
              ?.split("\r\n")
              .filter((p) => p.trim())
              .map((line, i) => {
                const parts = line.split(":");
                return (
                  <div
                    key={i}
                    className="text-base leading-relaxed text-gray-600 md:text-lg"
                  >
                    {parts.length > 1 ? (
                      <p>
                        <span className="mr-2 text-sm font-black text-gray-900 uppercase">
                          {parts[0].trim()} :
                        </span>
                        {parts.slice(1).join(":").trim()}
                      </p>
                    ) : (
                      <p className="font-semibold">{line.trim()}</p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <ProductPurchaseSection
          product={product}
          isOutOfStock={isOutOfStock}
          onVariantChange={(variantData) => {
            const cleanedVal = cleanImageUrl(variantData?.imageUrl);
            if (cleanedVal) setMainImage(cleanedVal);
            if (variantData?.sku) setActiveSku(variantData.sku);
          }}
        />

        {/* SHARE LINK */}
        <div className="p-5 border-2 border-dashed border-gray-100 bg-gray-50/30 rounded-[2rem] flex items-center gap-4">
          <div className="flex-1 min-w-0 px-2">
            <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest block mb-1">
              Share Treasure
            </span>
            <p className="font-mono text-xs text-gray-400 truncate">
              {isMounted ? window.location.href : "..."}
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              copied
                ? "bg-[#3E442B] text-white"
                : "bg-white text-[#EA638C] border border-gray-200 shadow-xl hover:translate-y-[-2px]"
            }`}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text, color }) {
  const colorMap = {
    blue: "text-blue-500",
    brand: "text-[#EA638C]",
    orange: "text-orange-500",
  };
  return (
    <div className="flex flex-col items-center gap-2 md:flex-row">
      <div
        className={`${colorMap[color]} bg-white p-1.5 rounded-full shadow-sm`}
      >
        {icon}
      </div>
      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
        {text}
      </span>
    </div>
  );
}