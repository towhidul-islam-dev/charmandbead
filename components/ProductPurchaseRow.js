"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export default function ProductPurchaseRow({ size, price, stock }) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = stock <= 0;

  const updateQty = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= stock) {
      setQuantity(newQty);
    }
  };

  return (
    <tr className="hover:bg-blue-50/20 transition-colors">
      <td className="px-6 py-4 font-bold text-gray-700">{size}</td>
      <td className="px-6 py-4 font-bold text-gray-900">
        ৳{price * quantity} 
        {quantity > 1 && <span className="text-[10px] text-gray-400 block font-normal">৳{price} / unit</span>}
      </td>
      <td className="px-6 py-4">
        {isOutOfStock ? (
          <span className="text-red-500 font-bold text-xs uppercase tracking-tight">Out of Stock</span>
        ) : (
          <span className="text-green-600 font-bold text-xs uppercase tracking-tight">{stock} Available</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
          <button 
            onClick={() => updateQty(-1)}
            disabled={isOutOfStock || quantity <= 1}
            className="px-3 py-1 hover:bg-white hover:text-blue-600 font-bold disabled:opacity-30 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="px-4 text-gray-900 font-bold border-x min-w-[40px] text-center">
            {isOutOfStock ? 0 : quantity}
          </span>
          <button 
            onClick={() => updateQty(1)}
            disabled={isOutOfStock || quantity >= stock}
            className="px-3 py-1 hover:bg-white hover:text-blue-600 font-bold disabled:opacity-30 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}