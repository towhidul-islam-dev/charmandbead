"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCcw, MessageCircle, AlertCircle } from "lucide-react";
import SupportDrawer from "@/components/PaymentFailedPage";

function FailedContent() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); 
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (isSupportOpen) return; 

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard/checkout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSupportOpen, router]);

  const progressPercentage = (timeLeft / 60) * 100;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-[-5%] right-[-5%] w-48 h-48 bg-[#FBB6E6]/15 blur-[80px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-[#3E442B]/5 blur-[80px] rounded-full" />

      {/* Main Container - Shrinked width to 340px */}
      <div className="relative w-full max-w-[340px] p-[2px] rounded-[2.5rem] overflow-hidden">
        
        {/* The Border Progress */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-linear"
          style={{
            background: `conic-gradient(#EA638C ${progressPercentage}%, #F3F4F6 ${progressPercentage}%)`
          }}
        />

        {/* The Card Content - Reduced Padding */}
        <div className="relative bg-white rounded-[2.4rem] p-6 md:p-8 text-center z-10">
          
          <div className="flex justify-center mb-6">
            <div className="bg-pink-50 p-4 rounded-full shadow-inner relative">
              <XCircle size={48} className="text-[#EA638C]" strokeWidth={1.5} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#EA638C] rounded-full border-2 border-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-xl italic font-black text-[#3E442B] mb-2 tracking-tighter uppercase">
            Payment <span className="text-[#EA638C]">Failed</span>
          </h1>
          <p className="text-gray-400 font-bold text-[11px] mb-6 leading-tight uppercase tracking-tight px-4">
            Something went wrong. No money was deducted from your account.
          </p>

          {/* Compact Info Box */}
          <div className="bg-[#3E442B]/5 rounded-2xl p-4 mb-6 border border-[#3E442B]/10 text-left">
            <div className="flex gap-2.5 items-center">
              <AlertCircle size={14} className="text-[#EA638C] shrink-0" />
              <div>
                <p className="text-[9px] font-black text-[#3E442B]/60 leading-none">
                  Redirecting in <span className="text-[#EA638C]">{timeLeft}s</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Shorter height */}
          <div className="space-y-3">
            <Link
              href="/dashboard/checkout"
              className="w-full bg-[#3E442B] text-white flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-[#3E442B]/10 active:scale-[0.98]"
            >
              <RefreshCcw size={14} />
              Try Paying Again
            </Link>
            
            <button
              onClick={() => setIsSupportOpen(true)}
              className="w-full bg-white text-gray-400 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-gray-100 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <MessageCircle size={14} />
              Contact Support
            </button>
          </div>

          <p className="mt-6 text-[7px] font-black text-gray-300 uppercase tracking-[0.4em]">
            Registry ID: {orderId?.slice(-6).toUpperCase() || "WHLS-M"}
          </p>
        </div>
      </div>

      <SupportDrawer 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        orderId={orderId} 
      />
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <FailedContent />
    </Suspense>
  );
}