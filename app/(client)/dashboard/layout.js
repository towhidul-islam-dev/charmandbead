"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, ShoppingBag, Heart, MapPin, 
  LayoutDashboard, LogOut, Gift, Menu, X 
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'My Rewards', href: '/dashboard/rewards', icon: Gift }, 
    { name: 'Addresses', href: '/dashboard/address', icon: MapPin },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login', redirect: true });
  };

  // Shared Nav Links
  const NavContent = () => (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase text-[10px] tracking-widest group
              ${isActive 
                ? "bg-[#EA638C] text-white shadow-lg shadow-[#EA638C]/20" 
                : "text-gray-500 hover:bg-[#EA638C]/5 hover:text-[#EA638C]"
              }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={`${!isActive && "group-hover:scale-110 transition-transform"}`} />
              {item.name}
            </div>
            {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
          </Link>
        );
      })}
      
      <div className="pt-4 mt-4 border-t border-gray-50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest group"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex flex-col gap-8 px-4 pb-20 mx-auto mt-20 max-w-7xl md:mt-28 md:flex-row">
      
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed top-0 left-0 z-[101] h-full w-[280px] bg-white p-6 shadow-2xl transition-transform duration-300 md:hidden
        ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter">Menu</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400">
            <X size={24} />
          </button>
        </div>
        <NavContent />
      </aside>

      {/* Sidebar Section */}
      <aside className="w-full md:w-72">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm md:sticky md:top-28">
          
          {/* 🟢 SWAPPED HEADER: Trigger on Mobile, Static on Desktop */}
          <div className="px-4 mb-8">
            {/* Mobile View: Shows "Menu" with Icon */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center justify-between w-full md:hidden group"
            >
              <div>
                <h2 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter group-active:text-[#EA638C] transition-colors">
                  Menu
                </h2>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Tap to navigate
                </p>
              </div>
              <div className="p-2 bg-[#EA638C]/10 text-[#EA638C] rounded-xl group-active:scale-90 transition-transform">
                <Menu size={20} />
              </div>
            </button>

            {/* Desktop View: Remains "Account Management" */}
            <div className="hidden md:block">
              <h2 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                Account
              </h2>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                Management
              </p>
            </div>
          </div>

          {/* Desktop Nav: Hidden on mobile since it's in the drawer */}
          <div className="hidden md:block">
            <NavContent />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}