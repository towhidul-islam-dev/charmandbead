import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-20 bg-[#3E442B] text-white">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#EA638C] via-[#FBB6E6] to-[#EA638C]" />

            <div className="px-6 py-16 mx-auto max-w-7xl lg:px-8">
                <div className="grid grid-cols-1 gap-12 xl:grid-cols-3 xl:gap-24">
                    
                    {/* --- 1. BRAND STORY --- */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase italic text-[#EA638C]">
                                Charm & Bead
                            </h3>
                            <p className="max-w-xs mt-4 text-sm leading-relaxed text-gray-100">
                                Elevating the craft of jewelry making since 2018. Source certified gems and rare components for your next masterpiece.
                            </p>
                        </div>
                        {/* ... Newsletters input ... */}
                    </div>

                    {/* --- 2. NAVIGATION --- */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:col-span-2">
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Curated Shop</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link href="/products" className="text-gray-200 hover:text-white">All Materials</Link></li>
                                <li><Link href="/featured" className="text-gray-200 hover:text-white">Rare Finds</Link></li>
                                {/* <li><Link href="/wholesale" className="text-gray-200 hover:text-white">Wholesale</Link></li> */}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Experience</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link href="/about" className="text-gray-200 hover:text-white">Our Story</Link></li>
                                {/* 🟢 FAQ RESTORED HERE */}
                                <li><Link href="/faq" className="flex items-center gap-1 text-gray-200 hover:text-white">FAQ</Link></li>
                                <li><Link href="/reviews" className="text-gray-200 hover:text-white">Community</Link></li>
                                {/* 🟢 REFUND PAGE LINKED CORRECTLY HERE */}
                                <li><Link href="/policy/refund" className="text-gray-200 hover:text-[#FBB6E6]">Returns Policy</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Concierge</h4>
                            <ul className="space-y-4 text-sm font-semibold text-gray-100">
                                <li className="flex items-center gap-3"><MapPin size={16} className="text-[#EA638C]" /> Dhaka, BD</li>
                                <li className="flex items-center gap-3"><Mail size={16} className="text-[#EA638C]" /> hello@charmandbead.com</li>
                            </ul>
                            {/* ... Socials ... */}
                        </div>
                    </div>
                </div>

                {/* --- 3. BOTTOM BAR --- */}
                <div className="flex flex-col items-center justify-between gap-6 pt-8 mt-16 text-gray-200 border-t border-white/10 md:flex-row">
                    <p className="text-[11px] font-black uppercase tracking-widest">
                        &copy; {currentYear} Charm & Bead.
                    </p>
                    
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-tighter">
                        {/* 🟢 PRIVACY & TERMS PATHS UPDATED */}
                        <Link href="/policy/privacy" className="transition-colors hover:text-white">Privacy</Link>
                        <Link href="/policy/terms" className="transition-colors hover:text-white">Terms</Link>
                        <Link href="/admin" className="hover:text-[#EA638C] transition-colors">Staff Access</Link>
                    </div>
                    {/* ... Payments ... */}
                </div>
            </div>
        </footer>
    );
}