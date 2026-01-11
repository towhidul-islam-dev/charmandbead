"use client"; // Required for usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, Heart, MapPin, LayoutDashboard, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Addresses', href: '/dashboard/address', icon: MapPin },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="flex flex-col gap-8 px-4 pb-20 mx-auto mt-20 max-w-7xl md:mt-28 md:flex-row">
      
      {/* Sidebar Nav */}
      <aside className="w-full md:w-72">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm md:sticky md:top-28">
          <div className="px-4 mb-8">
            <h2 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter">
              Account
            </h2>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
              Management
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              // Check if the current path matches the item link
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
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
                  
                  {/* Subtle dot indicator for active tab */}
                  {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                </Link>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-gray-50">
              <button className="w-full flex items-center gap-3 px-5 py-3.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest group">
                <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                Logout
              </button>
            </div>
          </nav>
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