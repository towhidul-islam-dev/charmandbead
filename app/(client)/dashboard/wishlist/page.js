"use client";
import { useState, useEffect } from "react";
import { useWishlist } from "@/Context/WishlistContext";
import { useCart } from "@/Context/CartContext";
import { HeartOff, ShoppingCart, Trash2, LayoutGrid, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recently_viewed_j_materials") || "[]");
    // Match against both id and _id for safety
    const filtered = saved.filter(s => !wishlist.some(w => (w._id === s._id || w.id === s.id)));
    setRecentItems(filtered.slice(0, 4));
  }, [wishlist]);

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((product) => {
      // Use helper to find ID
      const pId = product._id || product.id;
      const defaultVariant = product.variants?.[0] || null;
      addToCart(product, defaultVariant, 1);
    });
    toast.success(`Moved ${wishlist.length} items to bag! 🛍️`);
  };

  // Helper to safely handle add to cart button click
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the Link wrapper from triggering
    
    // Ensure we send a valid variant if your Context requires it
    const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    
    addToCart(product, variant, 1);
    toast.success(`${product.name.substring(0, 15)}... added to bag`);
  };

  const handleRemove = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-gray-50 p-8 rounded-[3rem] mb-6">
          <HeartOff size={64} className="text-gray-200" />
        </div>
        <h1 className="mb-2 text-3xl font-black text-gray-900">Your wishlist is empty</h1>
        <p className="mb-8 font-medium text-gray-500">Save items you like to buy them later!</p>
        <Link
          href="/products"
          className="bg-[#3E442B] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-lg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl min-h-screen px-4 py-16 mx-auto">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 mb-10 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-black text-[#3E442B] tracking-tight mb-2 font-serif italic">My Wishlist</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FBB6E6]/20 text-[#EA638C] px-4 py-1.5 rounded-full border border-[#FBB6E6]/40">
              <LayoutGrid size={14} />
              <span className="text-xs font-black tracking-wider uppercase">
                {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleMoveAllToCart}
          className="bg-[#3E442B] text-white flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
        >
          <ShoppingBag size={18} /> Move All to Bag
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Wishlist Items</h2>

        {wishlist.map((product) => {
          const productId = product._id || product.id; // Support both ID types
          return (
            <div
              key={productId}
              className="bg-white border border-gray-100 rounded-[2rem] p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 group relative"
            >
              {/* Image & Info wrapped in Link */}
              <Link href={`/products/${productId}`} className="flex flex-col items-center flex-grow w-full gap-6 md:flex-row">
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-50 rounded-[1.5rem] overflow-hidden flex-shrink-0">
                  <Image
                    src={Array.isArray(product?.imageUrl) ? product.imageUrl[0] : product?.imageUrl || "/placeholder.png"}
                    alt={product?.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="160px"
                    unoptimized
                  />
                </div>

                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-lg font-black text-[#3E442B] leading-snug mb-2 line-clamp-2 max-w-md group-hover:text-[#EA638C] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-black text-gray-900">৳{product.price}</p>
                    {product.oldPrice && <p className="text-sm font-bold text-gray-400 line-through">৳{product.oldPrice}</p>}
                  </div>
                </div>
              </Link>

              {/* Action Buttons - Outside of Link for clarity */}
              <div className="z-10 flex flex-col w-full gap-3 md:w-48">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="bg-[#FBB6E6] text-[#3E442B] flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#EA638C] hover:text-white transition-all shadow-md"
                >
                  <ShoppingCart size={16} /> Add to Bag
                </button>

                <button
                  onClick={(e) => handleRemove(e, productId)}
                  className="flex items-center justify-center gap-2 py-3 text-xs font-black tracking-widest text-gray-400 uppercase transition-all bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Recently Viewed... */}
    </div>
  );
}