"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle, X, Check } from "lucide-react";
import { deleteUser } from "@/actions/userActions"; // Ensure path is correct
import toast from "react-hot-toast";

export default function DeleteUserButton({ userId, userName, isSuperAdmin }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safety: Don't show for Super Admins
  if (isSuperAdmin) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success(`${userName} removed from system`);
        setIsConfirming(false);
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 duration-200 animate-in slide-in-from-right-2">
        <span className="text-[9px] font-black uppercase text-red-500 tracking-tighter">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          disabled={loading}
          className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="p-2 text-gray-400 transition-all duration-200 rounded-xl hover:bg-red-50 hover:text-red-500 group"
      title={`Delete ${userName}`}
    >
      <Trash2 size={18} className="transition-transform group-hover:scale-110" />
    </button>
  );
}