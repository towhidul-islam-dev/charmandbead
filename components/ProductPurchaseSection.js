"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Minus,
  Plus,
  TrendingDown,
  ShoppingBag,
  X,
  UserCheck,
  LogIn,
} from "lucide-react";
import { useCart } from "@/Context/CartContext";
import toast from "react-hot-toast";
import Image from "next/image";

// Helper to safely extract clean image strings across different data formats
const cleanImageUrl = (url) => {
  if (!url) return null;
  if (typeof url === "object") return url.imageUrl || url.image || url.url || null;
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "undefined" || trimmed.includes("null")) return null;
  return trimmed;
};

// Inline SVG Data URI fallback (No dependencies on /public/placeholder.png)
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23FBB6E61A'/><g fill='none' stroke='%23EA638C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='25' y='25' width='50' height='50' rx='8'/><line x1='25' y1='60' x2='40' y2='45'/><line x1='35' y1='50' x2='55' y2='30'/><line x1='50' y1='35' x2='75' y2='60'/><circle cx='60' cy='40' r='4'/></g></svg>";

export default function ProductPurchaseSection({ product, onVariantChange }) {
  const { addToCart, cart } = useCart();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const variants = product?.variants || [];

  // State for image zoom modal & Auth prompt modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Dynamic Data Path for tiers
  const tiers = useMemo(() => {
    const rawTiers = product?.pricingTiers || product?._doc?.pricingTiers || [];

    if (rawTiers.length === 0) return [];

    const sorted = [...rawTiers].sort((a, b) => a.minQuantity - b.minQuantity);
    const basePrice = Number(product?.price) || Number(variants[0]?.price) || 0;

    if (sorted[0].minQuantity > 1) {
      return [{ minQuantity: 1, unitPrice: basePrice }, ...sorted];
    }

    return sorted;
  }, [product, variants]);

  const lastProductId = useRef(product?._id);
  const [quantities, setQuantities] = useState({});

  // Helper to reliably extract Variant ID across cart structures
  const getQtyInBag = (vId) => {
    if (!vId) return 0;
    const targetId = vId.toString();

    const matchingItems = cart?.filter((item) => {
      const itemVariantId =
        item.variantId?.toString() ||
        item.variant?._id?.toString() ||
        item._id?.toString();
      const itemProductId = item.productId?.toString() || item._id?.toString();

      return (
        itemVariantId === targetId ||
        (itemProductId === product?._id?.toString() &&
          itemVariantId === targetId)
      );
    });

    return (
      matchingItems?.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      ) || 0
    );
  };

  // Reset local input selections on Product Change
  useEffect(() => {
    if (lastProductId.current !== product?._id) {
      const initialQtys = {};
      variants.forEach((v, index) => {
        const vKey = v._id?.toString() || `v-${index}`;
        initialQtys[vKey] = 0;
      });
      setQuantities(initialQtys);
      lastProductId.current = product?._id;
    }
  }, [product?._id, variants]);

  // CALCULATE TOTALS
  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);
  const nextTier = tiers.find((tier) => totalSelected < tier.minQuantity);

  // DYNAMIC PRICE RESOLUTION
  const getEffectiveUnitPrice = (variant) => {
    const basePrice = Number(variant?.price) || Number(product?.price) || 0;
    const activeTier = [...tiers]
      .reverse()
      .find((tier) => totalSelected >= tier.minQuantity);

    return activeTier ? Number(activeTier.unitPrice) : basePrice;
  };

  // TOTAL PRICE CALCULATION
  const totalPrice = useMemo(() => {
    return variants.reduce((sum, v) => {
      const vKey = v._id?.toString();
      const qty = quantities[vKey] || 0;
      if (qty <= 0) return sum;
      return sum + qty * getEffectiveUnitPrice(v);
    }, 0);
  }, [quantities, variants, tiers, totalSelected]);

  // CURRENT ACTIVE UNIT PRICE FOR HEADER
  const currentActiveUnitPrice = useMemo(() => {
    const activeTier = [...tiers]
      .reverse()
      .find((tier) => totalSelected >= tier.minQuantity);
    return activeTier
      ? activeTier.unitPrice
      : tiers[0]?.unitPrice || product?.price || variants[0]?.price || 0;
  }, [tiers, totalSelected, product, variants]);

  // FIXED QUANTITY UPDATE HANDLER
  const handleUpdateQty = (vKey, direction, moqVal, stockVal, variant) => {
    const moq = Number(moqVal) || 1;
    const stock = Number(stockVal) || 0;
    const currentSelection = quantities[vKey] || 0;
    const inBagQty = getQtyInBag(variant._id);

    const actuallyAvailable = Math.max(0, stock - inBagQty);

    let newQty;
    if (direction > 0) {
      newQty = currentSelection === 0 ? moq : currentSelection + moq;
    } else {
      newQty = currentSelection <= moq ? 0 : currentSelection - moq;
    }

    if (newQty > actuallyAvailable) {
      toast.error(
        `Cannot exceed ${actuallyAvailable} available units (In bag: ${inBagQty})`,
        {
          style: {
            border: `1px solid #EA638C`,
            color: "#3E442B",
            fontWeight: "bold",
          },
        },
      );
      return;
    }

    const updatedQuantities = { ...quantities, [vKey]: newQty };
    const newTotalSelected = Object.values(updatedQuantities).reduce(
      (a, b) => a + b,
      0,
    );

    setQuantities(updatedQuantities);

    if (onVariantChange) {
      onVariantChange(variant, newTotalSelected);
    }
  };

  // BULK ADD HANDLER (WITH AUTH INTERCEPTION)
  const handleBulkAdd = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const itemsToProcess = variants.filter((v) => {
      const vKey = v._id?.toString();
      return quantities[vKey] > 0;
    });

    if (itemsToProcess.length === 0) return;

    itemsToProcess.forEach((v) => {
      const vKey = v._id?.toString();
      const qtyToAdd = quantities[vKey];

      let variantName = "";
      if (v.color || v.size) {
        variantName = `${v.color || ""} ${v.size || ""}`.trim();
      } else if (v.sku) {
        variantName = `SKU: ${v.sku}`;
      } else {
        variantName = "Standard Variant";
      }

      const itemImage =
        cleanImageUrl(v.imageUrl) ||
        cleanImageUrl(v.image) ||
        cleanImageUrl(product.imageUrl) ||
        FALLBACK_IMAGE;

      addToCart(
        {
          productId: product._id?.toString(),
          variantId: vKey,
          name: product.name,
          variantName: variantName,
          sku: v.sku || "",
          color: v.color || "",
          size: v.size || "",
          price: getEffectiveUnitPrice(v),
          imageUrl: itemImage,
          stock: v.stock,
          minOrderQuantity: Number(v.minOrderQuantity) || 1,
        },
        v,
        qtyToAdd,
      );
    });

    toast.success("Bag Updated", {
      style: {
        background: "#3E442B",
        color: "#fff",
        fontWeight: "900",
        borderRadius: "1rem",
      },
    });

    const resetQtys = {};
    variants.forEach((v, index) => {
      const vKey = v._id?.toString() || `v-${index}`;
      resetQtys[vKey] = 0;
    });
    setQuantities(resetQtys);

    if (onVariantChange) onVariantChange(null, 0);
  };

  return (
    <div className="flex flex-col w-full max-w-full gap-6 mt-10">
      {/* BULK SAVINGS CONTAINER */}
      {tiers.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 shadow-sm duration-700 animate-in fade-in slide-in-from-top-4 w-full">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="p-2.5 bg-[#3E442B] rounded-2xl shrink-0">
              <TrendingDown className="w-4 h-4 text-[#FBB6E6]" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]">
                Bulk Savings
              </h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase">
                Current Rate:{" "}
                <span className="text-[#EA638C] font-black">
                  ৳{currentActiveUnitPrice} / Unit
                </span>
              </p>
            </div>
          </div>

          <div
            className="grid w-full overflow-hidden border border-gray-100 bg-gray-50/50 rounded-[2rem]"
            style={{
              gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))`,
            }}
          >
            {tiers.map((tier, i) => {
              const isAchieved = totalSelected >= tier.minQuantity;
              const nextTierItem = tiers[i + 1];

              const rangeText = nextTierItem
                ? `${tier.minQuantity} - ${nextTierItem.minQuantity - 1}`
                : `${tier.minQuantity}+`;

              return (
                <div
                  key={i}
                  className={`p-5 flex flex-col items-center justify-center text-center transition-all duration-500 w-full ${
                    i !== 0 ? "border-l border-gray-100" : ""
                  } ${
                    isAchieved
                      ? "bg-[#EA638C] text-white shadow-sm"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <span
                    className={`text-[9px] font-black uppercase mb-1 ${
                      isAchieved ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    {rangeText} PCS
                  </span>
                  <span
                    className={`text-xl font-black ${
                      isAchieved ? "text-white" : "text-[#EA638C]"
                    }`}
                  >
                    ৳{tier.unitPrice}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VARIANT TABLE (DESKTOP) */}
      <div className="hidden md:block overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Variant</th>
              <th className="px-6 py-5 text-center">Stock</th>
              <th className="px-6 py-5 text-right">Qty (Step: MOQ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variants.map((v, idx) => (
              <VariantRow
                key={v._id?.toString() || `row-${idx}`}
                v={v}
                inBagQty={getQtyInBag(v._id)}
                selectionQty={quantities[v._id?.toString()] || 0}
                handleUpdateQty={handleUpdateQty}
                onImageClick={(img) => setSelectedImage(img)}
                getEffectiveUnitPrice={getEffectiveUnitPrice}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* VARIANT CARDS (MOBILE) */}
      <div className="flex flex-col gap-4 md:hidden">
        {variants.map((v, idx) => (
          <VariantCard
            key={v._id?.toString() || `card-${idx}`}
            v={v}
            inBagQty={getQtyInBag(v._id)}
            selectionQty={quantities[v._id?.toString()] || 0}
            handleUpdateQty={handleUpdateQty}
            onImageClick={(img) => setSelectedImage(img)}
            getEffectiveUnitPrice={getEffectiveUnitPrice}
          />
        ))}
      </div>

      {/* DYNAMIC PROGRESS NOTIFICATION */}
      {totalSelected > 0 && nextTier && (
        <div className="mx-1 p-4 bg-white border border-[#FBB6E6] rounded-[1.5rem] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown size={14} className="text-[#EA638C] shrink-0" />
              <span className="text-[10px] font-black text-[#3E442B] uppercase tracking-tighter">
                Add{" "}
                <span className="text-[#EA638C]">
                  {nextTier.minQuantity - totalSelected} more
                </span>{" "}
                to unlock ৳{nextTier.unitPrice} rate!
              </span>
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
              {Math.round((totalSelected / nextTier.minQuantity) * 100)}% to
              Goal
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EA638C] transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(
                  100,
                  (totalSelected / nextTier.minQuantity) * 100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* STICKY FOOTER */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between p-2.5 sm:p-4 bg-[#3E442B] rounded-[2rem] sm:rounded-[3rem] shadow-2xl mx-1 border border-white/10 gap-2 backdrop-blur-md w-full max-w-full box-border">
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/10 border border-white/15 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl sm:rounded-[1.5rem] backdrop-blur-sm shrink min-w-0">
          <span className="text-[#FBB6E6] text-base sm:text-[22px] font-black italic tracking-tighter truncate">
            ৳{totalPrice.toLocaleString()}
          </span>

          <div className="w-[1px] h-3.5 sm:h-5 bg-white/20 shrink-0" />

          <span className="bg-[#EA638C] text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 whitespace-nowrap">
            {totalSelected} {totalSelected === 1 ? "Item" : "Items"}
          </span>
        </div>

        <button
          onClick={handleBulkAdd}
          disabled={totalSelected === 0}
          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#EA638C] text-white px-3 sm:px-8 py-2.5 sm:py-4 rounded-full font-black text-[9px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-[#EA638C]/20 shrink-0 whitespace-nowrap"
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
          <span>Confirm & Add</span>
        </button>
      </div>

      {/* AUTHENTICATION REQUIRED POPUP MODAL */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative bg-white p-6 sm:p-7 rounded-[2.5rem] shadow-2xl max-w-sm w-full flex flex-col items-center text-center border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-[#EA638C] hover:text-white text-[#3E442B] p-2 rounded-full transition-all"
            >
              <X size={16} strokeWidth={3} />
            </button>

            {/* Icon Header */}
            <div className="w-14 h-14 bg-[#FBB6E6]/40 text-[#EA638C] rounded-full flex items-center justify-center mb-3 border-2 border-[#FBB6E6]">
              <UserCheck size={28} strokeWidth={2.5} />
            </div>

            {/* Content */}
            <h3 className="text-base font-black uppercase text-[#3E442B] tracking-tight mb-1.5">
              Sign In First
            </h3>
            <p className="mb-5 text-xs font-bold leading-relaxed text-gray-500">
              Please login or Create an account first to add product in the cart.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => router.push("/login")}
                className="w-full flex items-center justify-center gap-2 bg-[#EA638C] hover:bg-[#d8527a] text-white py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
              >
                <LogIn size={15} strokeWidth={2.5} />
                <span>Login / Register</span>
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#3E442B] transition-colors tracking-widest"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOUCH-ENABLED IMAGE POPUP MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white p-2 rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col items-center border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-30 bg-[#EA638C] text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white"
            >
              <X size={18} strokeWidth={3} />
            </button>

            {/* Touch & Mouse Pan/Zoom Container */}
            <div className="relative w-full h-[60vh] sm:h-[65vh] rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center">
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
              >
                {() => (
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={selectedImage}
                        alt="Variant Preview"
                        fill
                        className="object-contain select-none"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </TransformComponent>
                )}
              </TransformWrapper>
            </div>

            {/* Mobile Hint */}
            <p className="text-[9px] font-black uppercase tracking-widest text-[#3E442B] opacity-60 mt-2 mb-1">
              Pinch, scroll, or double-tap to zoom
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Sub-components --- */

function VariantRow({
  v,
  inBagQty,
  selectionQty,
  handleUpdateQty,
  onImageClick,
  getEffectiveUnitPrice,
}) {
  const liveDisplayStock = Math.max(0, v.stock - inBagQty - selectionQty);
  const imgUrl = cleanImageUrl(v.image) || cleanImageUrl(v.imageUrl) || FALLBACK_IMAGE;
  const unitPrice = getEffectiveUnitPrice
    ? getEffectiveUnitPrice(v)
    : Number(v.price) || 0;

  return (
    <tr className="transition-colors hover:bg-gray-50/30">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onImageClick(imgUrl)}
            className="relative flex-shrink-0 w-12 h-12 overflow-hidden transition-all border border-gray-100 shadow-sm cursor-pointer rounded-xl bg-gray-50 hover:scale-105 active:scale-95 group"
          >
            <Image
              src={imgUrl}
              alt={v.color || "Product variant"}
              fill
              unoptimized
              className="object-cover group-hover:opacity-90"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </button>
          <div>
            <span className="font-black text-[#3E442B] uppercase text-[12px] block leading-none mb-1">
              {v.color}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                {v.size} (MOQ: {v.minOrderQuantity || 1})
              </span>
              <span className="text-[10px] font-black text-[#EA638C]">
                ৳{unitPrice}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center">
          <span
            className={`font-black text-[15px] italic ${
              liveDisplayStock < (v.minOrderQuantity || 1) * 2
                ? "text-[#EA638C]"
                : "text-[#3E442B]"
            }`}
          >
            {liveDisplayStock}
          </span>
          {inBagQty > 0 && (
            <div className="mt-1 px-2 py-0.5 bg-[#FBB6E6] text-[#EA638C] text-[7px] font-black rounded-full">
              {inBagQty} IN BAG
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <QtySelector
          v={v}
          selectionQty={selectionQty}
          liveDisplayStock={liveDisplayStock}
          handleUpdateQty={handleUpdateQty}
        />
      </td>
    </tr>
  );
}

function VariantCard({
  v,
  inBagQty,
  selectionQty,
  handleUpdateQty,
  onImageClick,
  getEffectiveUnitPrice,
}) {
  const liveDisplayStock = Math.max(0, v.stock - inBagQty - selectionQty);
  const imgUrl = cleanImageUrl(v.image) || cleanImageUrl(v.imageUrl) || FALLBACK_IMAGE;
  const unitPrice = getEffectiveUnitPrice
    ? getEffectiveUnitPrice(v)
    : Number(v.price) || 0;

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm flex items-center justify-between gap-3 active:border-[#FBB6E6] transition-all">
      <div className="flex items-center min-w-0 gap-4">
        <button
          type="button"
          onClick={() => onImageClick(imgUrl)}
          className="relative flex-shrink-0 overflow-hidden transition-all border border-gray-100 shadow-sm cursor-pointer w-14 h-14 rounded-2xl bg-gray-50 hover:scale-105 active:scale-95 group"
        >
          <Image
            src={imgUrl}
            alt={v.color || "Product variant"}
            fill
            unoptimized
            className="object-cover group-hover:opacity-90"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1 pr-1">
            <span className="font-black text-[#3E442B] uppercase text-[14px] truncate leading-none">
              {v.color}
            </span>
            <span className="text-[12px] font-black text-[#EA638C] italic shrink-0">
              ৳{unitPrice}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">
            {v.size} • MOQ: {v.minOrderQuantity || 1}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-[10px] font-black ${
                liveDisplayStock < (v.minOrderQuantity || 1) * 2
                  ? "text-[#EA638C]"
                  : "text-gray-400"
              }`}
            >
              {liveDisplayStock} AVAILABLE
            </span>
            {inBagQty > 0 && (
              <span className="px-1.5 py-0.5 bg-[#FBB6E6] text-[#EA638C] text-[7px] font-black rounded-full">
                {inBagQty} IN BAG
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <QtySelector
          v={v}
          selectionQty={selectionQty}
          liveDisplayStock={liveDisplayStock}
          handleUpdateQty={handleUpdateQty}
        />
      </div>
    </div>
  );
}

function QtySelector({ v, selectionQty, liveDisplayStock, handleUpdateQty }) {
  const vKey = v._id?.toString();
  const moq = Number(v.minOrderQuantity) || 1;

  return (
    <div className="inline-flex items-center p-1 border border-gray-200 bg-gray-50 rounded-2xl">
      <button
        onClick={() => handleUpdateQty(vKey, -1, moq, v.stock, v)}
        className="p-2 text-[#3E442B]/30 hover:text-[#EA638C] disabled:opacity-20 transition-colors"
        disabled={selectionQty === 0}
      >
        <Minus size={16} strokeWidth={4} />
      </button>
      <span
        className={`px-4 font-black min-w-[40px] text-center text-[15px] italic ${
          selectionQty > 0 ? "text-[#EA638C]" : "text-gray-300"
        }`}
      >
        {selectionQty}
      </span>
      <button
        onClick={() => handleUpdateQty(vKey, 1, moq, v.stock, v)}
        className="p-2 text-[#3E442B]/30 hover:text-[#EA638C] disabled:opacity-20 transition-colors"
        disabled={liveDisplayStock < moq}
      >
        <Plus size={16} strokeWidth={4} />
      </button>
    </div>
  );
}