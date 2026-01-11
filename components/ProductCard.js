"use client";
import Link from "next/link";
import { useWishlist } from "@/Context/WishlistContext";
import { Heart, Sparkles, AlertTriangle, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  
  // Logic for Wishlist
  const isFavorite = wishlist.some((item) => item._id === product._id);

  // Logic for Stock
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (isFavorite) {
      // If already in wishlist, show popup notification
      toast.error(`${product.name} is already in your wishlist!`, {
        icon: 'ℹ️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold'
        },
      });
    } else {
      toggleWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  return (
    <div className={`relative overflow-hidden transition-all duration-300 bg-white rounded-[2rem] shadow-lg hover:shadow-2xl group border border-gray-100 ${isOutOfStock ? "opacity-75" : ""}`}>
      
      {/* BADGES CONTAINER */}
      <div className="absolute z-10 flex flex-col gap-2 top-3 left-3">
        {/* NEW ARRIVAL */}
        {product.isNewArrival && !isOutOfStock && (
          <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-black text-white uppercase bg-indigo-600 rounded-full shadow-md animate-pulse">
            <Sparkles size={10} />
            New
          </div>
        )}

        {/* OUT OF STOCK */}
        {isOutOfStock ? (
          <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-black text-white uppercase bg-red-500 rounded-full shadow-md">
            Out of Stock
          </div>
        ) : isLowStock ? (
          /* LOW STOCK */
          <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-black text-white uppercase bg-orange-500 rounded-full shadow-md">
            <AlertTriangle size={10} />
            Only {product.stock} Left
          </div>
        ) : null}
      </div>

      {/* WISHLIST BUTTON */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-90 border border-gray-100"
      >
        <Heart
          size={18}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
        />
      </button>

      {/* PRODUCT IMAGE */}
      <Link href={`/products/${product._id}`}>
        <div className={`relative w-full h-72 overflow-hidden bg-gray-50 ${isOutOfStock ? "grayscale" : ""}`}>
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
               <span className="bg-white/90 text-black font-black text-[10px] px-4 py-2 rounded-full uppercase tracking-tighter shadow-xl">
                 Currently Unavailable
               </span>
            </div>
          )}
        </div>
      </Link>

      {/* PRODUCT INFO */}
{/* PRODUCT INFO */}
<div className="p-5">
  <div className="mb-1">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</p>
    <h3 className="font-black leading-tight text-gray-900 truncate text-md">
      {product.name}
    </h3>
  </div>

  {/* STOCK PROGRESS INDICATOR */}
  {!isOutOfStock && (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">
          Availability
        </span>
        <span className={`text-[9px] font-black uppercase ${isLowStock ? 'text-orange-500' : 'text-green-600'}`}>
          {product.stock} Units Left
        </span>
      </div>
      <div className="w-full h-1 overflow-hidden bg-gray-100 rounded-full">
        <div 
          className={`h-full transition-all duration-1000 ${isLowStock ? 'bg-orange-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }} // Assuming 20 is "Full Stock"
        />
      </div>
    </div>
  )}
  
  <div className="flex items-center justify-between mt-4">
    <div className="flex flex-col">
      <span className="text-xl font-black text-gray-900">
        ৳{Number(product.price || 0).toLocaleString()}
      </span>
    </div>

    <Link
      href={`/products/${product._id}`}
      className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl ${
        isOutOfStock 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
        : "bg-brand-accent text-black hover:bg-black hover:text-white shadow-lg"
      }`}
    >
      {isOutOfStock ? "Sold Out" : "Details"}
    </Link>
  </div>
</div>
    </div>
  );
};

export default ProductCard;