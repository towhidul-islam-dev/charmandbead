"use client";

import { LogOut, ExternalLink } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminHeader({ user }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-40">
      
      {/* 🟢 HIDE ON MOBILE: Removed the cross-marked section for mobile layout */}
      <div className="hidden md:block">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Portal</p>
        <h1 className="text-sm font-black text-[#3E442B] uppercase italic">
          Welcome, <span className="text-[#EA638C]">{user?.name}</span>
        </h1>
      </div>

      {/* Spacer to push logout to the right on mobile */}
      <div className="md:hidden flex-1" /> 

      <div className="flex items-center gap-4">
        {/* Desktop View Site Button (Unchanged logic, hidden on mobile) */}
        <a 
          href="/" 
          target="_blank"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-black text-[#3E442B] uppercase hover:bg-gray-50 rounded-xl transition-all border border-gray-100"
        >
          <ExternalLink size={14} className="text-[#EA638C]" />
          View Site
        </a>

        {/* Logout Button (Unchanged) */}
        <button 
          onClick={() => signOut()}
          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}