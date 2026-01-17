"use client";
import { useState, useEffect } from "react";
import { Minus, Plus, ShieldCheck, ImageIcon } from "lucide-react";
import { useCart } from "@/Context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// --- SUB-COMPONENT FOR INDEPENDENT ROWS ---
const VariantRow = ({ variantObj, product, onAddToCart, onHover }) => {
  // Use specific variant MOQ/Stock or fallback to product defaults
  const specificMoq = variantObj?.minOrderQuantity || product.minOrderQuantity || 1;
  const initialStock = variantObj?.stock || 0;
  const [rowQty, setRowQty] = useState(specificMoq);

  useEffect(() => {
    setRowQty(specificMoq);
  }, [specificMoq]);

  const isOutOfStock = initialStock <= 0;

  const handleUpdateQty = (delta) => {
    const newQty = rowQty + (delta * specificMoq);
    
    if (newQty >= specificMoq && newQty <= initialStock) {
      setRowQty(newQty);
    } else if (newQty < specificMoq) {
      toast.error(`Minimum order is ${specificMoq}`);
    } else if (newQty > initialStock) {
      toast.error("Exceeds available stock");
    }
  };

  return (
    <tr 
      className="transition-colors hover:bg-gray-50/50 group"
      onMouseEnter={() => onHover(variantObj?.image || variantObj?.imageUrl)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 overflow-hidden bg-gray-100 rounded-xl shrink-0 border border-gray-100 group-hover:border-[#EA638C] transition-colors">
            {(variantObj?.image || variantObj?.imageUrl) ? (
              <img src={variantObj?.image || variantObj?.imageUrl} alt={variantObj.size} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-300">
                <ImageIcon size={16} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-gray-800 uppercase italic tracking-tighter text-[13px]">
                {variantObj.color}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Size: {variantObj.size}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-black text-gray-900">৳{variantObj?.price || product.price}</span>
          {specificMoq > 1 && <span className="text-[9px] text-[#EA638C] font-black uppercase tracking-tighter italic">Min: {specificMoq} units</span>}
        </div>
      </td>

      {/* 🟢 SHOWING STOCK NUMBER ONLY - NO BAR */}
      <td className="px-6 py-4 text-center">
        <span className={`text-[13px] font-black uppercase tracking-tighter ${isOutOfStock ? 'text-red-500' : 'text-gray-600'}`}>
          {isOutOfStock ? "Sold Out" : initialStock}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <div className="inline-flex items-center bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <button 
              onClick={() => handleUpdateQty(-1)} 
              disabled={rowQty <= specificMoq} 
              className="px-2 py-1.5 transition-colors disabled:opacity-30 hover:text-[#EA638C]"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <span className="px-2 font-black min-w-[40px] text-center text-[13px] text-gray-800">{rowQty}</span>
            <button 
              onClick={() => handleUpdateQty(1)} 
              disabled={rowQty + specificMoq > initialStock}
              className="px-2 py-1.5 transition-colors disabled:opacity-30 hover:text-[#EA638C]"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
          
          <button 
            onClick={() => onAddToCart(variantObj, rowQty, initialStock)}
            disabled={isOutOfStock || rowQty === 0}
            className="bg-[#EA638C] text-white p-2 rounded-full hover:scale-110 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:grayscale"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- MAIN COMPONENT ---
export default function ProductPurchaseSection({ product, onVariantChange }) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  // Logic: Map only through existing variants. Fallback to empty array.
  const variants = product.variants || [];

  const handleAdd = (vObj, qty, currentStock) => {
    const cartItem = {
      productId: product._id,
      name: product.name,
      uniqueKey: `${product._id}-${vObj.color}-${vObj.size}`,
      color: vObj.color,
      size: vObj.size,
      price: vObj.price || product.price,
      imageUrl: vObj.image || vObj.imageUrl || product.imageUrl,
      stock: currentStock, // 🟢 Correctly passing variant-specific stock
      minOrderQuantity: vObj.minOrderQuantity || product.minOrderQuantity || 1,
    };

    console.group("🛒 Adding to Cart");
    console.log("Full Item Payload:", cartItem);
    console.groupEnd();

    addToCart(cartItem, qty);
    toast.success(`${qty} units of ${vObj.color} added!`);
  };

  return (
    <div className="flex flex-col gap-8 mt-10 lg:flex-row">
      <div className="lg:flex-1">
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Variant Details</th>
                <th className="px-6 py-5">Unit Price</th>
                <th className="px-6 py-5 text-center">In Stock</th>
                <th className="px-6 py-5 text-right">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variants.length > 0 ? (
                variants.map((variant, index) => (
                  <VariantRow 
                    key={variant._id || index} 
                    product={product} 
                    variantObj={variant}
                    onAddToCart={handleAdd}
                    onHover={onVariantChange}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                    No variants available for this item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 lg:w-80">
        <div className="sticky p-8 bg-white border border-gray-100 shadow-2xl rounded-[3rem] top-32">
          <div className="p-6 mb-8 border border-pink-100 bg-pink-50/20 rounded-[2rem]">
             <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em] mb-2">Wholesale Notice</p>
             <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
                Stock levels are tracked per variant. Select your required size and color combinations below.
             </p>
          </div>
          <button 
            onClick={() => router.push("/cart")} 
            className="w-full bg-black text-white py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#EA638C] transition-all shadow-xl"
          >
            <ShieldCheck size={18}/> View My Cart
          </button>
        </div>
      </div>
    </div>
  );
}