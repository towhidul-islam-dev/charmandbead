"use client";

import { Zap, ShieldCheck } from "lucide-react";

export default function VIPBadge({ type = "member", size = "md" }) {
  const isVIP = type === "vip";
  
  const sizes = {
    sm: "px-1.5 py-0.5 text-[8px] gap-0.5",
    md: "px-2.5 py-1 text-[10px] gap-1",
    lg: "px-4 py-2 text-[12px] gap-1.5",
  };

  const iconSizes = { sm: 8, md: 10, lg: 14 };

  // Tier Styles
  const styles = isVIP 
    ? "bg-[#3E442B] text-yellow-400 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]" 
    : "bg-[#EA638C]/10 text-[#EA638C] border-[#EA638C]/20";

  return (
    <div className={`
      relative overflow-hidden flex items-center justify-center font-black uppercase tracking-widest
      rounded-lg border shadow-sm transition-all duration-300
      ${sizes[size]} ${styles}
    `}>
      {/* Only VIP gets the shimmer effect */}
      {isVIP && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      )}
      
      {isVIP ? (
        <Zap size={iconSizes[size]} className="fill-yellow-400 animate-pulse" />
      ) : (
        <ShieldCheck size={iconSizes[size]} />
      )}

      <span>{isVIP ? "VIP Member" : "Verified Member"}</span>

      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}