"use client";
import { useState, useMemo } from "react";
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
} from "@heroicons/react/24/outline";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    addToCart,
    removeFromCart,
    deleteSelectedItems,
    clearCart,
  } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);

  // Group items by productId so we can show "Add More" per product
  const groupedCart = useMemo(() => {
    return cart.reduce((acc, item) => {
      const pId = item.productId;
      if (!acc[pId]) {
        acc[pId] = {
          productId: pId, // Keep ID for the link
          name: item.name,
          imageUrl: item.imageUrl,
          items: [],
        };
      }
      acc[pId].items.push(item);
      return acc;
    }, {});
  }, [cart]);

  const selectedTotal = useMemo(() => {
    return cart
      .filter((item) => selectedItems.includes(item.uniqueKey))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart, selectedItems]);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select items to checkout");
      return;
    }

    const itemsToProcess = cart.filter(item => selectedItems.includes(item.uniqueKey));
    
    // Validate that no item has fallen below its specific MOQ
    const invalidItem = itemsToProcess.find(item => {
      const minRequired = item.minOrderQuantity || 1;
      return item.quantity < minRequired;
    });

    if (invalidItem) {
      toast.error(
        `Invalid quantity for ${invalidItem.name}. Min order is ${invalidItem.minOrderQuantity}.`,
        { duration: 4000, icon: '⚠️' }
      );
      return;
    }

    localStorage.setItem("checkout_data", JSON.stringify(itemsToProcess));
    router.push("/dashboard/checkout");
  };

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
      <div className="min-h-screen px-4 pt-40 text-center">
        <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
        <h2 className="mb-2 text-2xl font-black text-gray-800">Your cart is empty</h2>
        <Link href="/products" className="inline-block mt-4 bg-[#EA638C] text-white px-8 py-3 rounded-2xl font-black">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-32 pb-20 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-10 md:flex-row md:items-end">
          <h1 className="text-3xl font-black text-gray-900">Shopping Cart</h1>
          <div className="flex gap-3">
            {selectedItems.length > 0 && (
              <button
                onClick={() => deleteSelectedItems(selectedItems) && setSelectedItems([])}
                className="bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
            <button onClick={() => confirm("Clear all?") && clearCart()} className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-2xl font-bold text-sm">
              Clear All
            </button>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Select All Bar */}
            <div className="flex items-center gap-3 p-4 px-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
              <input type="checkbox" className="w-5 h-5 accent-[#EA638C] cursor-pointer" checked={selectedItems.length === cart.length} onChange={toggleSelectAll} />
              <span className="text-sm font-bold text-gray-600">Select All Items ({cart.length})</span>
            </div>

            {Object.entries(groupedCart).map(([productId, group]) => (
              <div key={productId} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* Group Header */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-gray-50/50">
                  <input type="checkbox" className="w-5 h-5 accent-[#EA638C] cursor-pointer" checked={group.items.every(i => selectedItems.includes(i.uniqueKey))} onChange={() => toggleProductGroup(group.items)} />
                  <img src={group.imageUrl} className="object-cover border border-white shadow-sm w-14 h-14 rounded-2xl" alt={group.name} />
                  <div className="flex-1">
                    <h3 className="text-base font-black leading-tight text-gray-900">{group.name}</h3>
                    {/* ADD VARIANT BUTTON */}
                    <Link 
                      href={`/products/${productId}`} 
                      className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1 mt-1 hover:underline"
                    >
                      <PlusCircleIcon className="w-3 h-3" /> Add another size/color
                    </Link>
                  </div>
                </div>

                {/* Items in Group */}
                <div className="divide-y divide-gray-50">
                  {group.items.map((item) => {
                    const itemMoq = item.minOrderQuantity || 1; 
                    
                    return (
                      <div key={item.uniqueKey} className="flex flex-wrap items-center justify-between gap-4 p-6 md:flex-nowrap">
                        <div className="flex items-center flex-1 gap-4">
                          <input type="checkbox" className="w-4 h-4 accent-[#EA638C] cursor-pointer" checked={selectedItems.includes(item.uniqueKey)} onChange={() => toggleSelect(item.uniqueKey)} />
                          <img src={item.imageUrl} className="object-cover w-10 h-10 border border-gray-100 rounded-lg" alt="variant" />
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              {item.color} {item.size !== "Standard" ? `/ ${item.size}` : ""}
                            </p>
                            <p className="text-[#EA638C] font-black text-lg">৳{item.price}</p>
                            {itemMoq > 1 && <p className="text-[9px] text-pink-500 font-bold uppercase italic">Wholesale Step: {itemMoq}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 p-1 px-3 bg-gray-100 rounded-2xl">
                            {/* MINUS BUTTON: Subtracts MOQ amount */}
                            <button
                              onClick={() => addToCart(item, -itemMoq)}
                              disabled={item.quantity <= itemMoq}
                              className="p-1 hover:text-[#EA638C] transition-colors disabled:opacity-30"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-sm font-black text-center">{item.quantity}</span>
                            {/* PLUS BUTTON: Adds MOQ amount */}
                            <button
                              onClick={() => addToCart(item, itemMoq)}
                              className="p-1 hover:text-[#EA638C] transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.uniqueKey)} className="p-2 text-gray-300 transition-colors hover:text-red-500">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 h-fit sticky top-32">
            <h2 className="mb-6 text-xl font-black text-gray-900">Order Summary</h2>
            <div className="mb-8 space-y-4">
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Items Selected</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="flex justify-between pt-4 text-2xl font-black text-gray-900 border-t border-gray-100">
                <span>Total</span>
                <span>৳{selectedTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="w-full bg-[#EA638C] text-white py-5 rounded-[2rem] font-black flex justify-center uppercase tracking-widest text-xs shadow-lg shadow-pink-100 hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              Checkout Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}