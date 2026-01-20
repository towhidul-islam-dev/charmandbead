"use client";
import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/Context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProductPurchaseSection({ product, onVariantChange }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const variants = product.variants || [];

  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const initialQtys = {};
    variants.forEach((v) => {
      const vKey = v._id || `${v.color}-${v.size}`;
      initialQtys[vKey] = 0; 
    });
    setQuantities(initialQtys);
  }, [variants]);

  // 🟢 UPDATED: Wholesale Quantity Logic (MOQ Steps)
  const handleUpdateQty = (vKey, direction, moq, stock) => {
    const currentQty = quantities[vKey] || 0;
    let newQty;

    if (direction > 0) {
      // INCREMENT LOGIC
      if (currentQty === 0) {
        newQty = moq; // Jump to MOQ on first click
      } else {
        newQty = currentQty + moq; // Increment by MOQ steps
      }
    } else {
      // DECREMENT LOGIC
      if (currentQty <= moq) {
        newQty = 0; // Reset to 0 if at or below MOQ
      } else {
        newQty = currentQty - moq; // Decrement by MOQ steps
      }
    }

    // Validation
    if (newQty > stock) {
      toast.error(`Only ${stock} units available`);
      return;
    }

    setQuantities((prev) => ({ ...prev, [vKey]: newQty }));
  };

  const handleBulkAdd = () => {
    const itemsToAdd = variants.filter(v => {
        const vKey = v._id || `${v.color}-${v.size}`;
        return quantities[vKey] > 0;
    });

    if (itemsToAdd.length === 0) {
        toast.error("Please select quantity for at least one variant");
        return;
    }

    itemsToAdd.forEach(v => {
        const vKey = v._id || `${v.color}-${v.size}`;
        const qty = quantities[vKey];
        
        const cartItem = {
            productId: product._id,
            name: product.name,
            uniqueKey: `${product._id}-${v.color}-${v.size}`, 
            color: v.color,
            size: v.size,
            price: v.price || product.price,
            imageUrl: v.image || v.imageUrl || product.imageUrl,
            stock: v.stock || 0,
            minOrderQuantity: v.minOrderQuantity || product.minOrderQuantity || 1,
        };
        addToCart(cartItem, null, qty);
    });

    toast.success(`Added ${itemsToAdd.length} variant(s) to bag`);
    
    // Optional: Reset quantities after adding
    const resetQtys = {};
    variants.forEach(v => resetQtys[v._id || `${v.color}-${v.size}`] = 0);
    setQuantities(resetQtys);
  };

  return (
    <div className="flex flex-col gap-6 mt-10">
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Variant Details</th>
              <th className="px-6 py-5">Unit Price</th>
              <th className="px-6 py-5 text-center">Stock</th>
              <th className="px-6 py-5 text-right">Set Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variants.map((v) => {
              const vKey = v._id || `${v.color}-${v.size}`;
              const moq = v.minOrderQuantity || product.minOrderQuantity || 1;
              const stock = v.stock || 0;
              const currentQty = quantities[vKey] || 0;

              return (
                <tr key={vKey} className="transition-colors hover:bg-gray-50/50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onVariantChange(v.image || v.imageUrl)}>
                      <div className="w-10 h-10 overflow-hidden border border-gray-100 rounded-lg shrink-0">
                        <img src={v.image || v.imageUrl} className="object-cover w-full h-full" alt={v.color} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800 uppercase text-[12px]">{v.color}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{v.size}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">৳{v.price || product.price}</td>
                  <td className={`px-6 py-4 font-bold text-center ${stock < moq ? 'text-red-500' : 'text-gray-500'}`}>
                    {stock}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                        <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 shadow-inner">
                        <button 
                            onClick={() => handleUpdateQty(vKey, -1, moq, stock)} 
                            className="p-1.5 hover:text-[#EA638C] transition-colors"
                        >
                            <Minus size={14} strokeWidth={3}/>
                        </button>
                        
                        <span className={`px-3 font-black min-w-[40px] text-center transition-all ${currentQty > 0 ? 'text-[#EA638C] text-sm' : 'text-gray-400 text-xs'}`}>
                            {currentQty}
                        </span>

                        <button 
                            onClick={() => handleUpdateQty(vKey, 1, moq, stock)} 
                            disabled={stock < moq}
                            className="p-1.5 hover:text-[#EA638C] transition-colors disabled:opacity-10"
                        >
                            <Plus size={14} strokeWidth={3}/>
                        </button>
                        </div>
                        {moq > 1 && (
                            <span className="text-[7px] font-black text-gray-400 uppercase pr-2">Step: {moq}</span>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FIXED CONSOLIDATED BAR */}
      <div className="sticky bottom-6 flex items-center justify-between gap-4 p-5 bg-gray-900 rounded-[2rem] shadow-2xl border border-white/10">
        <div className="hidden sm:block pl-4">
            <p className="text-white text-[12px] font-black uppercase italic leading-none">Wholesale Summary</p>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                {Object.values(quantities).reduce((a, b) => a + b, 0)} Units Selected
            </p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
            <button 
                onClick={handleBulkAdd}
                className="flex-1 sm:flex-none bg-[#EA638C] text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#d54d76] active:scale-95 transition-all shadow-lg"
            >
                <ShoppingBag size={16} /> Add To Bag
            </button>
            <button onClick={() => router.push("/cart")} className="bg-white/10 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all">
                Bag
            </button>
        </div>
      </div>
    </div>
  );
}