"use client";
import Link from "next/link";
import Image from "next/image"; 
import { useWishlist } from "@/Context/WishlistContext";
import { useSession } from "next-auth/react"; 
import { Heart, Sparkles, Share2, Package } from "lucide-react"; 
import toast from "react-hot-toast";

const ProductCard = ({ product, index = 0 }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { data: session } = useSession(); 
  const user = session?.user; 
  
  const isFavorite = wishlist?.some((item) => item._id === product?._id);
  const isOutOfStock = product?.stock <= 0;
  const isLowStock = product?.stock > 0 && product?.stock <= 5;

  const moqValue = product?.variants?.[0]?.minOrderQuantity || 0;

  const isRecentlyCreated = product?.createdAt 
    ? (new Date() - new Date(product.createdAt)) < (48 * 60 * 60 * 1000) 
    : false;
  
  const showNewBadge = (product?.isNewArrival || isRecentlyCreated) && !isOutOfStock;

  const handleShare = (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/products/${product?._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!", {
      style: { borderRadius: '10px', background: '#3E442B', color: '#fff', fontSize: '10px' },
    });
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (isFavorite) {
      toast.error(`Already in wishlist!`, {
        icon: '💖',
        style: { borderRadius: '10px', background: '#3E442B', color: '#fff', fontSize: '10px' },
      });
    } else {
      toggleWishlist(product);
      toast.success("Added to wishlist", {
        style: { borderRadius: '10px', background: '#EA638C', color: '#fff', fontSize: '10px' },
      });
    }
  };

  if (!product) return null;

  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden">
      
      {/* IMAGE CONTAINER */}
      <div className="relative w-full overflow-hidden aspect-square bg-gray-50">
        <Link href={`/products/${product._id}`} className="relative z-0 block w-full h-full">
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? "grayscale" : ""}`}
            priority={index < 4} 
          />

          {/* MOQ BADGE */}
          {moqValue > 0 && !isOutOfStock && (
            <div className="absolute z-20 transition-all duration-500 transform translate-y-2 opacity-0 bottom-3 left-3 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="bg-[#3E442B] border-2 border-[#FBB6E6]/40 px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2">
                <span className="text-[10px] font-black text-[#FBB6E6] uppercase tracking-wider">
                  MOQ :
                </span>
                <span className="text-sm font-black text-white">
                  {moqValue}
                </span>
                <span className="text-[9px] font-black text-[#FBB6E6] uppercase">
                  Pcs
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* TOP BADGES */}
        <div className="absolute z-10 flex flex-col gap-1 top-3 left-3">
          {showNewBadge && (
            <div className="flex items-center gap-1 px-3 py-1 text-[9px] font-black text-white bg-[#EA638C] rounded-lg shadow-md uppercase">
              <Sparkles size={10} /> NEW
            </div>
          )}
          {isOutOfStock && (
            <div className="px-3 py-1 text-[9px] font-black text-white bg-gray-500 rounded-lg uppercase">SOLD</div>
          )}
        </div>

        {/* FLOATING ACTIONS */}
        {user && (
          <div className="absolute z-30 flex flex-col gap-2 transition-all duration-300 translate-x-12 opacity-0 top-3 right-3 group-hover:translate-x-0 group-hover:opacity-100">
            {/* 🟢 ADDED ARIA-LABEL FOR WISHLIST */}
            <button 
              onClick={handleWishlistClick} 
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              className="p-2.5 rounded-full bg-white shadow-md hover:bg-[#EA638C] group/heart transition-colors"
            >
              <Heart size={16} className={isFavorite ? "fill-[#EA638C] text-[#EA638C]" : "text-gray-400 group-hover/heart:text-white"} />
            </button>
            
            {/* 🟢 ADDED ARIA-LABEL FOR SHARE */}
            <button 
              onClick={handleShare} 
              aria-label="Share product link"
              className="p-2.5 rounded-full bg-white shadow-md hover:bg-[#3E442B] group/share transition-colors"
            >
              <Share2 size={16} className="text-gray-400 group-hover/share:text-white" />
            </button>
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <div className="flex flex-col flex-grow p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">{product.category}</p>
              
              {moqValue > 0 && (
                <div className="flex items-center gap-1 mt-1 md:hidden">
                    <Package size={10} className="text-[#3E442B]" />
                    <span className="text-[10px] font-black text-[#3E442B] uppercase tracking-tighter">MOQ : {moqValue}</span>
                </div>
              )}
            </div>
            <span className="text-lg font-black text-[#3E442B]">৳{product.price}</span>
          </div>
          <h3 className="font-bold text-base text-[#3E442B] mt-1 truncate group-hover:text-[#EA638C] transition-colors leading-tight">
            {product.name}
          </h3>
        </div>

        {/* STOCK BAR */}
        {!isOutOfStock && (
          <div className="mb-4">
            <div className="w-full h-1 overflow-hidden bg-gray-100 rounded-full">
              <div 
                className={`h-full transition-all duration-1000 ${isLowStock ? 'bg-[#EA638C]' : 'bg-[#3E442B]'}`}
                style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }} 
              />
            </div>
            <p className={`text-[8px] font-black uppercase mt-1 ${isLowStock ? 'text-[#EA638C]' : 'text-gray-400'}`}>
              {isLowStock ? `Only ${product.stock} Left` : `${product.stock} in stock`}
            </p>
          </div>
        )}

        <Link
          href={`/products/${product._id}`}
          className={`mt-auto w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-center transition-all rounded-2xl ${
            isOutOfStock 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-[#EA638C] text-white hover:bg-[#3E442B] shadow-sm hover:shadow-lg"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Details"}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;