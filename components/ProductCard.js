"use client";
import Link from "next/link";
import Image from "next/image"; 
import { useWishlist } from "@/Context/WishlistContext";
import { Heart, Sparkles, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const ProductCard = ({ product, index = 0 }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  
  const isFavorite = wishlist.some((item) => item._id === product._id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (isFavorite) {
      toast.error(`${product.name} is already in your wishlist!`, {
        icon: '💖',
        // Using Green #3E442B for the background of the error toast for a premium feel
        style: { borderRadius: '10px', background: '#3E442B', color: '#fff', fontSize: '12px' },
      });
    } else {
      toggleWishlist(product);
      toast.success("Added to wishlist", {
        // Using Pink #EA638C for the success toast
        style: { borderRadius: '10px', background: '#EA638C', color: '#fff', fontSize: '12px' },
      });
    }
  };

  return (
    <div className={`relative overflow-hidden transition-all duration-300 bg-white rounded-[2rem] shadow-lg hover:shadow-2xl group border border-gray-100 ${isOutOfStock ? "opacity-75" : ""}`}>
      
      {/* BADGES - Updated to Brand Colors */}
      <div className="absolute z-10 flex flex-col gap-2 top-3 left-3">
        {product.isNewArrival && !isOutOfStock && (
          // Brand Pink: #EA638C
          <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-black text-white uppercase bg-[#EA638C] rounded-full shadow-md animate-pulse">
            <Sparkles size={10} /> New Arrival
          </div>
        )}
        {isOutOfStock ? (
          <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-black text-white uppercase bg-gray-500 rounded-full shadow-md">
            Out of Stock
          </div>
        ) : isLowStock ? (
          // Light Pink: #FBB6E6 with Green Text for contrast
          <div className="flex items-center gap-1 px-3 py-1 text-[10px] font-black text-[#3E442B] uppercase bg-[#FBB6E6] rounded-full shadow-md">
            <AlertTriangle size={10} /> Only {product.stock} Left
          </div>
        ) : null}
      </div>

      {/* WISHLIST BUTTON - Updated to Brand Pink */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-90 border border-gray-100"
      >
        <Heart 
          size={18} 
          className={isFavorite ? "fill-[#EA638C] text-[#EA638C]" : "text-gray-400"} 
        />
      </button>

      {/* OPTIMIZED IMAGE CONTAINER */}
      <Link href={`/product/${product._id}`}>
        <div className={`relative w-full h-72 overflow-hidden bg-gray-50 ${isOutOfStock ? "grayscale" : ""}`}>
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={index < 4} 
            loading={index < 4 ? "eager" : "lazy"}
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

      {/* INFO SECTION */}
      <div className="p-5">
        <div className="mb-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</p>
          <h3 className="font-black leading-tight text-[#3E442B] truncate text-md">{product.name}</h3>
        </div>

        {!isOutOfStock && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Availability</span>
              <span className={`text-[9px] font-black uppercase ${isLowStock ? 'text-[#EA638C]' : 'text-[#3E442B]'}`}>
                {product.stock} Units Left
              </span>
            </div>
            <div className="w-full h-1 overflow-hidden bg-gray-100 rounded-full">
              {/* Progress bar uses Brand Green #3E442B or Pink #EA638C */}
              <div 
                className={`h-full transition-all duration-1000 ${isLowStock ? 'bg-[#EA638C]' : 'bg-[#3E442B]'}`}
                style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }} 
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-black text-[#3E442B]">
            ৳{Number(product.price || 0).toLocaleString()}
          </span>

          <Link
            href={`/products/${product._id}`}
            className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl ${
              isOutOfStock 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-[#EA638C] text-white hover:bg-[#3E442B] shadow-lg"
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