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
  PlusCircleIcon,
  BoltIcon, // Added for VIP flair
} from "@heroicons/react/24/outline";

export default function CartPage({ initialItems = [], isAdminPreview = false, user = null }) {
  const router = useRouter();
  const {
    cart: globalCart,
    addToCart,
    removeFromCart,
    deleteSelectedItems,
    clearCart,
  } = useCart();

  const cart = useMemo(() => {
    return globalCart.length > 0 ? globalCart : initialItems;
  }, [globalCart, initialItems]);

  const [selectedItems, setSelectedItems] = useState([]);

  // Auto-select items logic
  useEffect(() => {
    if (isAdminPreview && cart.length > 0) {
      setSelectedItems(cart.map((item) => item.uniqueKey));
    }
  }, [cart, isAdminPreview]);

  const groupedCart = useMemo(() => {
    return cart.reduce((acc, item) => {
      const pId = item.productId;
      if (!acc[pId]) {
        acc[pId] = {
          productId: pId,
          name: item.name,
          imageUrl: item.imageUrl,
          items: [],
        };
      }
      acc[pId].items.push(item);
      return acc;
    }, {});
  }, [cart]);

  // 🟢 CALCULATION LOGIC WITH VIP DISCOUNT
  const subtotal = useMemo(() => {
    return cart
      .filter((item) => selectedItems.includes(item.uniqueKey))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart, selectedItems]);

  const vipDiscountAmount = useMemo(() => {
    // 5% discount if user is VIP
    if (user?.isVIP && subtotal > 0) {
      return (subtotal * 0.05);
    }
    return 0;
  }, [user, subtotal]);

  const finalTotal = subtotal - vipDiscountAmount;

  const handleCheckout = () => {
    if (isAdminPreview) {
        toast.success("Checkout works! (Disabled in Preview)");
        return;
    }
    if (selectedItems.length === 0) {
        toast.error("Please select items to checkout");
        return;
    }
    // Pass the final total and discount info to the next step
    router.push("/dashboard/checkout");
  };

  // ... (toggleSelect, toggleSelectAll, toggleProductGroup functions remain the same)

  const toggleSelect = (uniqueKey) => {
    setSelectedItems((prev) =>
      prev.includes(uniqueKey) ? prev.filter((id) => id !== uniqueKey) : [...prev, uniqueKey]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.uniqueKey));
    }
  };

  const toggleProductGroup = (items) => {
    const itemKeys = items.map((i) => i.uniqueKey);
    const allSelected = itemKeys.every((key) => selectedItems.includes(key));
    if (allSelected) {
      setSelectedItems((prev) => prev.filter((key) => !itemKeys.includes(key)));
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...itemKeys])]);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-20">
        <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
        <h2 className="mb-2 text-2xl italic font-black text-gray-800 uppercase">Empty Cart</h2>
        {!isAdminPreview && (
            <Link href="/products" className="mt-4 bg-[#EA638C] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest">
                Start Shopping
            </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full bg-white ${!isAdminPreview ? 'min-h-screen pt-32 pb-20 px-4' : 'p-2'}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-10 md:flex-row md:items-end">
          <div className="space-y-1">
            <h1 className="text-3xl italic font-black tracking-tighter text-gray-900 uppercase">
                {isAdminPreview ? "Cart Preview" : "Shopping Cart"}
            </h1>
            {user?.isVIP && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 rounded-full">
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-black tracking-widest">VIP Member Benefits Active</span>
                </div>
            )}
          </div>
          <div className="flex gap-3">
            {selectedItems.length > 0 && (
              <button
                onClick={() => deleteSelectedItems(selectedItems) && setSelectedItems([])}
                className="bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
            {!isAdminPreview && (
                <button onClick={() => confirm("Clear all?") && clearCart()} className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-2xl font-bold text-sm">
                    Clear All
                </button>
            )}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center gap-3 p-4 px-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
              <input type="checkbox" className="w-5 h-5 accent-[#EA638C] cursor-pointer" checked={selectedItems.length === cart.length && cart.length > 0} onChange={toggleSelectAll} />
              <span className="text-sm font-bold tracking-widest text-gray-600 uppercase">Select All Items ({cart.length})</span>
            </div>

            {/* PRODUCT GROUPS */}
            {Object.entries(groupedCart).map(([productId, group]) => (
              <div key={productId} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-gray-50/50">
                  <input type="checkbox" className="w-5 h-5 accent-[#EA638C] cursor-pointer" checked={group.items.every(i => selectedItems.includes(i.uniqueKey))} onChange={() => toggleProductGroup(group.items)} />
                  <img src={group.imageUrl} className="object-cover border border-white shadow-sm w-14 h-14 rounded-2xl" alt={group.name} />
                  <div className="flex-1">
                    <h3 className="text-base italic font-black leading-tight text-gray-900 uppercase">{group.name}</h3>
                    {!isAdminPreview && (
                        <Link href={`/products/${productId}`} className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1 mt-1 hover:underline">
                            <PlusCircleIcon className="w-3 h-3" /> Add another size/color
                        </Link>
                    )}
                  </div>
                </div>

                {/* TABLE HEADERS */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 bg-gray-50/30 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="col-span-6">Items Variant</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Stock</div>
                    <div className="col-span-2 text-center">Quantity</div>
                </div>

                <div className="divide-y divide-gray-50">
                  {group.items.map((item) => {
                    const itemMoq = item.minOrderQuantity || 1; 
                    const displayStock = (item.stock || 0);
                    
                    return (
                      <div key={item.uniqueKey} className="grid items-center grid-cols-1 gap-4 p-6 md:grid-cols-12">
                        <div className="flex items-center col-span-1 gap-4 md:col-span-6">
                          <input type="checkbox" className="w-4 h-4 accent-[#EA638C] cursor-pointer" checked={selectedItems.includes(item.uniqueKey)} onChange={() => toggleSelect(item.uniqueKey)} />
                          <img src={item.imageUrl} className="object-cover w-10 h-10 border border-gray-100 rounded-lg" alt="variant" />
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              {item.color} {item.size !== "Standard" ? `/ ${item.size}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="col-span-1 text-center md:col-span-2">
                            <p className="text-[#EA638C] font-black text-base">৳{item.price}</p>
                        </div>

                        <div className="col-span-1 text-center md:col-span-2">
                            <p className="text-xs font-black text-gray-900">{displayStock}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Available</p>
                        </div>

                        <div className="flex items-center justify-center col-span-1 gap-4 md:col-span-2">
                          <div className="flex items-center gap-3 p-1 px-3 bg-gray-100 rounded-2xl">
                            <button onClick={() => addToCart(item, -itemMoq)} disabled={item.quantity <= 0 || isAdminPreview} className="p-1 hover:text-[#EA638C] transition-colors disabled:opacity-30">
                                <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-sm font-black text-center">{item.quantity}</span>
                            <button 
                                onClick={() => (item.quantity + itemMoq > item.stock) ? toast.error("Max Stock reached") : addToCart(item, itemMoq)} 
                                disabled={isAdminPreview}
                                className="p-1 hover:text-[#EA638C] transition-colors disabled:opacity-30"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 h-fit sticky top-32 overflow-hidden">
            {/* VIP Glow Effect */}
            {user?.isVIP && <div className="absolute top-0 right-0 p-4 opacity-5"><ZapIcon className="w-32 h-32 text-yellow-500 rotate-12" /></div>}
            
            <h2 className="relative z-10 mb-6 text-xl italic font-black text-gray-900 uppercase">Summary</h2>
            
            <div className="relative z-10 mb-8 space-y-4">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              
              {user?.isVIP && (
                <div className="flex justify-between text-[10px] font-black text-green-500 uppercase tracking-widest">
                  <span>VIP Discount (5%)</span>
                  <span>- ৳{vipDiscountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 text-2xl font-black text-gray-900 border-t border-gray-100">
                <span className="italic uppercase">Total</span>
                <span>৳{finalTotal.toLocaleString()}</span>
              </div>
              
              {user?.isVIP && (
                 <p className="text-[9px] font-black text-gray-400 uppercase text-center mt-4">
                    🎉 You saved ৳{vipDiscountAmount.toLocaleString()} with VIP!
                 </p>
              )}
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="w-full bg-black text-white py-5 rounded-[2rem] font-black flex justify-center items-center gap-3 uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-[#EA638C] transition-all disabled:opacity-30 active:scale-95"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}