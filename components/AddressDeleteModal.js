"use client";
import React from "react";
import { Trash2, X } from "lucide-react";

export default function AddressDeleteModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon */}
        <button 
          onClick={onClose}
          className="absolute text-gray-300 transition-colors right-6 top-6 hover:text-gray-500"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          {/* Icon Header */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-pink-50 text-[#EA638C]">
            <Trash2 size={28} />
          </div>

          <h3 className="text-xl font-black italic uppercase tracking-tighter text-[#3E442B] mb-2">
            Clear Address?
          </h3>
          <p className="px-4 mb-8 text-sm font-bold leading-relaxed text-gray-400">
            Are you sure you want to remove your saved shipping info? You'll need to re-enter it for your next order.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-[#EA638C] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-pink-200 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Clearing..." : "Yes, Remove it"}
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-gray-50 text-[#3E442B] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}