"use client";
import { useState, useEffect } from "react";
import { Minus, Plus, ShieldCheck, ImageIcon } from "lucide-react"; // Added ImageIcon for fallback
import { useCart } from "@/Context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// --- SUB-COMPONENT FOR INDEPENDENT ROWS ---
const VariantRow = ({ size, product, variantObj, onAddToCart, onHover }) => {
  const specificMoq = variantObj?.minOrderQuantity || product.minOrderQuantity || 1;
  const [rowQty, setRowQty] = useState(specificMoq);

  useEffect(() => {
    setRowQty(specificMoq);
  }, [specificMoq]);

  const handleUpdateQty = (delta) => {
    const newQty = rowQty + (delta * specificMoq);
    
    if (newQty >= specificMoq && newQty <= (variantObj?.stock || product.stock)) {
      setRowQty(newQty);
    } else if (newQty < specificMoq) {
      toast.error(`Minimum order for this variant is ${specificMoq}`);
    } else if (newQty > (variantObj?.stock || product.stock)) {
      toast.error("Exceeds available stock");
    }
  };

  return (
    <tr 
      className="transition-colors hover:bg-pink-50/30 group"
      // TRIGGER IMAGE CHANGE ON HOVER
      onMouseEnter={() => onHover(variantObj?.image)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* MINI THUMBNAIL IN ROW */}
          <div className="w-10 h-10 overflow-hidden bg-gray-100 rounded-lg shrink-0 border border-gray-100 group-hover:border-[#EA638C] transition-colors">
            {variantObj?.image ? (
              <img src={variantObj.image} alt={size} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-300">
                <ImageIcon size={16} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-700">{size}</span>
            {variantObj?.color && (
              <span className="text-[10px] text-gray-400 font-medium uppercase">{variantObj.color}</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-bold text-gray-900">
        ৳{( (variantObj?.price || product.price) * rowQty).toLocaleString()}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50">
            <button 
              onClick={() => handleUpdateQty(-1)} 
              disabled={rowQty <= specificMoq} 
              className="px-3 py-1 transition-colors disabled:opacity-30 hover:text-red-500"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 font-bold border-x min-w-[55px] text-center text-[#EA638C]">{rowQty}</span>
            <button 
              onClick={() => handleUpdateQty(1)} 
              disabled={rowQty + specificMoq > (variantObj?.stock || product.stock)}
              className="px-3 py-1 transition-colors disabled:opacity-30 hover:text-green-600"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <button 
            onClick={() => onAddToCart(variantObj || size, rowQty)}
            className="text-[10px] font-black text-[#EA638C] uppercase hover:bg-[#EA638C] hover:text-white transition-all flex items-center gap-1 bg-pink-50 px-2 py-1 rounded"
          >
            <Plus size={10} /> Add to Cart
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- MAIN COMPONENT ---
export default function ProductPurchaseSection({ product, productSizes = [], onVariantChange }) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  const displaySizes = productSizes.length > 0 ? productSizes : ["Standard"];

  const handleAdd = (variantOrSize, qty) => {
    addToCart(product, variantOrSize, qty);
    const label = typeof variantOrSize === 'string' ? variantOrSize : (variantOrSize.size || variantOrSize.color);
    toast.success(`Added ${qty} units of ${label}`);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="lg:flex-1">
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2rem]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Variant</th>
                <th className="px-6 py-4">Subtotal</th>
                <th className="px-6 py-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displaySizes.map((size, index) => {
                const variantObj = product.variants?.find(v => v.size === size) || product.variants?.[index];
                
                return (
                  <VariantRow 
                    key={size + index} 
                    size={size} 
                    product={product} 
                    variantObj={variantObj}
                    onAddToCart={handleAdd}
                    // PASS THE HOVER FUNCTION TO THE ROW
                    onHover={onVariantChange}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 lg:w-80">
        <div className="sticky p-6 bg-white border border-gray-100 shadow-xl rounded-[2.5rem] top-28">
          <div className="p-5 mb-4 border border-pink-100 bg-pink-50/50 rounded-2xl">
             <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest">Wholesale Guide</p>
             <p className="mt-2 text-[11px] font-bold text-gray-500 leading-relaxed uppercase">
                Hover over a row to view the variant image. Minimums are applied per selection.
             </p>
          </div>
          <button 
            onClick={() => router.push("/cart")} 
            className="w-full bg-[#EA638C] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-pink-100"
          >
            <ShieldCheck size={18}/> Go to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}