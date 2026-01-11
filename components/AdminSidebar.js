'use client'; 

import Link from 'next/link';
import { usePathname,useSearchParams } from 'next/navigation';
import { 
    HomeIcon, 
    UserGroupIcon, 
    CubeIcon, 
    ShoppingCartIcon,
    SparklesIcon // 💡 Added for New Arrivals
} from '@heroicons/react/24/outline';
import AdminDesktopSidebar from './AdminDesktopSidebar';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: CubeIcon },
    // 💡 NEW: Added New Arrivals management link
    // { name: 'New Arrivals', href: '/admin/products?newArrival=true', icon: SparklesIcon }, 
    { name: 'New Arrivals', href: '/admin/new-arrivals', icon: SparklesIcon }, 
    { name: 'Cart', href: '/admin/cart-review', icon: ShoppingCartIcon }, 
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
];

export default function AdminSidebar({ user, globalData }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // Improved isActive to handle the query string for New Arrivals
    const isActive = (item) => {
        if (item.href === '/admin') return pathname === '/admin';
    
    // Check if the current URL has ?newArrival=true
    const isNewArrivalActive = searchParams.get('newArrival') === 'true';
    
    // Special check for the New Arrivals menu item
    if (item.name === 'New Arrivals') {
        return pathname.startsWith('/admin/new-arrivals') && isNewArrivalActive;
    }

    // For other items, ensure they are active only if newArrival is NOT true
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
                                    active ? 'text-indigo-600 scale-105' : 'text-gray-500 hover:text-indigo-400'
                                }`}
                                aria-label={item.name}
                            >
                                <div className="relative">
                                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                    {item.name === 'Cart' && globalData?.newOrdersCount > 0 && (
                                        <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                            {globalData.newOrdersCount}
                                        </span>
                                    )}
                                </div>
                                
                                <span className={`text-[9px] md:text-[10px] mt-1 font-medium text-center truncate px-1 ${active ? 'opacity-100' : 'opacity-80'}`}>
                                    {item.name}
                                </span>

                                {active && (
                                    <div className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}