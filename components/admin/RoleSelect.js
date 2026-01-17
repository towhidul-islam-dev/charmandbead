"use client";

import { updateUserRole } from "@/actions/userActions"; // Ensure this matches your file name
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function RoleSelect({ userId, currentRole }) {
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (newRole) => {
    setLoading(true);
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      toast.success(`Role updated to ${newRole}`);
    } else {
      toast.error("Failed to update role");
    }
    setLoading(false);
  };

  return (
    <div className="relative inline-block w-28 group">
      <select
        defaultValue={currentRole}
        disabled={loading}
        onChange={(e) => handleRoleChange(e.target.value)}
        className={`w-full appearance-none px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none transition-all
          ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"}
          ${currentRole === "admin" 
            ? "bg-red-50 text-red-600 border border-red-100" 
            : "bg-green-50 text-green-600 border border-green-100"
          }`}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      
      {/* 💡 THE ARROW */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown 
          size={12} 
          className={`${currentRole === "admin" ? "text-red-400" : "text-green-400"} transition-transform group-hover:translate-y-0.5`} 
        />
      </div>
    </div>
  );
}