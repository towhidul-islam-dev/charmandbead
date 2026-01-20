"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon, // Added for Admin branding
} from "@heroicons/react/24/outline";
import ShoppingCartIcon from "@heroicons/react/24/outline/ShoppingCartIcon";
import { useSession, signOut } from "next-auth/react";
import { useWishlist } from "@/Context/WishlistContext";
import { useCart } from "@/Context/CartContext";

const clientLinks = [
  { name: "Products", href: "/products", icon: Squares2X2Icon },
  { name: "Featured", href: "/featured" },
  { name: "New arrivals", href: "/new-arrivals" },
  { name: "Reviews", href: "/reviews" },
  { name: "Contact", href: "/contact" },
];

const ClientHeader = ({ pathname }) => {
  const { data: session } = useSession();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = new Set(cart.map((item) => item.productId)).size;
  const wishlistCount = wishlist.length;

  const profileImageUrl = session?.user?.image?.startsWith('http')
    ? session.user.image
    : session?.user?.image
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${session.user.image}`
    : `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=EA638C&color=fff`;

  const getLinkClasses = (href) => {
    const isActive = pathname === href;
    return `font-black uppercase text-[11px] tracking-widest py-2 px-3 rounded-lg transition-all ${
      isActive ? "text-[#EA638C] bg-[#EA638C]/10" : "text-[#3E442B] hover:text-[#EA638C]"
    }`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full h-16 border-b border-gray-100 md:h-20 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-full px-6 mx-auto max-w-7xl">
          
          {/* BRANDING */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-full bg-[#FBB6E6] shadow-sm">
              <Image src="/logo.svg" alt="Logo" width={48} height={48} priority className="object-cover w-full h-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-medium italic text-[#3E442B] leading-none font-serif">CHARM&BEAD</span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-[#EA638C] uppercase">Unlock Creativity</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="items-center hidden space-x-1 md:flex">
            <Link href="/" className={getLinkClasses("/")}>Home</Link>
            {clientLinks.map((link) => (
              <Link key={link.name} href={link.href} className={getLinkClasses(link.href)}>{link.name}</Link>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* 👑 CONDITIONAL ADMIN PANEL BUTTON (Desktop Only) */}
            {session?.user?.role === "admin" && (
              <Link 
                href="/admin" 
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#EA638C]/10 border border-[#EA638C]/20 rounded-xl text-[#EA638C] text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] hover:text-white transition-all shadow-sm"
              >
                <ShieldCheckIcon className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            <Link href="/dashboard/wishlist" className="relative p-2 group">
              <HeartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#EA638C] text-[9px] font-black text-white flex items-center justify-center animate-in zoom-in">{wishlistCount}</span>}
            </Link>

            <Link href="/cart" className="relative p-2 group">
              <ShoppingCartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-[#EA638C] transition-colors" />
              {cartCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#3E442B] text-[9px] font-black text-white flex items-center justify-center animate-in zoom-in">{cartCount}</span>}
            </Link>

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-[#EA638C]/30"
                >
                  <div className="relative w-8 h-8 overflow-hidden border-2 border-white shadow-sm rounded-xl bg-gray-50">
                    <Image src={profileImageUrl} alt="User" fill className="object-cover" unoptimized />
                  </div>
                </button>

                {/* DROPDOWN MENU */}
                {isProfileOpen && (
                  <div className="absolute right-0 w-56 mt-3 origin-top-right bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-3 border-b border-gray-50 mb-1">
                      <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-[0.2em]">
                        {session.user.role === 'admin' ? 'Authorized Admin' : 'Customer Account'}
                      </p>
                      <p className="text-sm font-bold text-[#3E442B] truncate">{session.user.name}</p>
                    </div>

                    {/* Mobile Admin Link (Shows in dropdown when on small screens) */}
                    {session.user.role === "admin" && (
                      <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex lg:hidden items-center gap-2 px-3 py-2 text-[11px] font-black uppercase text-[#EA638C] hover:bg-[#EA638C]/5 rounded-xl transition-all">
                        <Squares2X2Icon className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}

                    <Link href="/dashboard/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase text-gray-600 hover:bg-gray-50 hover:text-[#EA638C] rounded-xl transition-all">
                      <UserIcon className="w-4 h-4" /> My Profile
                    </Link>

                    <button 
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-black uppercase text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="text-[11px] font-black uppercase text-[#3E442B] px-4 py-2 hover:text-[#EA638C]">Login</Link>
                <Link href="/register" className="text-[11px] font-black uppercase bg-[#3E442B] text-white px-5 py-2.5 rounded-xl hover:bg-[#EA638C] transition-all">Register</Link>
              </div>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden text-[#3E442B]">
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU (Simplified) */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
            {clientLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-sm tracking-widest text-[#3E442B]">
                {link.name}
              </Link>
            ))}
            {!session && (
              <div className="pt-4 border-t border-gray-50 flex flex-col gap-3">
                <Link href="/login" className="text-center font-black uppercase text-xs py-3 border border-gray-200 rounded-xl">Login</Link>
                <Link href="/register" className="text-center font-black uppercase text-xs py-3 bg-[#3E442B] text-white rounded-xl">Register</Link>
              </div>
            )}
          </div>
        )}
      </header>
      <div className="h-16 md:h-20" />
    </>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <header className="fixed top-0 left-0 z-50 flex items-center w-full h-16 px-8 text-white shadow-lg bg-[#3E442B]">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Admin Logo" width={32} height={32} className="invert" />
            <span className="text-xl font-bold tracking-tight text-[#EA638C]">Admin Console</span>
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="ml-auto text-sm font-bold tracking-widest text-red-300 uppercase hover:text-white transition-colors">Logout</button>
        </header>
        <div className="h-16" />
      </>
    );
  }

  return <ClientHeader pathname={pathname} />;
}