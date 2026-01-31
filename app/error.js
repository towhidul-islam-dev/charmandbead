"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-white">
      <div className="bg-pink-50/50 p-12 rounded-[3rem] border-2 border-dashed border-[#FBB6E6] text-center max-w-lg">
        <div className="w-16 h-16 bg-[#EA638C] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
          <AlertCircle size={32} />
        </div>
        
        <h2 className="text-3xl font-black text-[#3E442B] italic uppercase tracking-tighter mb-4">
          System <span className="text-[#EA638C]">Hiccup</span>
        </h2>
        
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8 leading-relaxed">
          Something went wrong on our end. We've been notified <br /> and are looking into it.
        </p>

        <button
          onClick={() => reset()}
          className="flex items-center gap-3 px-8 py-4 bg-[#3E442B] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] mx-auto hover:opacity-90 transition-all"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}