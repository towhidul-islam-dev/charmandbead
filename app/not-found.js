import Link from "next/link";
import { MoveLeft, PackageSearch } from "lucide-react";

// Brand Colors: Green: #3E442B | Pink: #EA638C | lightPink: #FBB6E6

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="max-w-md space-y-8 text-center">
        {/* Animated Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#FBB6E6] rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
            <PackageSearch size={64} strokeWidth={1} className="text-[#3E442B]" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black italic tracking-tighter text-[#3E442B] uppercase">
            Lost <span className="text-[#EA638C]">Item?</span>
          </h1>
          <p className="text-xs font-bold leading-loose tracking-widest text-gray-400 uppercase">
            The product or page you are looking for has been moved <br /> or doesn't exist in our current registry.
          </p>
        </div>

        <Link 
          href="/products" 
          className="inline-flex items-center gap-3 px-10 py-5 bg-[#3E442B] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#EA638C] transition-all shadow-xl shadow-[#3E442B]/10 active:scale-95"
        >
          <MoveLeft size={16} /> Return to Shop
        </Link>
      </div>
    </div>
  );
}