"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Minus,
  Plus,
  Package,
  TrendingDown,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCart } from "@/Context/CartContext";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ProductPurchaseSection({ product, onVariantChange }) {
  const { addToCart, cart } = useCart();
  const variants = product?.variants || [];

  // State for image zoom modal
  const [selectedImage, setSelectedImage] = useState(null);

  // 🟢 Fixed Data Path for tiers
  const tiers = useMemo(() => {
    const rawTiers =
      product?.pricingTiers || product?._doc?.pricingTiers || [];
    return [...rawTiers].sort((a, b) => a.minQuantity - b.minQuantity);
  }, [product]);

  const lastProductId = useRef(product?._id);
  const [quantities, setQuantities] = useState({});

  // 🟢 Helper to reliably extract Variant ID across different cart structures
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
        (itemProductId === product?._id?.toString() && itemVariantId === targetId)
      );
    });

    return matchingItems?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
  };

  // 🟢 Reset local input selections on Product Change
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

  // --- 🟢 CALCULATE TOTALS ---
  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);

  const nextTier = tiers.find((tier) => totalSelected < tier.minQuantity);

  // --- 🟢 DYNAMIC PRICE RESOLUTION ---
  const getEffectiveUnitPrice = (variant) => {
    const basePrice = Number(variant?.price) || Number(product?.price) || 0;

    const activeTier = [...tiers]
      .reverse()
      .find((tier) => totalSelected >= tier.minQuantity);

    return activeTier ? Number(activeTier.unitPrice) : basePrice;
  };

  // --- 🟢 TOTAL PRICE CALCULATION ---
  const totalPrice = useMemo(() => {
    return variants.reduce((sum, v) => {
      const vKey = v._id?.toString();
      const qty = quantities[vKey] || 0;
      if (qty <= 0) return sum;
      return sum + qty * getEffectiveUnitPrice(v);
    }, 0);
  }, [quantities, variants, tiers, totalSelected]);

  // --- 🟢 FIXED QUANTITY UPDATE HANDLER ---
  const handleUpdateQty = (vKey, direction, moqVal, stockVal, variant) => {
    const moq = Number(moqVal) || 1;
    const stock = Number(stockVal) || 0;
    const currentSelection = quantities[vKey] || 0;
    const inBagQty = getQtyInBag(variant._id);
    
    // Remaining available stock taking current bag items into account
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
        }
      );
      return;
    }

    const updatedQuantities = { ...quantities, [vKey]: newQty };
    const newTotalSelected = Object.values(updatedQuantities).reduce(
      (a, b) => a + b,
      0
    );

    setQuantities(updatedQuantities);

    if (onVariantChange) {
      onVariantChange(variant, newTotalSelected);
    }
  };

  // --- 🟢 BULK ADD HANDLER ---
  const handleBulkAdd = () => {
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
        v.imageUrl || v.image || product.imageUrl || "/placeholder.png";

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
        qtyToAdd
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

    // Clear local quantities after adding to bag
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
      {/* WHOLESALE TIER TABLE */}
      {tiers.length > 0 && (
        <div className="mb-4 duration-700 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 px-2 mb-4">
            <div className="p-2 bg-[#3E442B] rounded-xl shrink-0">
              <Package className="w-4 h-4 text-[#FBB6E6]" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]">
                Bulk Savings Tiers
              </h3>
              <p className="text-[8px] font-bold text-gray-400 uppercase">
                Combined variant quantities apply
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiers.map((tier, i) => {
              const isAchieved = totalSelected >= tier.minQuantity;
              return (
                <div
                  key={i}
                  className={`border rounded-[1.5rem] p-4 shadow-sm flex flex-col items-center justify-center text-center transition-all duration-500 ${
                    isAchieved
                      ? "bg-[#EA638C] border-[#EA638C] scale-105 shadow-md"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <span
                    className={`text-[9px] font-black uppercase mb-1 ${
                      isAchieved ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {tier.minQuantity}+ Pcs
                  </span>
                  <span
                    className={`text-lg font-black ${
                      isAchieved ? "text-white" : "text-[#EA638C]"
                    }`}
                  >
                    ৳{tier.unitPrice}
                  </span>
                  <div
                    className={`mt-1 px-2 py-0.5 text-[7px] font-black rounded-full uppercase ${
                      isAchieved
                        ? "bg-white text-[#EA638C]"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {isAchieved
                      ? "Tier Active"
                      : `Save ৳${
                          (product.price || variants[0]?.price || 0) -
                          tier.unitPrice
                        }`}
                  </div>
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
              {Math.round((totalSelected / nextTier.minQuantity) * 100)}% to Goal
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EA638C] transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(
                  100,
                  (totalSelected / nextTier.minQuantity) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* STICKY FOOTER */}
      <div className="sticky bottom-4 z-20 flex flex-row items-center justify-between p-3.5 sm:p-5 bg-[#3E442B] rounded-[2rem] sm:rounded-[3rem] shadow-2xl mx-1 border border-white/10 gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3 bg-white/10 border border-white/15 px-4 py-2 sm:py-2.5 rounded-2xl sm:rounded-[1.5rem] backdrop-blur-sm">
          <span className="text-[#FBB6E6] text-lg sm:text-[22px] font-black italic tracking-tighter">
            ৳{totalPrice.toLocaleString()}
          </span>

          <div className="w-[1px] h-4 sm:h-5 bg-white/20" />

          <span className="bg-[#EA638C] text-white text-[8px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            {totalSelected} {totalSelected === 1 ? "Item" : "Items"}
          </span>
        </div>

        <button
          onClick={handleBulkAdd}
          disabled={totalSelected === 0}
          className="flex items-center justify-center gap-2 bg-[#EA638C] text-white px-5 sm:px-10 py-3.5 sm:py-4 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-[#EA638C]/20 shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span>Confirm & Add</span>
        </button>
      </div>

      {/* IMAGE POPUP MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white p-2 sm:p-3 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col items-center border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 z-10 bg-[#EA638C] text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white"
            >
              <X size={18} strokeWidth={3} />
            </button>

            <div className="relative w-full overflow-hidden aspect-square rounded-2xl bg-gray-50">
              <Image
                src={selectedImage}
                alt="Variant Preview"
                fill
                className="object-contain"
              />
            </div>
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
}) {
  const liveDisplayStock = Math.max(0, v.stock - inBagQty - selectionQty);
  const imgUrl = v.image || v.imageUrl || "/placeholder.png";

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
              className="object-cover group-hover:opacity-90"
            />
          </button>
          <div>
            <span className="font-black text-[#3E442B] uppercase text-[12px] block leading-none mb-1">
              {v.color}
            </span>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              {v.size} (MOQ: {v.minOrderQuantity || 1})
            </span>
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
}) {
  const liveDisplayStock = Math.max(0, v.stock - inBagQty - selectionQty);
  const imgUrl = v.image || v.imageUrl || "/placeholder.png";

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
            className="object-cover group-hover:opacity-90"
          />
        </button>
        <div className="flex-1 min-w-0">
          <span className="font-black text-[#3E442B] uppercase text-[14px] block truncate leading-none mb-1">
            {v.color}
          </span>
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