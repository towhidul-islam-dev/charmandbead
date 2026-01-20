import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-20 bg-[#3E442B] text-white">
            {/* Decorative Top Border */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#EA638C] via-[#FBB6E6] to-[#EA638C]" />

            <div className="px-6 py-16 mx-auto max-w-7xl lg:px-8">
                <div className="grid grid-cols-1 gap-12 xl:grid-cols-3 xl:gap-24">
                    
                    {/* --- 1. BRAND STORY --- */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase italic text-[#EA638C]">
                                Charm & Bead
                            </h3>
                            <p className="mt-4 text-sm leading-relaxed text-gray-100 max-w-xs">
                                Elevating the craft of jewelry making since 2018. Source certified gems, precious metals, and rare components for your next masterpiece.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-200">Join the Collective</p>
                            <div className="flex max-w-sm group">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="w-full bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:border-[#EA638C] transition-all rounded-l-2xl"
                                />
                                <button className="bg-[#EA638C] hover:bg-[#d54d76] text-white px-6 py-3 rounded-r-2xl transition-all group-hover:shadow-[0_0_20px_rgba(234,99,140,0.4)]">
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- 2. NAVIGATION --- */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:col-span-2">
                        
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Curated Shop</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link href="/products" className="text-gray-200 hover:text-white transition-colors">All Materials</Link></li>
                                <li><Link href="/featured" className="text-gray-200 hover:text-white transition-colors">Rare Finds</Link></li>
                                <li><Link href="/metals" className="text-gray-200 hover:text-white transition-colors">Precious Metals</Link></li>
                                <li><Link href="/wholesale" className="text-gray-200 hover:text-white transition-colors">Wholesale</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Experience</h4>
                            <ul className="space-y-4 text-sm font-semibold">
                                <li><Link href="/about" className="text-gray-200 hover:text-white transition-colors">Our Story</Link></li>
                                {/* 🟢 NEW: FAQ LINK ADDED HERE */}
                                <li><Link href="/faq" className="text-gray-200 hover:text-white transition-colors flex items-center gap-1">FAQ</Link></li>
                                <li><Link href="/reviews" className="text-gray-200 hover:text-white transition-colors">Community</Link></li>
                                <li><Link href="/contact" className="text-gray-200 hover:text-white transition-colors">Custom Sourcing</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#EA638C] mb-6 underline decoration-[#EA638C]/30 underline-offset-8">Concierge</h4>
                            <ul className="space-y-4 text-sm font-semibold text-gray-100">
                                <li className="flex items-center gap-3"><MapPin size={16} className="text-[#EA638C]" /> Dhaka, BD</li>
                                <li className="flex items-center gap-3"><Phone size={16} className="text-[#EA638C]" /> +880 1XXX-XXXXXX</li>
                                <li className="flex items-center gap-3"><Mail size={16} className="text-[#EA638C]" /> hello@charmandbead.com</li>
                            </ul>
                            
                            <div className="flex gap-5 mt-8">
                                <Link href="#" className="p-2.5 bg-white/10 rounded-full hover:bg-[#EA638C] hover:scale-110 transition-all border border-white/5"><Facebook size={18} /></Link>
                                <Link href="#" className="p-2.5 bg-white/10 rounded-full hover:bg-[#EA638C] hover:scale-110 transition-all border border-white/5"><Instagram size={18} /></Link>
                                <Link href="#" className="p-2.5 bg-white/10 rounded-full hover:bg-[#EA638C] hover:scale-110 transition-all border border-white/5"><Twitter size={18} /></Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. BOTTOM BAR --- */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-200">
                    <p className="text-[11px] font-black uppercase tracking-widest">
                        &copy; {currentYear} Charm & Bead. Handcrafted with Precision.
                    </p>
                    
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-tighter">
                        <Link href="/policy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/admin" className="hover:text-[#EA638C] transition-colors">Staff Access</Link>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <img src="/visa.svg" alt="Visa" className="h-4 brightness-200" />
                        <img src="/mastercard.svg" alt="Mastercard" className="h-4 brightness-200" />
                        <img src="/bkash.svg" alt="bKash" className="h-5 brightness-200 shadow-sm" />
                    </div>
                </div>
            </div>
        </footer>
    );
}