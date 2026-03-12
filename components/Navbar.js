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
  ShieldCheckIcon,
  GiftIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import ShoppingCartIcon from "@heroicons/react/24/outline/ShoppingCartIcon";
import { useSession, signOut } from "next-auth/react";
import { useWishlist } from "@/Context/WishlistContext";
import { useCart } from "@/Context/CartContext";
import NotificationBell from "./NotificationBell";

// Navigation Links logic
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

const ClientHeader = ({ pathname }) => {
  const { data: session } = useSession();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  
  // Menu States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const profileRef = useRef(null);
  const moreRef = useRef(null);
  const [displayImage, setDisplayImage] = useState("");

  useEffect(() => {
    if (session?.user?.image) {
      const url = session.user.image.startsWith('http') 
        ? session.user.image 
        : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${session.user.image}`;
      setDisplayImage(url);
    } else if (session?.user?.name) {
       setDisplayImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=EA638C&color=fff`);
    }
  }, [session]);

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

  const badgeStyle = "absolute top-0 right-0 h-4 w-4 rounded-full bg-[#3E442B] ring-2 ring-white text-[9px] font-black text-white flex items-center justify-center animate-in zoom-in";

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full h-16 border-b border-gray-100 md:h-20 bg-white/80 backdrop-blur-md">
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

          {/* Desktop Links */}
          <nav className="items-center hidden space-x-0.5 md:flex">
            <Link href="/" className={getLinkClasses("/")}>Home</Link>
            {mainLinks.map((link) => (
              <Link key={link.name} href={link.href} className={getLinkClasses(link.href)}>{link.name}</Link>
            ))}
            <div className="relative" ref={moreRef}>
              <button onClick={() => setIsMoreOpen(!isMoreOpen)} className={`${getLinkClasses("#")} ${isMoreOpen ? 'text-[#EA638C] bg-[#EA638C]/5' : ''}`}>
                More <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMoreOpen && (
                <div className="absolute left-0 w-48 p-2 mt-3 duration-200 bg-white border border-gray-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in slide-in-from-top-2">
                  {moreLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setIsMoreOpen(false)} className={getLinkClasses(link.href, true)}>{link.name}</Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-1 md:space-x-4">
            {session?.user?.role === "admin" && (
              <Link href="/admin" className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#EA638C]/10 border border-[#EA638C]/20 rounded-xl text-[#EA638C] text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] shadow-sm">
                <ShieldCheckIcon className="w-4 h-4" /> <span className="hidden xl:inline">Admin Panel</span>
              </Link>
            )}

            {session && (
              <>
                <Link href="/dashboard/wishlist" className="relative p-2 -m-1 group">
                  <HeartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-red-500 transition-colors" />
                  {wishlistCount > 0 && <span className={badgeStyle}>{wishlistCount}</span>}
                </Link>
                <div className="relative"><NotificationBell /></div>
                <Link href="/cart" className="relative p-2 -m-1 group">
                  <ShoppingCartIcon className="text-[#3E442B] h-6 w-6 group-hover:text-[#EA638C] transition-colors" />
                  {cartCount > 0 && <span className={badgeStyle}>{cartCount}</span>}
                </Link>
              </>
            )}

            {session ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-[#EA638C]/30">
                  <div className="relative w-8 h-8 overflow-hidden border-2 border-white shadow-sm md:w-9 md:h-9 rounded-xl bg-gray-50">
                    {displayImage && <Image src={displayImage} alt="Profile" fill className="object-cover" unoptimized />}
                  </div>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 w-56 p-2 mt-3 bg-white border border-gray-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in">
                    <div className="px-3 py-3 mb-1 border-b border-gray-50">
                      <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-[0.2em]">{session.user.role === 'admin' ? 'Authorized Admin' : 'Customer Account'}</p>
                      <p className="text-sm font-bold text-[#3E442B] truncate">{session.user.name}</p>
                    </div>
                    <Link href="/dashboard/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase text-gray-600 hover:bg-gray-50 hover:text-[#EA638C] rounded-xl"><UserIcon className="w-4 h-4" /> My Profile</Link>
                    {/* <Link href="/surprise" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase text-gray-600 hover:bg-gray-50 hover:text-[#EA638C] rounded-xl"><GiftIcon className="w-4 h-4" /> Claim Gift</Link> */}
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-black uppercase text-red-500 hover:bg-red-50 rounded-xl mt-1"><ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="items-center hidden gap-2 md:flex">
                <Link href="/login" className="text-[11px] font-black uppercase text-[#3E442B] px-4 py-2 hover:text-[#EA638C]">Login</Link>
                <Link href="/register" className="text-[11px] font-black uppercase bg-[#3E442B] text-white px-5 py-2.5 rounded-xl hover:bg-[#EA638C]">Register</Link>
              </div>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden text-[#3E442B]"><Bars3Icon className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="flex flex-col gap-4 p-6 bg-white border-b border-gray-100 md:hidden animate-in slide-in-from-top overflow-y-auto max-h-[85vh]">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-sm tracking-widest text-[#3E442B]">Home</Link>
            {[...mainLinks, ...moreLinks].map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="font-black uppercase text-sm tracking-widest text-[#3E442B]">{link.name}</Link>
            ))}
            {!session && (
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                <Link href="/login" className="py-3 text-xs font-black text-center uppercase border border-gray-200 rounded-xl">Login</Link>
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
  const { data: session } = useSession();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    const adminImg = session?.user?.image 
      ? (session.user.image.startsWith('http') ? session.user.image : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${session.user.image}`)
      : `https://ui-avatars.com/api/?name=Admin&background=EA638C&color=fff`;

    return (
      <>
        <header className="fixed top-0 left-0 z-50 flex items-center w-full h-16 px-8 text-white shadow-lg bg-[#3E442B]">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/logo_new.svg" alt="Admin Logo" width={32} height={32} className="invert" priority />
            <span className="text-xl font-bold tracking-tight text-[#EA638C]">Admin Console</span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
             <div className="relative w-8 h-8 overflow-hidden border rounded-full border-white/20 bg-white/10">
                {adminImg && <Image src={adminImg} alt="admin" fill className="object-cover" unoptimized />}
             </div>
             <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm font-bold tracking-widest text-red-300 uppercase transition-colors hover:text-white">Logout</button>
          </div>
        </header>
        <div className="h-16" />
      </>
    );
  }
  return <ClientHeader pathname={pathname} />;
}