"use client";
import { useState, useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/Context/CartContext";
import toast from "react-hot-toast";

export default function ProductPurchaseSection({ product, onVariantChange }) {
  const { addToCart, cart } = useCart();
  const variants = product.variants || [];

  const lastProductId = useRef(product._id);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (lastProductId.current !== product._id) {
      const initialQtys = {};
      variants.forEach((v, index) => {
        const vKey = v._id?.toString() || `v-${index}`;
        initialQtys[vKey] = 0;
      });
      setQuantities(initialQtys);
      lastProductId.current = product._id;
    }
  }, [product._id, variants]);

  const getQtyInBag = (vId) => {
    const itemInBag = cart?.find((item) => item.variantId === vId);
    return itemInBag ? Number(itemInBag.quantity) : 0;
  };

  // 🟢 FIXED LOGIC: Increments/Decrements by MOQ step
  const handleUpdateQty = (vKey, direction, moq, stock, variant) => {
    const currentSelection = quantities[vKey] || 0;
    const inBagQty = getQtyInBag(variant._id);
    const actuallyAvailable = stock - inBagQty;
    const step = moq || 1; // Default to 1 if no MOQ defined

    let newQty;

    if (direction > 0) {
      // INCREMENT LOGIC
      if (currentSelection === 0) {
        newQty = step; // First click jumps to MOQ
      } else {
        newQty = currentSelection + step; // Subsequent clicks add MOQ
      }
    } else {
      // DECREMENT LOGIC
      if (currentSelection <= step) {
        newQty = 0; // If at or below MOQ, reset to 0
      } else {
        newQty = currentSelection - step; // Otherwise subtract MOQ
      }
    }

    // Check if the new request exceeds available stock
    if (newQty > actuallyAvailable) {
      toast.error(`Cannot exceed ${actuallyAvailable} units (MOQ: ${step})`, {
        style: { border: `1px solid #EA638C`, color: '#3E442B', fontWeight: 'bold' }
      });
      return;
    }

    setQuantities((prev) => ({ ...prev, [vKey]: newQty }));
    
    if (onVariantChange) {
      onVariantChange(variant);
    }
  };

  const handleBulkAdd = () => {
    const itemsToProcess = variants.filter(v => quantities[v._id] > 0);
    if (itemsToProcess.length === 0) return;

    itemsToProcess.forEach((v) => {
      addToCart({
        productId: product._id,
        variantId: v._id,
        name: product.name,
        color: v.color,
        size: v.size,
        price: v.price || product.price,
        imageUrl: v.image || v.imageUrl || product.imageUrl,
        stock: v.stock,
        minOrderQuantity: v.minOrderQuantity || 1,
      }, v, quantities[v._id]);
    });

    toast.success("Bag Updated", { 
      style: { background: '#3E442B', color: '#fff', fontWeight: '900', borderRadius: '1rem' } 
    });
    setQuantities({}); 
  };

  return (
    <div className="flex flex-col gap-6 mt-10">
      <div className="hidden md:block overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Variant</th>
              <th className="px-6 py-5 text-center">Available Stock</th>
              <th className="px-6 py-5 text-right">Qty (Step: MOQ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variants.map((v, idx) => (
              <VariantRow 
                key={v._id || `row-${idx}`} 
                v={v} 
                inBagQty={getQtyInBag(v._id)} 
                selectionQty={quantities[v._id] || 0}
                handleUpdateQty={handleUpdateQty}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        {variants.map((v, idx) => (
          <VariantCard 
            key={v._id || `card-${idx}`} 
            v={v} 
            inBagQty={getQtyInBag(v._id)} 
            selectionQty={quantities[v._id] || 0}
            handleUpdateQty={handleUpdateQty}
          />
        ))}
      </div>

      <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 bg-[#3E442B] rounded-[2rem] sm:rounded-[3rem] shadow-2xl mx-1 border border-white/10 gap-4 transition-all">
        <div className="flex flex-col items-center pl-0 sm:items-start sm:pl-4">
          <p className="text-white/50 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Total Unit Count</p>
          <p className="text-[#FBB6E6] text-[20px] font-black italic tracking-tighter">
            {Object.values(quantities).reduce((a, b) => a + b, 0)} <span className="text-[12px] uppercase not-italic ml-1">Items</span>
          </p>
        </div>
        <button 
          onClick={handleBulkAdd}
          disabled={Object.values(quantities).every(q => q === 0)}
          className="w-full sm:w-auto bg-[#EA638C] text-white px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-[#EA638C]/20"
        >
          Confirm & Add to Bag
        </button>
      </div>
    </div>
  );
}

/* --- Sub-components (Updated QtySelector for visuals) --- */

function VariantRow({ v, inBagQty, selectionQty, handleUpdateQty }) {
  const liveDisplayStock = Math.max(0, v.stock - inBagQty - selectionQty);
  return (
    <tr className="transition-colors hover:bg-gray-50/30">
      <td className="px-6 py-4">
        <span className="font-black text-[#3E442B] uppercase text-[12px] block leading-none mb-1">{v.color}</span>
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{v.size} (MOQ: {v.minOrderQuantity})</span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center">
          <span className={`font-black text-[15px] italic ${liveDisplayStock < (v.minOrderQuantity * 2) ? 'text-[#EA638C]' : 'text-[#3E442B]'}`}>
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
        <QtySelector v={v} selectionQty={selectionQty} liveDisplayStock={liveDisplayStock} handleUpdateQty={handleUpdateQty} />
      </td>
    </tr>
  );
}

function VariantCard({ v, inBagQty, selectionQty, handleUpdateQty }) {
  const liveDisplayStock = Math.max(0, v.stock - inBagQty - selectionQty);
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm flex items-center justify-between active:border-[#FBB6E6] transition-all">
      <div>
        <span className="font-black text-[#3E442B] uppercase text-[14px] block leading-none mb-1">{v.color}</span>
        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{v.size} • MOQ: {v.minOrderQuantity}</span>
        <div className="flex items-center gap-2 mt-2">
           <span className={`text-[10px] font-black ${liveDisplayStock < (v.minOrderQuantity * 2) ? 'text-[#EA638C]' : 'text-gray-400'}`}>
             {liveDisplayStock} AVAILABLE
           </span>
        </div>
      </div>
      <QtySelector v={v} selectionQty={selectionQty} liveDisplayStock={liveDisplayStock} handleUpdateQty={handleUpdateQty} />
    </div>
  );
}

function QtySelector({ v, selectionQty, liveDisplayStock, handleUpdateQty }) {
  const vKey = v._id?.toString();
  return (
    <div className="inline-flex items-center p-1 border border-gray-200 bg-gray-50 rounded-2xl">
      <button 
        onClick={() => handleUpdateQty(vKey, -1, v.minOrderQuantity, v.stock, v)}
        className="p-2 text-[#3E442B]/30 hover:text-[#EA638C] disabled:opacity-20 transition-colors"
        disabled={selectionQty === 0}
      >
        <Minus size={16} strokeWidth={4} />
      </button>
      <span className={`px-4 font-black min-w-[40px] text-center text-[15px] italic ${selectionQty > 0 ? "text-[#EA638C]" : "text-gray-300"}`}>
        {selectionQty}
      </span>
      <button 
        onClick={() => handleUpdateQty(vKey, 1, v.minOrderQuantity, v.stock, v)}
        className="p-2 text-[#3E442B]/30 hover:text-[#EA638C] disabled:opacity-20 transition-colors"
        disabled={liveDisplayStock < v.minOrderQuantity}
      >
        <Plus size={16} strokeWidth={4} />
      </button>
    </div>
  );
}