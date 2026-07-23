"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createPortal as renderPortal } from "react-dom" // Standard react-dom import below
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  Bars3BottomRightIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ShoppingCartIcon from "@heroicons/react/24/outline/ShoppingCartIcon";
import { useSession, signOut } from "next-auth/react";
import { useWishlist } from "@/Context/WishlistContext";
import { useCart } from "@/Context/CartContext";
import NotificationBell from "./NotificationBell";

const mainLinks = [
  { name: "Products", href: "/products" },
  { name: "Featured", href: "/featured" },
  { name: "New arrivals", href: "/new-arrivals" },
];

const moreLinks = [
  { name: "Product Lab", href: "/product-lab" },
  { name: "Reviews", href: "/reviews" },
  { name: "Contact", href: "/contact" },
];

const resolveImageUrl = (img, name) => {
  if (!img) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=EA638C&color=fff&bold=true`;
  }
  return img.startsWith("http")
    ? img
    : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${img}`;
};

const ClientHeader = ({ pathname, dbImage }) => {
  const { data: session, status } = useSession();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const profileRef = useRef(null);
  const moreRef = useRef(null);
  const [displayImage, setDisplayImage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const activeImage = dbImage || session?.user?.image;
    const finalUrl = resolveImageUrl(activeImage, session?.user?.name);
    setDisplayImage(finalUrl);
    setIsImageLoaded(false); 
  }, [dbImage, session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(event.target)) setIsMoreOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = new Set(cart.filter(item => item.productId).map((item) => item.productId)).size;
  const wishlistCount = wishlist.length;

  const getLinkClasses = (href, isDropdown = false) => {
    const isActive = pathname === href;
    const base = "font-black uppercase transition-all flex items-center gap-1 whitespace-nowrap";
    if (isDropdown) return `${base} text-[10px] tracking-widest px-4 py-3 w-full ${isActive ? "bg-[#EA638C]/10 text-[#EA638C]" : "text-[#3E442B] hover:bg-gray-50 hover:text-[#EA638C]"}`;
    return `${base} text-[10px] tracking-widest py-2 px-3 rounded-lg ${isActive ? "text-[#EA638C] bg-[#EA638C]/10" : "text-[#3E442B] hover:text-[#EA638C]"}`;
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-30 w-full h-16 border-b border-gray-100 md:h-20 bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between h-full px-4 mx-auto md:px-6 max-w-7xl">
          
          <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 overflow-hidden rounded-full bg-[#FBB6E6] shadow-sm">
              <Image src="/logo_new.svg" alt="Logo" width={48} height={48} priority className="object-cover w-full h-full" />
            </div>
            <div className="flex-col hidden xl:flex">
              <span className="text-lg md:text-xl font-medium italic text-[#3E442B] leading-none font-serif text-nowrap">CHARM&BEAD</span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-[#EA638C] uppercase text-nowrap">Unlock Creativity</span>
            </div>
          </Link>

          <nav className="items-center hidden space-x-0.5 md:flex">
            <Link href="/" className={getLinkClasses("/")}>Home</Link>
            {mainLinks.map((link) => (
              <Link key={link.name} href={link.href} className={getLinkClasses(link.href)}>{link.name}</Link>
            ))}
            <div 
              className="relative py-4" 
              ref={moreRef}
              onMouseEnter={() => setIsMoreOpen(true)}
              onMouseLeave={() => setIsMoreOpen(false)}
            >
              <button onClick={() => setIsMoreOpen(!isMoreOpen)} className={`${getLinkClasses("#")} ${isMoreOpen ? 'text-[#EA638C] bg-[#EA638C]/5' : ''}`}>
                More <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMoreOpen && (
                <div className="absolute left-0 w-48 p-2 mt-0 bg-white border border-gray-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in slide-in-from-top-2 z-40">
                  {moreLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setIsMoreOpen(false)} className={getLinkClasses(link.href, true)}>{link.name}</Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-1 md:space-x-4">
            {session?.user?.role === "admin" && (
              <Link href="/admin" className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#EA638C]/10 border border-[#EA638C]/20 rounded-xl text-[#EA638C] text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] shadow-sm transition-all hover:text-white">
                <ShieldCheckIcon className="w-4 h-4" /> <span className="hidden xl:inline">Admin Panel</span>
              </Link>
            )}

            {session && (
              <>
                <Link href="/dashboard/wishlist" className="relative p-2 group">
                  <HeartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-red-500 transition-colors" />
                  {wishlistCount > 0 && <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#3E442B] text-[9px] text-white flex items-center justify-center animate-in zoom-in">{wishlistCount}</span>}
                </Link>
                <div className="relative"><NotificationBell /></div>
                <Link href="/cart" className="relative p-2 group">
                  <ShoppingCartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-[#EA638C] transition-colors" />
                  {cartCount > 0 && <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#3E442B] text-[9px] text-white flex items-center justify-center animate-in zoom-in">{cartCount}</span>}
                </Link>
              </>
            )}

            {status === "authenticated" ? (
              <div 
                className="relative py-2" 
                ref={profileRef}
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-[#EA638C]/30 transition-all active:scale-95">
                  <div className="relative w-8 h-8 md:w-9 md:h-9 overflow-hidden border-2 border-white shadow-sm rounded-xl bg-gray-50">
                    {displayImage && (
                      <Image 
                        key={displayImage}
                        src={displayImage} 
                        alt="Profile" 
                        fill 
                        className={`object-cover transition-opacity duration-700 ease-in-out ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                        onLoadingComplete={() => setIsImageLoaded(true)}
                        unoptimized 
                      />
                    )}
                    {!isImageLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
                  </div>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 w-56 p-2 mt-0 bg-white border border-gray-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in origin-top-right z-40">
                    <div className="px-3 py-3 mb-1 border-b border-gray-50">
                      <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-[0.2em]">{session.user.role === 'admin' ? 'Authorized Admin' : 'Customer Account'}</p>
                      <p className="text-sm font-bold text-[#3E442B] truncate">{session.user.name}</p>
                    </div>
                    <Link href="/dashboard/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase text-gray-600 hover:bg-gray-50 hover:text-[#EA638C] rounded-xl"><UserIcon className="w-4 h-4" /> My Profile</Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-black uppercase text-red-500 hover:bg-red-50 rounded-xl mt-1"><ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out</button>
                  </div>
                )}
              </div>
            ) : status === "loading" ? (
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gray-100 animate-pulse" />
            ) : (
              <div className="items-center hidden gap-2 md:flex">
                <Link href="/login" className="text-[11px] font-black uppercase text-[#3E442B] px-4 py-2 hover:text-[#EA638C]">Login</Link>
                <Link href="/register" className="text-[11px] font-black uppercase bg-[#3E442B] text-white px-5 py-2.5 rounded-xl hover:bg-[#EA638C] transition-colors">Register</Link>
              </div>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden text-[#3E442B]">
              <Bars3BottomRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      <div className="h-16 md:h-20" />

      {/* 🚀 PORTAL TO BODY: MOVES DRAWER OUTSIDE ALL PAGE CONTAINERS */}
      {mounted && renderPortal(
        <AnimatePresence>
          {isMenuOpen && (
            <div className="fixed inset-0 z-[999999] md:hidden">
              {/* BACKDROP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-[#3E442B]/70 backdrop-blur-md"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* SLIDE-OUT PANEL */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] h-full bg-[#3E442B] shadow-2xl flex flex-col z-[1000000] overflow-hidden border-l border-white/10"
              >
                {/* DRAWER SOLID HEADER BAR */}
                <div className="flex items-center justify-between px-6 py-5 bg-[#3E442B] border-b border-white/10 shrink-0">
                  <span className="text-[10px] font-black text-[#FBB6E6] uppercase tracking-[0.3em]">
                    NAVIGATION
                  </span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 -mr-2 text-white bg-white/10 rounded-full hover:bg-[#EA638C] transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* DRAWER CONTENT */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
                  {[...mainLinks, { name: "Home", href: "/" }].reverse().map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`font-black uppercase transition-all flex items-center gap-1 text-[11px] tracking-widest px-5 py-4 w-full rounded-xl 
                          ${isActive 
                            ? "bg-[#EA638C] text-white shadow-lg" 
                            : "text-white/90 hover:bg-white/5 hover:text-[#EA638C]"}`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}

                  <div className="pt-8 pb-4 mt-4 border-t border-white/10">
                    <p className="px-4 mb-4 text-[9px] font-black text-white/40 uppercase tracking-widest">
                      Discover More
                    </p>
                    {moreLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="font-black uppercase transition-all flex items-center gap-1 text-[11px] tracking-widest px-5 py-3 w-full text-white/70 hover:text-[#EA638C]"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="p-6 bg-black/20 border-t border-white/10 shrink-0 pb-8 md:pb-6">
                  {!session ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-4 text-center text-[11px] font-black uppercase text-white border border-white/20 rounded-2xl active:scale-95 transition-transform"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-4 text-center text-[11px] font-black uppercase bg-[#EA638C] text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
                      >
                        Join Charm&Bead
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center justify-center gap-3 w-full py-4 text-[11px] font-black uppercase text-red-400 bg-red-950/30 border border-red-900/50 rounded-2xl active:scale-95 transition-transform"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default function Navbar({ dbImage }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    const adminImg = resolveImageUrl(dbImage || session?.user?.image, session?.user?.name || 'Admin');

    return (
      <>
        <header className="fixed top-0 left-0 z-30 flex items-center w-full h-16 px-8 text-white shadow-lg bg-[#3E442B]">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <Image src="/logo_new.svg" alt="Admin Logo" width={32} height={32} className="invert group-hover:rotate-12 transition-transform" priority />
            <span className="text-xl font-bold tracking-tight text-[#EA638C]">Admin Console</span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
             <div className="relative w-8 h-8 overflow-hidden border rounded-full border-white/20 bg-white/10 shadow-sm">
                <Image key={adminImg} src={adminImg} alt="admin" fill className="object-cover" unoptimized />
             </div>
             <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm font-bold tracking-widest text-red-300 uppercase transition-colors hover:text-white border border-red-300/20 px-3 py-1 rounded-lg">Logout</button>
          </div>
        </header>
        <div className="h-16" />
      </>
    );
  }

  return <ClientHeader pathname={pathname} dbImage={dbImage} />;
}