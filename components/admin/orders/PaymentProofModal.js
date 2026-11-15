"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Maximize2 } from "lucide-react";

export default function PaymentProofModal({ data, onClose }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!data) return null;

  return (
    <>
      {/* Main Payment Details Modal */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl relative space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-black text-[#3E442B] uppercase tracking-wider">Payment Proof</h3>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-2 text-xs font-bold text-gray-600 bg-gray-50 rounded-2xl">
            <p>Sender/Phone: <span className="text-[#3E442B] font-mono">{data.sender || "N/A"}</span></p>
            <p>Transaction ID: <span className="text-[#3E442B] font-mono">{data.txnId || "N/A"}</span></p>
          </div>

          {data.screenshot && (
            <div 
              onClick={() => setIsFullScreen(true)}
              className="relative w-full h-56 overflow-hidden border border-gray-100 rounded-2xl bg-gray-50 cursor-zoom-in group"
            >
              <Image src={data.screenshot} alt="Payment Proof" fill className="object-contain" unoptimized />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Maximize2 size={24} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {isFullScreen && data.screenshot && (
        <div 
          onClick={() => setIsFullScreen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fadeIn cursor-zoom-out"
        >
          <button 
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
            <Image 
              src={data.screenshot} 
              alt="Payment Proof Fullscreen" 
              fill 
              className="object-contain" 
              unoptimized 
            />
          </div>
        </div>
      )}
    </>
  );
}