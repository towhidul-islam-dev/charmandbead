"use client";

import Link from "next/link";
import {
  HomeIcon,
  UserGroupIcon,
  CubeIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";

export default function AdminDesktopSidebar({ user, globalData, currentPath }) {
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Products", href: "/admin/products", icon: CubeIcon },
    { name: "Inventory", href: "/admin/inventory", icon: WrenchIcon },
    {
      name: "New Arrivals",
      href: "/admin/new-arrivals",
      icon: SparklesIcon,
      isPulsing: globalData?.hasRecentArrivals,
    },
    { name: "Cart Review", href: "/admin/cart-review", icon: ShoppingCartIcon },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCartIcon,
      badge: globalData?.newOrdersCount || 0,
    },
    { name: "Gifts", href: "/admin/gifts", icon: GiftIcon },
    {
      name: "Users",
      href: "/admin/users",
      icon: UserGroupIcon,
      badge: globalData?.newUsersCount || 0,
    },
    { name: "Reviews", href: "/admin/reviews", icon: ChatBubbleLeftRightIcon },
  ];

  const isActive = (item) => {
    if (item.name === "New Arrivals") return currentPath === "/admin/new-arrivals";
    return currentPath === item.href;
  };

  return (
    /* 🟢 FIXED: Added fixed, top-0, left-0, and h-screen */
    <div className="fixed top-0 left-0 hidden h-screen md:flex flex-col w-64 bg-white border-r border-gray-100 z-[50]">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100 shrink-0">
        <h1 className="flex items-center gap-2 text-xl font-black italic tracking-tighter text-[#3E442B] uppercase">
          Admin <span className="text-[#EA638C]">Panel</span>
        </h1>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                active
                  ? "bg-[#3E442B] text-white shadow-lg shadow-[#3E442B]/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#3E442B]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`flex-shrink-0 w-5 h-5 ${active ? "text-[#EA638C]" : ""}`} />
                <span className="text-[11px] uppercase tracking-wider font-black">
                  {item.name}
                </span>
              </div>

              {item.badge > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-[#EA638C] text-white text-[10px] font-black rounded-full animate-pulse shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-3 p-3 border border-gray-100 bg-gray-50 rounded-2xl">
          <div className="flex items-center justify-center w-8 h-8 font-black text-white bg-[#EA638C] rounded-xl shadow-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-[10px] font-black text-[#3E442B] uppercase truncate leading-none">
              {user?.name}
            </p>
            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}