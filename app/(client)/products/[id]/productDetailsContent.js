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

  // --- ZOOM STATE LOGIC (Preserved) ---
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  const handleMouseMove = (e) => {
    // Disable zoom overlay on mobile to prevent UI glitches during scroll
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
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

  // --- RECENTLY VIEWED TRACKING LOGIC (Preserved) ---
  useEffect(() => {
    if (product && product._id) {
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
  }, [product]);

  const allImages = Array.from(
    new Set([
      ...(Array.isArray(product?.imageUrl)
        ? product.imageUrl
        : [product?.imageUrl]),
      ...(product?.variants
        ?.map((v) => v.imageUrl || v.image)
        .filter(Boolean) || []),
    ]),
  ).filter((img) => img !== "/placeholder.png");

  const [mainImage, setMainImage] = useState(
    allImages[0] || "/placeholder.png",
  );
  const [activeSku, setActiveSku] = useState(product.sku || null);

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

  // --- STOCK & MOQ LOGIC (Preserved) ---
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

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [router]);

  // --- PORTAL MODAL (Fixes Visibility) ---
  const ModalPortal = () => {
    if (!isMounted || !isModalOpen) return null;
    return createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center p-4 cursor-pointer bg-black/95 backdrop-blur-xl md:p-12"
        style={{ zIndex: 100000 }}
        onClick={() => setIsModalOpen(false)}
      >
        <button
          className="absolute top-6 right-6 p-4 bg-[#3E442B] text-white rounded-full transition-all shadow-2xl"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <X size={32} />
        </button>
        <img
          src={mainImage}
          className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
          alt="Enlarged"
          onClick={(e) => e.stopPropagation()}
        />
      </div>,
      document.body,
    );
  };

  return (
    /* 🟢 MOBILE UI FIX: Added w-full max-w-full overflow-x-hidden */
    <div className="grid items-start w-full max-w-full grid-cols-1 gap-6 p-4 overflow-x-hidden lg:grid-cols-12 xl:gap-16 md:p-8">
      <ModalPortal />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: allImages,
            description: product.description,
            sku: activeSku || product._id,
            offers: {
              "@type": "Offer",
              url: isMounted ? window.location.href : "",
              priceCurrency: "BDT",
              price: product.price,
              availability: isOutOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
              priceValidUntil: "2026-12-31",
            },
          }),
        }}
      />

      {/* LEFT COLUMN: IMAGES */}
      <div className="space-y-4 lg:col-span-5">
        <div
          className="relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-xl aspect-square cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={() => setIsModalOpen(true)}
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
        </div>

        <div className="flex items-center justify-center gap-2 py-0.5 opacity-60">
          <MousePointer2 size={10} className="text-[#EA638C]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
            Double-click to expand
          </span>
        </div>

        {allImages.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 px-1 md:gap-3 md:justify-start">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all ${
                  mainImage === img
                    ? "border-[#EA638C] scale-105 shadow-md"
                    : "border-gray-100 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  className="object-cover w-full h-full"
                  alt="thumbnail"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-around p-3 border border-white bg-gray-50/80 rounded-3xl">
          <FeatureItem
            icon={<Truck size={14} />}
            text="Fast Delivery"
            color="blue"
          />
          <FeatureItem
            icon={<ShieldCheck size={14} />}
            text="Secure"
            color="brand"
          />
          <FeatureItem
            icon={<RotateCcw size={14} />}
            text="7-Days"
            color="orange"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: DETAILS */}
      <div className="space-y-6 md:space-y-8 lg:col-span-7">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-500 shadow-sm
              ${
                isOutOfStock
                  ? "bg-red-500 text-white"
                  : isLowStock
                    ? "bg-orange-100 text-orange-600 border border-orange-200 animate-pulse"
                    : "bg-gray-900 text-white"
              }`}
            >
              {!isOutOfStock && (
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isLowStock ? "bg-orange-600" : "bg-green-400"}`}
                />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isOutOfStock
                  ? "Sold Out"
                  : isLowStock
                    ? `Hurry! Only ${currentStock} units left`
                    : "In Stock"}
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

          <h1 className="text-3xl italic font-black leading-tight tracking-tighter text-gray-900 uppercase md:text-5xl">
            {product.name}
          </h1>
        </div>

        <div className="space-y-4">
          {/* 🟢 DESCRIPTION FIX: Every point separate line + Bold titles */}
          <div className="p-6 md:p-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">
              Product Description
            </span>

            <div className="flex flex-col gap-y-3">
              {product.description
                .split(".")
                .filter((p) => p.trim())
                .map((point, i) => {
                  const parts = point.split(":");
                  return (
                    <div key={i} className="leading-relaxed">
                      {parts.length > 1 ? (
                        <p className="text-sm text-gray-600 md:text-base">
                          {/* 🟢 Bold label with dark text for contrast */}
                          <span className="mr-1 font-extrabold text-gray-900">
                            {parts[0].trim()}:
                          </span>
                          {parts.slice(1).join(":").trim()}.
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-gray-600 md:text-base">
                          {point.trim()}.
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-4 border border-dashed border-gray-200 bg-gray-50/50 rounded-[2rem] flex items-center gap-4 overflow-hidden">
            <div className="flex-1 min-w-0 px-2">
              <span className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest block mb-1">
                Direct Share Link
              </span>
              <p className="text-[11px] text-gray-400 font-mono truncate">
                {isMounted ? window.location.href : "..."}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300
                ${copied ? "bg-[#3E442B] text-white" : "bg-white text-[#EA638C] border border-gray-100 hover:shadow-md active:scale-95"}`}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? "Copy" : "Copy Link"}
            </button>
          </div>
        </div>

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
    blue: "text-blue-600",
    brand: "text-[#EA638C]",
    orange: "text-orange-600",
  };
  return (
    <div className="flex items-center gap-2">
      <div className={colorMap[color]}>{icon}</div>
      <span className="text-[9px] font-black text-gray-700 uppercase tracking-wider">
        {text}
      </span>
    </div>
  );
}

