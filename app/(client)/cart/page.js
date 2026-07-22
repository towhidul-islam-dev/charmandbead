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
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function CartPage({ initialItems = [], isAdminPreview = false, user = null }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const {
    cart: globalCart,
    addToCart,
    deleteSelectedItems,
    clearCart,
  } = useCart();

  // Prioritize globalCart from Context as it contains dynamic wholesale pricing
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
      const pId = item.productId || item._id;
      if (!groups[pId]) {
        groups[pId] = {
          productId: pId,
          name: item.name || item.productName,
          imageUrl: item.imageUrl || item.image,
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
    const moq = item.minOrderQuantity || 1;
    const currentQty = item.quantity;
    let newQty = currentQty + delta;

    if (newQty % moq !== 0) {
      newQty = Math.ceil(newQty / moq) * moq;
    }

    if (newQty > item.stock) {
      toast.error(`Stock limit reached!`, {
        style: { borderRadius: '10px', background: '#3E442B', color: '#fff' }
      });
      return;
    }

    if (newQty < moq) return;
    addToCart(item, delta);
  };

  // 🟢 FIX: Properly attach variant images before passing data to Checkout
  // 🟢 FIX: Save items to localStorage, delete them from Cart Context, and navigate
  const handleCheckout = () => {
    if (selectedItems.length === 0 || isPending) return;
    setIsPending(true); 
    try {
      // 1. Filter selected items & attach variant image fields
      const itemsToPurchase = cart
        .filter((item) => selectedItems.includes(item.uniqueKey))
        .map((item) => {
          const img = item.imageUrl || item.image || item.variant?.image || null;
          return {
            ...item,
            variantImage: img,
            image: img,
            variant: {
              ...(typeof item.variant === "object" ? item.variant : {}),
              name: typeof item.variant === "string" ? item.variant : (item.variant?.name || item.color || "Default"),
              image: img,
            }
          };
        });

      // 2. Save snapshot to localStorage for CheckoutPage
      localStorage.setItem("checkoutItems", JSON.stringify(itemsToPurchase));

      // 3. Remove selected items from global CartContext immediately
      deleteSelectedItems(selectedItems);

      // 4. Reset selected state & Navigate to checkout
      setSelectedItems([]);
      router.push("/dashboard/checkout");
    } catch (err) {
      console.error("CHECKOUT_PREP_ERROR:", err);
      setIsPending(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-20">
        <div className="bg-[#FBB6E6]/20 p-8 rounded-full mb-4">
          <ShoppingBagIcon className="w-16 h-16 mx-auto text-[#EA638C] opacity-40" />
        </div>
        <h2 className="mb-2 text-2xl italic font-bold font-serif text-[#3E442B] uppercase">Your Bag is Empty</h2>
        <Link href="/products" className="px-8 py-3 mt-4 text-[10px] font-black tracking-widest text-white uppercase bg-[#3E442B] rounded-2xl hover:bg-[#EA638C] transition-all">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className={`w-full bg-[#FAFAFA] ${!isAdminPreview ? 'min-h-screen pt-32 pb-20 px-4' : 'p-2'}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-10 md:flex-row md:items-end">
          <div className="space-y-1">
            <h1 className="text-4xl italic font-bold font-serif tracking-tighter text-[#3E442B] uppercase">My Bag</h1>
            <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-widest">Wholesale Tiers Applied Automatically</p>
          </div>
          <button onClick={() => confirm("Empty entire cart?") && clearCart()} className="bg-white border border-gray-200 text-gray-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-all shadow-sm">
            Clear All
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {groupedCart.map((product) => (
              <div key={product.productId} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5 border-b border-gray-100 bg-gray-50/80">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 cursor-pointer accent-[#3E442B]"
                      checked={product.variants.every(v => selectedItems.includes(v.uniqueKey))}
                      onChange={() => toggleProductGroup(product.variants)}
                    />
                    <div>
                      <h2 className="text-sm italic font-bold font-serif leading-none text-[#3E442B] uppercase">{product.name}</h2>
                      <p className="text-[9px] font-bold text-gray-300 uppercase mt-1">Bulk Selection</p>
                    </div>
                  </div>
                  <Link href={`/products/${product.productId}`} className="flex items-center gap-2 px-5 py-2.5 bg-[#3E442B] text-white rounded-xl hover:bg-[#EA638C] transition-all shadow-md">
                    <PlusSmallIcon className="w-3.5 h-3.5 stroke-[4px]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em]">Add More Variants</span>
                  </Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {product.variants.map((variant) => {
                    const isSelected = selectedItems.includes(variant.uniqueKey);
                    const moq = variant.minOrderQuantity || 1;
                    const remainingStock = variant.stock - variant.quantity;
                    const isLowStock = remainingStock <= moq;
                    const isMaxed = remainingStock < moq;
                    const isDiscounted = variant.price < (variant.basePrice || variant.price);

                    return (
                      <div key={variant.uniqueKey} className={`p-6 px-8 transition-all duration-500 ${isSelected ? 'bg-[#EA638C]/5' : ''}`}>
                        <div className="grid items-center grid-cols-1 gap-4 md:grid-cols-12">
                          <div className="flex items-center gap-4 md:col-span-5">
                            <input type="checkbox" className="w-4 h-4 accent-[#EA638C] cursor-pointer" checked={isSelected} onChange={() => toggleSelect(variant.uniqueKey)} />
                            <div className="relative w-16 h-16 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl shrink-0">
                              <img src={variant.imageUrl || variant.image} className="object-cover w-full h-full" alt={variant.color || "Variant"} />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-[#3E442B] italic">{variant.color}</span>
                                <span className="text-[10px] font-black text-gray-200">/</span>
                                <span className="text-[10px] font-black uppercase text-[#3E442B]">{variant.size}</span>
                              </div>

                              {isDiscounted && (
                                <div className="flex items-center gap-1 mt-1 animate-bounce">
                                  <CheckBadgeIcon className="w-3 h-3 text-[#3E442B]" />
                                  <span className="text-[8px] font-black text-[#3E442B] uppercase tracking-tighter bg-[#FBB6E6] px-1.5 py-0.5 rounded">Wholesale Applied</span>
                                </div>
                              )}

                              <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full w-fit transition-all duration-300 shadow-sm
                                ${isMaxed ? 'bg-[#3E442B] text-[#FBB6E6]' : 
                                  isLowStock ? 'bg-[#EA638C]/10 text-[#EA638C] border border-[#EA638C]/20' : 
                                  'bg-[#FBB6E6]/30 text-[#3E442B] border border-[#FBB6E6]/50'}`}>
                                <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                  {isMaxed ? 'Stock Limit' : `${remainingStock} remaining`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-10 md:col-span-7 md:justify-end">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1.5 px-4 shadow-sm">
                                <button onClick={() => handleQuantityUpdate(variant, -moq)} disabled={variant.quantity <= moq} className="p-1 text-[#3E442B] hover:text-[#EA638C] disabled:opacity-20"><MinusIcon className="w-4 h-4 stroke-[3px]" /></button>
                                <span className="w-6 text-sm font-black text-center text-[#3E442B]">{variant.quantity}</span>
                                <button onClick={() => handleQuantityUpdate(variant, moq)} disabled={variant.quantity + moq > variant.stock} className="p-1 text-[#3E442B] hover:text-[#EA638C] disabled:opacity-10"><PlusIcon className="w-4 h-4 stroke-[3px]" /></button>
                              </div>
                            </div>

                            <div className="text-right min-w-[120px]">
                              <div className="flex flex-col">
                                {isDiscounted && (
                                  <span className="text-[10px] text-gray-300 line-through font-bold">
                                    ৳{(variant.basePrice * variant.quantity).toLocaleString()}
                                  </span>
                                )}
                                <p className={`text-base italic font-bold font-serif tracking-tighter ${isDiscounted ? 'text-[#EA638C]' : 'text-[#3E442B]'}`}>
                                  ৳{(variant.price * variant.quantity).toLocaleString()}
                                </p>
                              </div>
                              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Sub-Total</p>
                            </div>
                            <button onClick={() => deleteSelectedItems([variant.uniqueKey])} className="p-1 text-gray-300 transition-colors hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
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
              <h2 className="mb-8 text-xl italic font-bold font-serif tracking-tighter text-[#3E442B] uppercase">Bag Summary</h2>
              <div className="mb-8 space-y-5">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <span>Items Total</span>
                  <span className="text-[#3E442B]">৳{subtotal.toLocaleString()}</span>
                </div>
                
                {user?.isVIP && (
                   <div className="flex justify-between text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em] bg-[#FBB6E6]/30 p-2 rounded-lg">
                    <span>VIP Member (5%)</span>
                    <span>- ৳{vipDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-6 border-t border-gray-100">
                  <span className="text-sm italic font-bold font-serif text-[#3E442B] uppercase">Net Amount</span>
                  <span className="text-4xl italic font-bold font-serif tracking-tighter text-[#3E442B]">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={selectedItems.length === 0 || isPending} 
                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2
                  ${isPending ? 'bg-gray-400' : 'bg-[#3E442B] hover:bg-[#EA638C] text-white'} 
                  ${selectedItems.length === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
              >
                {isPending ? "Processing..." : selectedItems.length === 0 ? "Select Items" : "Go to Checkout"}
              </button>

              <p className="mt-6 text-[8px] text-center text-gray-400 font-bold uppercase tracking-widest">
                Wholesale discounts and stock are reserved for 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}