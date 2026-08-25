"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
    const { data: session } = useSession();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-0 bg-[#3E442B] text-white">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#EA638C] via-[#FBB6E6] to-[#EA638C]" />

            <div className="px-6 py-16 mx-auto max-w-7xl lg:px-8">
                <div className="grid grid-cols-1 gap-12 xl:grid-cols-3 xl:gap-24">
                    
                    {/* --- 1. BRAND STORY & INTERACTIVE POP-UP LOGO --- */}
                    <div className="space-y-8">
                        <div>
                            <Link 
                                href="/" 
                                className="group relative inline-block outline-none focus:outline-none"
                            >
                                <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 border-2 border-[#EA638C]/40 p-3 shadow-md backdrop-blur-sm transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-2 group-hover:border-[#EA638C] group-hover:shadow-[0_10px_25px_-5px_rgba(234,99,140,0.5)] group-active:scale-105 group-active:-translate-y-1 group-focus-visible:scale-110 group-focus-visible:-translate-y-2 group-focus-visible:border-[#EA638C]">
                                    <div className="relative w-full h-full rounded-full overflow-hidden transition-transform duration-300 ease-out group-hover:scale-105">
                                        <Image 
                                            src="/logocb.svg" 
                                            alt="Charm & Bead Logo" 
                                            fill
                                            priority
                                            className="object-cover object-center"
                                        />
                                    </div>
                                </div>
                            </Link>

                            <p className="max-w-xs mt-4 text-sm leading-relaxed text-gray-100">
                                Elevating the craft of jewelry making since 2018. Source certified gems and rare components for your next masterpiece.
                            </p>
                        </div>
                    </div>

                    {/* --- 2. NAVIGATION --- */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:col-span-2">
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Curated Shop</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link href="/products" className="text-gray-200 hover:text-white">All Materials</Link></li>
                                <li><Link href="/featured" className="text-gray-200 hover:text-white">Rare Finds</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Experience</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link href="/about" className="text-gray-200 hover:text-white">Our Story</Link></li>
                                <li><Link href="/faq" className="flex items-center gap-1 text-gray-200 hover:text-white">FAQ</Link></li>
                                <li><Link href="/reviews" className="text-gray-200 hover:text-white">Community</Link></li>
                                <li><Link href="/policy/refund" className="text-gray-200 hover:text-[#FBB6E6]">Returns Policy</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Concierge</h4>
                            <ul className="space-y-4 text-sm font-semibold text-gray-100">
                                <li className="flex items-center gap-3"><MapPin size={16} className="text-[#EA638C]" /> Dhaka, BD</li>
                                <li className="flex items-center gap-3"><Mail size={16} className="text-[#EA638C]" /> charmandbeads.official@gmail.com</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- 3. BOTTOM BAR --- */}
                <div className="flex flex-col items-center justify-between gap-6 pt-8 mt-16 text-gray-200 border-t border-white/10 md:flex-row">
                    <p className="text-[11px] font-black uppercase tracking-widest">
                        &copy; {currentYear} Charm & Bead.
                    </p>
                    
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-tighter">
                        <Link href="/policy/privacy" className="transition-colors hover:text-white">Privacy</Link>
                        <Link href="/policy/terms" className="transition-colors hover:text-white">Terms</Link>
                        
                        {/* 🟢 STAFF ACCESS: Only visible if user is admin */}
                        {session?.user?.role === "admin" && (
                            <Link href="/admin" className="hover:text-[#EA638C] transition-colors border-l border-white/10 pl-8">
                                Staff Access
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}