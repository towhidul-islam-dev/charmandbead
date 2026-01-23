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
    GiftIcon // 🎁 Added for the Gifts route
} from '@heroicons/react/24/outline';
import AdminDesktopSidebar from './AdminDesktopSidebar';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: CubeIcon },
    { name: 'New Arrivals', href: '/admin/new-arrivals', icon: SparklesIcon }, 
    { name: 'Cart', href: '/admin/cart-review', icon: ShoppingCartIcon }, 
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Gifts', href: '/admin/gifts', icon: GiftIcon }, // 🟢 Added this line
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
];

export default function AdminSidebar({ user, globalData }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActive = (item) => {
        // 1. Safe SearchParams Check
        const isNewArrivalActive = searchParams ? searchParams.get('newArrival') === 'true' : false;

        // 2. Exact match for Dashboard
        if (item.href === '/admin') return pathname === '/admin';
    
        // 3. Special check for the New Arrivals menu item
        if (item.name === 'New Arrivals') {
            return pathname.startsWith('/admin/new-arrivals') || isNewArrivalActive;
        }

        // 4. Default check: Ensure path matches and we aren't in a "New Arrival" view
        return pathname.startsWith(item.href) && !isNewArrivalActive;
    };

    return (
        <>
            {/* 1. Desktop Sidebar */}
            <AdminDesktopSidebar 
                user={user} 
                globalData={globalData} 
                currentPath={pathname} 
            />
            
            {/* 2. Mobile Bottom Navigation Bar */}
            <nav className="fixed inset-x-0 bottom-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden pb-safe">
                <div className="flex items-center justify-around h-16 px-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 w-full transition-all duration-200 relative ${
                                    active ? 'text-[#EA638C] scale-105' : 'text-gray-500 hover:text-[#EA638C]/60'
                                }`}
                                aria-label={item.name}
                            >
                                <div className="relative">
                                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                    {item.name === 'Cart' && globalData?.newOrdersCount > 0 && (
                                        <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA638C] text-[10px] font-bold text-white ring-2 ring-white">
                                            {globalData.newOrdersCount}
                                        </span>
                                    )}
                                </div>
                                
                                <span className={`text-[9px] md:text-[10px] mt-1 font-medium text-center truncate px-1 ${active ? 'opacity-100 font-bold' : 'opacity-80'}`}>
                                    {item.name}
                                </span>

                                {active && (
                                    <div className="absolute top-0 w-8 h-1 bg-[#EA638C] rounded-b-full shadow-[0_1px_4px_rgba(234,99,140,0.3)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}