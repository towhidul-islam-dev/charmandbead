'use client'; 

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
    HomeIcon, 
    UserGroupIcon, 
    CubeIcon, 
    ShoppingCartIcon,
    SparklesIcon, 
    ChatBubbleLeftRightIcon,
    GiftIcon,
    WrenchIcon
} from '@heroicons/react/24/outline';
import AdminDesktopSidebar from './AdminDesktopSidebar';

export default function AdminSidebar({ user, globalData }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 🟢 Updated navItems to include the new logic for Users and Inventory
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

    const isActive = (item) => {
        const isNewArrivalActive = searchParams ? searchParams.get('newArrival') === 'true' : false;
        if (item.href === '/admin') return pathname === '/admin';
        if (item.name === 'New Arrivals') {
            return pathname.startsWith('/admin/new-arrivals') || isNewArrivalActive;
        }
        return pathname.startsWith(item.href) && !isNewArrivalActive;
    };

    return (
        <>
            {/* 1. Desktop Sidebar (Handles its own desktop layout) */}
            <AdminDesktopSidebar 
                user={user} 
                globalData={globalData} 
                currentPath={pathname} 
            />
            
            {/* 2. Mobile Bottom Navigation Bar */}
            <nav className="fixed inset-x-0 bottom-0 z-[100] bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] md:hidden pb-safe">
                <div className="flex items-center justify-around h-16 px-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const hasBadge = item.badge > 0;
                        
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 w-full transition-all duration-200 relative ${
                                    active ? 'text-[#EA638C]' : 'text-gray-400'
                                }`}
                                aria-label={item.name}
                            >
                                <div className="relative">
                                    <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                                    
                                    {/* 🟢 Mobile Notification Badge */}
                                    {hasBadge && (
                                        <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA638C] text-[8px] font-black text-white ring-2 ring-white animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                
                                <span className={`text-[8px] mt-1 font-black uppercase tracking-tighter text-center truncate px-1 ${active ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.name === 'New Arrivals' ? 'Arrivals' : item.name}
                                </span>

                                {/* Active Indicator Bar */}
                                {active && (
                                    <div className="absolute -top-[1px] w-6 h-0.5 bg-[#EA638C] rounded-full shadow-[0_1px_4px_rgba(234,99,140,0.4)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}