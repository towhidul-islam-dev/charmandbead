"use client";

import Link from "next/link";
import Image from "next/image"; // Optimization: Optimized image handling
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
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

  const cartCount = new Set(cart.map((item) => item.productId)).size;
  const wishlistCount = new Set(wishlist.map((item) => item._id || item.id)).size;

  const getLinkClasses = (href) => {
    const isActive = pathname === href;
    return `font-black uppercase text-[11px] tracking-widest py-2 px-3 rounded-lg transition-all ${
      isActive
        ? "text-[#EA638C] bg-[#EA638C]/10"
        : "text-[#3E442B] hover:text-[#EA638C]"
    }`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full h-16 border-b border-gray-100 md:h-20 bg-white/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-full px-6 mx-auto max-w-7xl">
          
          {/* --- BRANDING SECTION --- */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Charm & Bead Home">
            <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-full bg-[#FBB6E6] transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <Image 
                src="/logo.svg" 
                alt="Logo" 
                width={56} 
                height={56} 
                priority 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-medium italic tracking-tight text-[#3E442B] leading-none font-serif">
                CHARM&BEAD
              </span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-[#EA638C] uppercase mt-1">
                Unlock Creativity
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <nav className="items-center hidden space-x-1 md:flex">
            <Link href="/" className={getLinkClasses("/")}>Home</Link>
            {clientLinks.map((link) => (
              <Link key={link.name} href={link.href} className={getLinkClasses(link.href)}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* --- DESKTOP ACTIONS --- */}
          <div className="items-center hidden space-x-5 md:flex">
            {/* Wishlist */}
            <Link href="/dashboard/wishlist" className="relative p-2 group" aria-label={`Wishlist with ${wishlistCount} items`}>
              <HeartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#EA638C] text-[9px] font-black text-white flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 group" aria-label={`Cart with ${cartCount} items`}>
              <ShoppingCartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-[#EA638C] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#3E442B] text-[9px] font-black text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile/Login */}
            {session ? (
              <Link href="/dashboard/orders" className="flex items-center gap-2 py-1 pl-1 pr-3 transition-colors bg-white border border-gray-100 shadow-sm rounded-2xl hover:bg-gray-50">
                <div className="relative w-8 h-8 overflow-hidden border-2 border-white shadow-sm rounded-xl">
                  <Image 
                    src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}`} 
                    alt="User profile"
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
                <span className="text-[10px] font-black text-[#3E442B] uppercase">Profile</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className={`text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${pathname === '/login' ? 'text-[#EA638C]' : 'text-[#3E442B] hover:text-[#EA638C]'}`}>
                  Login
                </Link>
                <Link href="/register" className="text-[11px] font-black uppercase tracking-widest px-5 py-2.5 bg-[#3E442B] text-white rounded-xl hover:bg-[#EA638C] transition-all shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-2 md:hidden text-[#3E442B]"
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Sidebar */}
        {isMenuOpen && (
          <div className="absolute left-0 flex flex-col w-full p-4 space-y-2 duration-300 bg-white border-b shadow-xl top-16 md:hidden animate-in slide-in-from-top">
            {clientLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)} 
                className="font-black uppercase text-xs p-4 text-[#3E442B] hover:bg-gray-50 rounded-xl"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Optimization: Ensure spacer matches header height exactly to prevent CLS */}
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
            <span className="text-xl font-bold tracking-tight text-[#EA638C]">
              Admin Console
            </span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-auto text-sm font-bold tracking-widest text-red-300 uppercase"
          >
            Logout
          </button>
        </header>
        <div className="h-16" />
      </>
    );
  }

  return <ClientHeader pathname={pathname} />;
}