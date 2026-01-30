"use client";
import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/Context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  PlusIcon as PlusSmallIcon,
  FireIcon
} from "@heroicons/react/24/outline";

export default function CartPage({ initialItems = [], isAdminPreview = false, user = null }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false); // 🟢 Lock state
  const {
    cart: globalCart,
    addToCart,
    deleteSelectedItems,
    clearCart,
  } = useCart();

  const cart = useMemo(() => {
    return globalCart.length > 0 ? globalCart : initialItems;
  }, [globalCart, initialItems]);

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (isAdminPreview && cart.length > 0) {
      setSelectedItems(cart.map((item) => item.uniqueKey));
    }
  }, [cart, isAdminPreview]);

  const groupedCart = useMemo(() => {
    const groups = {};
    cart.forEach((item) => {
      const pId = item.productId;
      if (!groups[pId]) {
        groups[pId] = {
          productId: pId,
          name: item.name,
          imageUrl: item.imageUrl,
          variants: [],
        };
      }
      groups[pId].variants.push(item);
    });
    return Object.values(groups);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart
      .filter((item) => selectedItems.includes(item.uniqueKey))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart, selectedItems]);

  const vipDiscountAmount = useMemo(() => (user?.isVIP && subtotal > 0 ? subtotal * 0.05 : 0), [user, subtotal]);
  const finalTotal = subtotal - vipDiscountAmount;

  const toggleSelect = (uniqueKey) => {
    setSelectedItems((prev) =>
      prev.includes(uniqueKey) ? prev.filter((id) => id !== uniqueKey) : [...prev, uniqueKey]
    );
  };

  const toggleProductGroup = (variants) => {
    const keys = variants.map(v => v.uniqueKey);
    const allSelected = keys.every(k => selectedItems.includes(k));
    if (allSelected) {
      setSelectedItems(prev => prev.filter(k => !keys.includes(k)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...keys])]);
    }
  };

  const handleQuantityUpdate = (item, delta) => {
    const newQty = item.quantity + delta;
    const moq = item.minOrderQuantity || 1;
    if (newQty > item.stock) {
      toast.error(`Stock limit reached! Only ${item.stock} pieces available.`);
      return;
    }
    if (newQty < moq) return;
    addToCart(item, delta);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0 || isPending) return;
    setIsPending(true); // 🟢 Lock the UI
    try {
      const itemsToPurchase = cart.filter((item) => selectedItems.includes(item.uniqueKey));
      localStorage.setItem("checkoutItems", JSON.stringify(itemsToPurchase));
      router.push("/dashboard/checkout");
    } catch (err) {
      setIsPending(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-20">
        <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
        <h2 className="mb-2 text-2xl italic font-black text-gray-800 uppercase">Your Bag is Empty</h2>
        <Link href="/products" className="px-8 py-3 mt-4 text-[10px] font-black tracking-widest text-white uppercase bg-black rounded-2xl">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className={`w-full bg-gray-50/50 ${!isAdminPreview ? 'min-h-screen pt-32 pb-20 px-4' : 'p-2'}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-10 md:flex-row md:items-end">
          <div className="space-y-1">
            <h1 className="text-4xl italic font-black tracking-tighter text-gray-900 uppercase">My Bag</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory Secured Selection</p>
          </div>
          <button onClick={() => confirm("Empty entire cart?") && clearCart()} className="bg-white border border-gray-200 text-gray-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
            Clear All
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {groupedCart.map((product) => (
              <div key={product.productId} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/80 px-8 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-black cursor-pointer"
                      checked={product.variants.every(v => selectedItems.includes(v.uniqueKey))}
                      onChange={() => toggleProductGroup(product.variants)}
                    />
                    <div>
                      <h2 className="text-sm italic font-black text-gray-900 uppercase leading-none">{product.name}</h2>
                      <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Collection Parent</p>
                    </div>
                  </div>
                  <Link href={`/products/${product.productId}`} className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-[#EA638C] transition-all shadow-md">
                    <PlusSmallIcon className="w-3.5 h-3.5 stroke-[4px]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">Add More Variant</span>
                  </Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {product.variants.map((variant) => {
                    const isSelected = selectedItems.includes(variant.uniqueKey);
                    const moq = variant.minOrderQuantity || 1;
                    const remainingStock = variant.stock - variant.quantity;
                    const isLowStock = remainingStock <= moq;
                    const isMaxed = remainingStock === 0;

                    return (
                      <div key={variant.uniqueKey} className={`p-6 px-8 transition-all duration-500 ${isSelected ? 'bg-[#EA638C]/5' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                          <div className="md:col-span-5 flex items-center gap-4">
                            <input type="checkbox" className="w-4 h-4 accent-[#EA638C] cursor-pointer" checked={isSelected} onChange={() => toggleSelect(variant.uniqueKey)} />
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0 bg-white shadow-sm">
                                <img src={variant.imageUrl} className="w-full h-full object-cover" alt={variant.color} />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-gray-800 italic leading-none">{variant.color}</span>
                                <span className="text-[10px] font-black text-gray-300">/</span>
                                <span className="text-[10px] font-black uppercase text-gray-800 leading-none">{variant.size}</span>
                              </div>
                              <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full w-fit transition-all duration-300 shadow-sm
                                ${isMaxed ? 'bg-red-600 text-white animate-pulse' : 
                                  isLowStock ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                                  'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {isMaxed ? <FireIcon className="w-3 h-3" /> : <div className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-orange-600 animate-ping' : 'bg-emerald-600'}`} />}
                                <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                  {isMaxed ? 'No more pieces left' : `${remainingStock} pieces remaining`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="md:col-span-7 flex items-center justify-between md:justify-end gap-10">
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1.5 px-4 shadow-sm">
                                <button onClick={() => handleQuantityUpdate(variant, -moq)} disabled={variant.quantity <= moq} className="p-1 hover:text-[#EA638C] disabled:opacity-20 transition-all"><MinusIcon className="w-4 h-4 stroke-[3px]" /></button>
                                <span className="text-sm font-black w-6 text-center text-gray-900">{variant.quantity}</span>
                                <button onClick={() => handleQuantityUpdate(variant, moq)} disabled={variant.quantity >= variant.stock} className="p-1 hover:text-[#EA638C] disabled:opacity-10 transition-all"><PlusIcon className="w-4 h-4 stroke-[3px]" /></button>
                                </div>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <p className="text-base italic font-black text-gray-900 tracking-tighter">৳{(variant.price * variant.quantity).toLocaleString()}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">Line Total</p>
                            </div>
                            <button onClick={() => deleteSelectedItems([variant.uniqueKey])} className="text-gray-300 hover:text-red-500 transition-colors p-1"><TrashIcon className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 sticky top-32">
              <h2 className="mb-8 text-xl italic font-black tracking-tighter text-gray-900 uppercase">Order Summary</h2>
              <div className="mb-8 space-y-5">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <span>Subtotal</span>
                  <span className="text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex items-baseline justify-between">
                  <span className="text-sm italic font-black text-gray-900 uppercase">Grand Total</span>
                  <span className="text-4xl italic font-black tracking-tighter">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout} 
                disabled={selectedItems.length === 0 || isPending} 
                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2
                  ${isPending ? 'bg-gray-400' : 'bg-black hover:bg-[#EA638C] text-white'} 
                  ${selectedItems.length === 0 ? 'opacity-30' : 'opacity-100'}`}
              >
                {isPending && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                {isPending ? "Processing..." : selectedItems.length === 0 ? "Select Items First" : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}