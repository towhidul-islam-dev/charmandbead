"use client"; // 💡 Required for the Logout button to work

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react'; // 💡 Import signOut
import { ExternalLink, LogOut } from 'lucide-react'; // Adding some icons to match your style

export default function AdminHeader({ user }) {
    
    const handleLogout = () => {
        signOut({ callbackUrl: '/login' });
    };

    return (
        <header className="z-10 flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm">
            <div className="flex items-center space-x-4">
                {/* Mobile Logo */}
                <h1 className="text-lg font-black text-[#EA638C] md:hidden italic tracking-tighter">
                    💎 JM
                </h1>
                
                <div className="flex flex-col">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">
                        Admin Portal
                    </p>
                    <div className="text-sm font-black tracking-tight text-gray-800 uppercase md:text-base">
                        Welcome, <span className="text-[#EA638C] italic">{user?.name || 'Administrator'}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
                {/* Link to Public Site */}
                <Link 
                    href="/" 
                    className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#EA638C] transition"
                >
                    <ExternalLink size={14} />
                    View Site
                </Link>

                {/* 💡 Functional Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition"
                >
                    <LogOut size={14} />
                    <span className="hidden xs:block">Logout</span>
                </button>
            </div>
        </header>
    );
}