'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
    HomeIcon, UserGroupIcon, CubeIcon, ShoppingCartIcon,
    SparklesIcon, ChatBubbleLeftRightIcon, GiftIcon, WrenchIcon,
    Bars3Icon, XMarkIcon, ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';
import AdminDesktopSidebar from './AdminDesktopSidebar';

export default function AdminSidebar({ user, globalData }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 🟢 Logic preserved: Exact same navItems structure
    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Products', href: '/admin/products', icon: CubeIcon },
        { name: 'Inventory', href: '/admin/inventory', icon: WrenchIcon },
        { name: 'New Arrivals', href: '/admin/new-arrivals', icon: SparklesIcon }, 
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon, badge: globalData?.newOrdersCount || 0 },
        { name: 'Gifts', href: '/admin/gifts', icon: GiftIcon },
        { name: 'Users', href: '/admin/users', icon: UserGroupIcon, badge: globalData?.newUsersCount || 0 },
        { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
    ];

    // 🟢 Logic preserved: Exact same isActive check
    const isActive = (item) => {
        const isNewArrivalActive = searchParams ? searchParams.get('newArrival') === 'true' : false;
        if (item.href === '/admin') return pathname === '/admin';
        return pathname.startsWith(item.href) || (item.name === 'New Arrivals' && isNewArrivalActive);
    };

    return (
        <>
            {/* 1. Mobile Hamburger Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-[110] p-2 rounded-lg bg-[#3E442B] text-white shadow-md md:hidden"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>

            {/* 2. Mobile Sidebar Drawer */}
            <div className={`fixed inset-0 z-[120] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                <aside className={`absolute inset-y-0 left-0 w-72 bg-[#3E442B] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col h-full p-6">
                        <div className="flex items-center justify-between mb-10 shrink-0">
                            <span className="text-[#FBB6E6] text-xl font-black uppercase tracking-widest italic">Charm & Bead</span>
                            <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#EA638C]">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation section is now scrollable to protect the footer */}
                        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                            active ? 'bg-[#EA638C] text-white' : 'text-gray-300 hover:bg-white/10'
                                        }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="font-bold text-sm uppercase">{item.name}</span>
                                        {item.badge > 0 && (
                                            <span className="ml-auto bg-[#FBB6E6] text-[#3E442B] text-[10px] font-black px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* 🟢 NEW: Mobile Sidebar Footer */}
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-4 shrink-0">
                            {/* View Site Link */}
                            <Link 
                                href="/" 
                                className="flex items-center gap-4 px-4 py-3 text-[#FBB6E6] hover:bg-white/10 rounded-xl transition-all group"
                            >
                                <ArrowTopRightOnSquareIcon className="w-6 h-6 transition-transform group-hover:scale-110 shadow-sm" />
                                <span className="font-black text-xs uppercase tracking-widest">View Site</span>
                            </Link>

                            {/* Mobile Profile Section */}
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-[#EA638C] flex items-center justify-center text-white font-black text-lg border border-[#FBB6E6]/20 shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <p className="text-[11px] font-black text-white uppercase truncate leading-none mb-1">
                                        {user?.name}
                                    </p>
                                    <p className="text-[9px] font-bold text-[#EA638C] uppercase tracking-tighter">
                                        Administrator
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* 3. Desktop Sidebar (Logic preserved) */}
            <div className="hidden md:block">
                <AdminDesktopSidebar 
                    user={user} 
                    globalData={globalData} 
                    currentPath={pathname} 
                />
            </div>
        </>
    );
}