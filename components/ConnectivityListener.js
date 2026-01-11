"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, X, ChevronRight } from "lucide-react"; // Added ChevronRight
import Link from "next/link"; // Added Link

export default function ConnectivityListener() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const goOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const goOffline = () => {
      setIsOnline(false);
      setShowToast(true);
      setHasNotified(true);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!showToast && isOnline) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-in fade-in slide-in-from-top-4 duration-500">
      <div
        className={`
        relative overflow-hidden rounded-2xl border p-4 shadow-2xl flex items-center justify-between gap-4
        ${
          isOnline
            ? "bg-green-50 border-green-100 text-green-800"
            : "bg-[#3E442B] border-white/10 text-white"
        }
      `}
      >
        {/* Progress Bar for Offline state */}
        {!isOnline && (
          <div className="absolute bottom-0 left-0 h-1 bg-[#EA638C] animate-pulse w-full" />
        )}

        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${isOnline ? "bg-green-500/10" : "bg-white/10"}`}
          >
            {isOnline ? (
              <Wifi size={18} />
            ) : (
              <WifiOff size={18} className="animate-bounce" />
            )}
          </div>
          <div>
            <p className="mb-1 text-sm italic font-black leading-none tracking-widest uppercase font-playfair">
              {isOnline ? "Back Online" : "Connection Lost"}
            </p>
            <p className="text-[10px] font-medium opacity-80">
              {isOnline
                ? "Your connection has been restored."
                : "Browsing in offline mode."}
            </p>
          </div>
        </div>

        {/* --- NEW: VIEW STATUS LINK --- */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Link
              href="/offline"
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 border border-white/5"
            >
              Status <ChevronRight size={12} />
            </Link>
          )}

          <button
            onClick={() => setShowToast(false)}
            className={`p-1 transition-colors rounded-lg ${isOnline ? "hover:bg-black/5" : "hover:bg-white/10"}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}