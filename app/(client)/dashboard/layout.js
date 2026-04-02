"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; // 🟢 Added for animations
import { 
  User, ShoppingBag, Heart, MapPin, 
  LayoutDashboard, LogOut, Menu, X 
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
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
            {isActive && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
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
      
      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[120] md:hidden">
            {/* 🟢 Smooth Backdrop Fade */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setIsDrawerOpen(false)} 
            />

            {/* 🟢 Smooth Sidebar Slide */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full w-[280px] bg-white p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-2 mb-8">
                <h2 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter">Menu</h2>
                <button 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-2 text-gray-400 hover:text-[#EA638C] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <NavContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Section (Desktop) */}
      <aside className="w-full md:w-72">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm md:sticky md:top-28">
          
          <div className="px-4 mb-8">
            {/* Mobile Trigger Button */}
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
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-[#EA638C]/10 text-[#EA638C] rounded-xl"
              >
                <Menu size={20} />
              </motion.div>
            </button>

            {/* Desktop Static Header */}
            <div className="hidden md:block">
              <h2 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                Account
              </h2>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                Management
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavContent />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-[500px]"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}