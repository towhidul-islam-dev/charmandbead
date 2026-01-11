"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home, ShoppingBag } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 text-center bg-white">
      <div className="w-full max-w-md">
        {/* Animated Icon Container */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-[#EA638C]/10 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-white border border-gray-100 rounded-[2.5rem] flex items-center justify-center text-[#3E442B] shadow-xl">
            <WifiOff size={40} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-[#3E442B] uppercase italic tracking-tighter mb-4">
          Lost in the <br /> <span className="text-[#EA638C]">Clouds?</span>
        </h1>
        
        <p className="mb-10 text-sm font-medium leading-relaxed text-gray-500">
          It looks like your connection has been interrupted. Don't worry, your cart and wishlist are saved. We'll be ready when you are.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handleRetry}
            className="flex items-center justify-center gap-3 bg-[#3E442B] text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all group"
          >
            <RefreshCw size={16} className="transition-transform duration-500 group-active:rotate-180" />
            Try Reconnecting
          </button>

          <div className="flex gap-4">
            <Link 
              href="/" 
              className="flex-1 flex items-center justify-center gap-2 border border-gray-100 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
            >
              <Home size={14} /> Home
            </Link>
            <Link 
              href="/dashboard/orders" 
              className="flex-1 flex items-center justify-center gap-2 border border-gray-100 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
            >
              <ShoppingBag size={14} /> My Orders
            </Link>
          </div>
        </div>

        <p className="mt-12 text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Charm & Bead | Offline Mode
        </p>
      </div>
    </div>
  );
}