"use client";
import { useState, useEffect } from "react";
import { useWishlist } from "@/Context/WishlistContext";
import { useCart } from "@/Context/CartContext";
import { useSession } from "next-auth/react";
import { HeartOff, ShoppingCart, Trash2, LayoutGrid, ShoppingBag, Loader2, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { status } = useSession();
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [trendingItems, setTrendingItems] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/products/trending");
        if (res.ok) {
          const data = await res.json();
          setTrendingItems(data.filter(t => !wishlist.some(w => w._id === t._id)).slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching trending:", err);
      }
    };
    fetchTrending();
  }, [wishlist]);

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((product) => {
      const defaultVariant = product.variants?.[0] || null;
      addToCart(product, defaultVariant, 1);
    });
    toast.success(`Moved ${wishlist.length} items to bag! 🛍️`, {
      style: { background: '#3E442B', color: '#fff', borderRadius: '1rem' }
    });
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.[0] || null;
    addToCart(product, variant, 1);
    toast.success(`${product.name.substring(0, 15)}... added to bag`, {
      style: { background: '#EA638C', color: '#fff', borderRadius: '1rem' }
    });
  };

  const handleRemove = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(id);
  };

  if (!isClient || status === "loading" || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#3E442B]" />
        <p className="mt-4 font-serif italic font-medium text-gray-500">Finding your favorites...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#FBB6E6] rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative bg-gray-50 p-8 rounded-[3rem]">
            <HeartOff size={64} className="text-gray-200" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-[#3E442B] italic font-serif">Your wishlist is lonely</h1>
        <p className="mb-8 text-sm font-medium tracking-wide text-gray-400">
          Save items you love and they'll wait for you here!
        </p>
        <Link
          href="/products"
          className="bg-[#3E442B] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#EA638C] transition-all shadow-xl active:scale-95"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl min-h-screen px-4 py-16 mx-auto">
      
      {/* 🟢 LOGIN SYNC BANNER (Branded with Pink/Green) */}
      {status === "unauthenticated" && (
        <div className="mb-12 bg-[#3E442B] p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-transform opacity-10 group-hover:rotate-12">
            <Sparkles size={120} className="text-[#FBB6E6]" />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="p-4 border bg-white/10 rounded-2xl backdrop-blur-md border-white/10">
              <ShoppingBag className="text-[#FBB6E6]" size={28} />
            </div>
            <div>
              <h3 className="font-serif text-xl italic font-black text-white">Save these items forever?</h3>
              <p className="text-sm font-medium text-gray-300">Create an account to sync your wishlist across all your devices.</p>
            </div>
          </div>
          <Link 
            href="/login" 
            className="relative z-10 bg-[#FBB6E6] text-[#3E442B] px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95"
          >
            Login / Register
          </Link>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 mb-10 md:flex-row md:items-end">
        <div>
          <h1 className="text-5xl font-bold text-[#3E442B] tracking-tight mb-3 font-serif italic">My Wishlist</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FBB6E6]/30 text-[#EA638C] px-4 py-1.5 rounded-full border border-[#FBB6E6]/50">
              <LayoutGrid size={14} />
              <span className="text-[10px] font-black tracking-wider uppercase">
                {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleMoveAllToCart}
          className="bg-[#3E442B] text-white flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#EA638C] transition-all shadow-xl active:scale-95"
        >
          <ShoppingBag size={18} /> Move All to Bag
        </button>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {wishlist.map((product) => {
          const productId = product._id || product.id; 
          return (
            <div
              key={productId}
              className="bg-white border border-gray-100 rounded-[2rem] p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-pink-50/50 transition-all duration-300 group relative"
            >
              <Link href={`/products/${productId}`} className="flex flex-col items-center flex-grow w-full gap-6 md:flex-row">
                <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-50 rounded-[1.5rem] overflow-hidden flex-shrink-0">
                  <Image
                    src={Array.isArray(product?.imageUrl) ? product.imageUrl[0] : product?.imageUrl || "/placeholder.png"}
                    alt={product?.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="160px"
                  />
                </div>

                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-lg font-bold font-serif text-[#3E442B] leading-snug mb-2 line-clamp-2 max-w-md group-hover:text-[#EA638C] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-black text-gray-900">৳{Number(product.price).toLocaleString()}</p>
                  </div>
                </div>
              </Link>

              <div className="z-10 flex flex-col w-full gap-3 md:w-48">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="bg-[#FBB6E6] text-[#3E442B] flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#EA638C] hover:text-white transition-all shadow-md active:scale-95"
                >
                  <ShoppingCart size={16} /> Add to Bag
                </button>

                <button
                  onClick={(e) => handleRemove(e, productId)}
                  className="flex items-center justify-center gap-2 py-3 text-[10px] font-black tracking-widest text-gray-400 uppercase transition-all bg-white border border-gray-100 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95"
                >
                  <Trash2 size={16} /> Delete Item
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🟢 TRENDING SECTION (Branded) */}
      {trendingItems.length > 0 && (
        <div className="pt-16 mt-24 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-[#FBB6E6]/40 rounded-2xl text-[#EA638C]">
              <TrendingUp size={24} />
            </div>
            <h2 className="text-3xl font-bold text-[#3E442B] italic font-serif tracking-tight">Trending Right Now</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {trendingItems.map((item) => (
              <Link href={`/products/${item._id}`} key={item._id} className="group">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 mb-4 shadow-sm group-hover:shadow-xl transition-all border border-gray-100">
                  <Image 
                    src={Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl} 
                    alt={item.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-[#3E442B]/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <span className="bg-white text-[#3E442B] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg">View Details</span>
                  </div>
                </div>
                <h4 className="font-bold font-serif text-[#3E442B] text-sm truncate mb-1 group-hover:text-[#EA638C] transition-colors">{item.name}</h4>
                <p className="text-sm font-black text-gray-900">৳{Number(item.price).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}