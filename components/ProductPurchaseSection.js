"use client";
import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingBag, AlertCircle, BellRing } from "lucide-react";
import { useCart } from "@/Context/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { registerStockNotification } from "@/actions/notify"; 
import toast from "react-hot-toast";

export default function ProductPurchaseSection({ product, onVariantChange }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const variants = product.variants || [];

  const [quantities, setQuantities] = useState({});

  // 1. Initial Quantity Setup & Stock Validation
  useEffect(() => {
    const initialQtys = {};
    variants.forEach((v) => {
      const vKey = v._id || `${v.color}-${v.size}`;
      const moq = v.minOrderQuantity || product.minOrderQuantity || 1;
      initialQtys[vKey] = v.stock < moq ? 0 : quantities[vKey] || 0;
    });
    setQuantities(initialQtys);
  }, [variants]);

  // 2. Background Refresh
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [router]);

  // 3. Handle Quantity Changes
  const handleUpdateQty = (vKey, direction, moq, stock, variant) => {
    const currentQty = quantities[vKey] || 0;
    let newQty;

    if (direction > 0) {
      newQty = currentQty === 0 ? moq : currentQty + 1; 
    } else {
      newQty = currentQty <= moq ? 0 : currentQty - 1;
    }

    if (newQty > stock) {
      toast.error(`Only ${stock} units available`);
      return;
    }

    // 🟢 SYNC WITH PARENT: Pass full variant data back for SKU/Image display
    if (newQty > 0 && onVariantChange) {
      onVariantChange({
        imageUrl: variant.image || variant.imageUrl || product.imageUrl,
        sku: variant.sku || null
      });
    }

    setQuantities((prev) => ({ 
      ...prev, 
      [vKey]: newQty 
    }));
  };

  // 4. Back in Stock Notification
  const handleNotifyMe = async (v) => {
    if (!session) {
      toast.error("Please login to register for alerts");
      return;
    }

    const res = await registerStockNotification({
      userId: session.user.id,
      email: session.user.email,
      productId: product._id,
      variantKey: `${v.color}-${v.size}`,
    });

    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  };

  // 5. Bulk Add with Variant ID Accuracy
  const handleBulkAdd = () => {
    const itemsToAdd = variants.filter((v) => {
      const vKey = v._id || `${v.color}-${v.size}`;
      return quantities[vKey] > 0;
    });

    if (itemsToAdd.length === 0) {
      toast.error("Select quantity for at least one variant");
      return;
    }

    itemsToAdd.forEach((v) => {
      const vKey = v._id || `${v.color}-${v.size}`;
      const qty = quantities[vKey];

      // 🟢 REFINED CART OBJECT: Ensuring variantId is the actual MongoDB _id
      const cartItem = {
        productId: product._id,
        variantId: v._id, // Critical for surgical stock deduction
        name: product.name,
        uniqueKey: `${product._id}-${v.color}-${v.size}`,
        color: v.color,
        size: v.size,
        price: v.price || product.price,
        imageUrl: v.image || v.imageUrl || product.imageUrl,
        stock: v.stock || 0,
        minOrderQuantity: v.minOrderQuantity || product.minOrderQuantity || 1,
        sku: v.sku || null
      };
      
      // Passing 'v' as the second argument ensures CartContext gets the full variant metadata
      addToCart(cartItem, v, qty);
    });

    toast.success(`Successfully added selections to bag`);

    const resetQtys = {};
    variants.forEach((v) => (resetQtys[v._id || `${v.color}-${v.size}`] = 0));
    setQuantities(resetQtys);
  };

  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 mt-10">
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Variant Details</th>
              <th className="px-6 py-5">Unit Price</th>
              <th className="px-6 py-5 text-center">In Stock</th>
              <th className="px-6 py-5 text-right">Set Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variants.map((v) => {
              const vKey = v._id || `${v.color}-${v.size}`;
              const moq = v.minOrderQuantity || product.minOrderQuantity || 1;
              const stock = v.stock || 0;
              const currentQty = quantities[vKey] || 0;
              const isUnavailable = stock < moq;

              return (
                <tr
                  key={vKey}
                  className={`transition-colors group ${isUnavailable ? "bg-gray-50/40" : "hover:bg-gray-50/25"}`}
                >
                  <td className="px-6 py-4">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onVariantChange({ 
                        imageUrl: v.image || v.imageUrl, 
                        sku: v.sku 
                      })}
                    >
                      <div className={`w-10 h-10 overflow-hidden border border-gray-100 rounded-lg shrink-0 ${isUnavailable ? "grayscale opacity-50" : ""}`}>
                        <img
                          src={v.image || v.imageUrl || "/placeholder.png"}
                          className="object-cover w-full h-full"
                          alt={v.color}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black uppercase text-[12px] ${isUnavailable ? "text-gray-400" : "text-gray-800"}`}>
                          {v.color}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          {v.size}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-black ${isUnavailable ? "text-gray-300" : "text-gray-900"}`}>
                    ৳{v.price || product.price}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isUnavailable ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[8px] font-black text-red-400 uppercase bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          <AlertCircle size={10} /> Sold Out
                        </span>
                        <button
                          onClick={() => handleNotifyMe(v)}
                          className="flex items-center gap-1 text-[8px] font-black text-[#EA638C] uppercase hover:scale-105 transition-transform"
                        >
                          <BellRing size={10} /> Notify Me
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        <span className={`font-black transition-all duration-200 ${(stock - currentQty) <= moq * 2 ? 'text-orange-500 scale-110' : 'text-gray-500'}`}>
                          {Math.max(0, stock - currentQty)}
                        </span>
                        {currentQty > 0 && (
                          <span className="text-[7px] font-black text-[#EA638C] uppercase animate-pulse">
                            In Selection
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className={`inline-flex items-center p-1 rounded-xl border transition-all ${isUnavailable ? "bg-gray-100 border-gray-100 opacity-20" : "bg-gray-100 border-gray-200 shadow-inner"}`}>
                        <button
                          onClick={() => handleUpdateQty(vKey, -1, moq, stock, v)}
                          disabled={isUnavailable || currentQty === 0}
                          className="p-1.5 hover:text-[#EA638C] transition-colors disabled:opacity-0"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className={`px-3 font-black min-w-[40px] text-center ${currentQty > 0 ? "text-[#EA638C] text-sm" : "text-gray-400 text-xs"}`}>
                          {currentQty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(vKey, 1, moq, stock, v)}
                          disabled={isUnavailable || currentQty + 1 > stock}
                          className="p-1.5 hover:text-[#EA638C] transition-colors disabled:opacity-0"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                      {moq > 1 && !isUnavailable && (
                        <span className="text-[7px] font-black text-gray-400 uppercase pr-2 italic tracking-tighter">
                          Min: {moq} Unit Steps
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-6 flex items-center justify-between gap-4 p-5 bg-gray-900 rounded-[2.5rem] shadow-2xl border border-white/10 mx-2 sm:mx-0">
        <div className="hidden pl-4 sm:block">
          <p className="text-white text-[12px] font-black uppercase italic leading-none">Wholesale Selection</p>
          <p className="text-[#EA638C] text-[10px] font-black uppercase tracking-widest mt-1">{totalSelected} Items Selected</p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            onClick={handleBulkAdd}
            disabled={totalSelected === 0}
            className="flex-1 sm:flex-none bg-[#EA638C] text-white px-12 py-4 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#d54d76] active:scale-95 transition-all shadow-lg shadow-pink-500/20 disabled:bg-gray-700 disabled:shadow-none"
          >
            <ShoppingBag size={16} /> 
            {totalSelected > 0 ? `Add Selected (৳${totalSelected * (variants[0]?.price || product.price)})` : "Add to Bag"}
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="bg-white/10 text-white px-6 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
          >
            Bag
          </button>
        </div>
      </div>
    </div>
  );
}