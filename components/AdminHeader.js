// components/AdminHeader.jsx
import React from 'react';
import Link from 'next/link';

export default function AdminHeader({ user }) {
    return (
        /* REMOVED 'fixed' to prevent it from floating over the table content.
           The 'z-10' ensures the shadow stays above the table when scrolling.
        */
        <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-100 z-10">
            <div className="flex items-center space-x-4">
                {/* Visible on mobile if sidebar is hidden */}
                <h1 className="text-lg font-bold text-indigo-600 md:hidden">💎 JM</h1>
                
                <div className="text-sm md:text-lg font-semibold text-gray-700">
                    Welcome, <span className="text-indigo-600">{user?.firstName || 'Admin'}</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {/* Quick Link to Public Reviews to check how they look */}
                <Link 
                    href="/reviews" 
                    className="hidden sm:block text-xs font-medium text-gray-500 hover:text-indigo-600 transition"
                >
                    View Public Site
                </Link>

                <button className="text-sm font-medium text-red-500 hover:text-red-700 transition px-3 py-1 rounded-md hover:bg-red-50">
                    Logout
                </button>
            </div>
        </header>
    );
}