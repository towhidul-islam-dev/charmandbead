"use client";
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function AddressDeleteModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-red-100 p-3 rounded-2xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Address?</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          This will permanently remove your saved shipping details. You'll need to re-enter them for your next order.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loading ? "Removing..." : "Yes, Delete Address"}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}