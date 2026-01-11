'use client';

import Link from 'next/link';
import { 
    HomeIcon, 
    UserGroupIcon, 
    CubeIcon, 
    ShoppingCartIcon,
    SparklesIcon 
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: CubeIcon },
    { name: 'New Arrivals', href: '/admin/new-arrivals', icon: SparklesIcon },
    { name: 'Cart Review', href: '/admin/cart-review', icon: ShoppingCartIcon }, 
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
];

export default function AdminDesktopSidebar({ user, globalData, currentPath }) {
    
    // Logic to handle query parameters and active states
    const isActive = (item) => {
        if (typeof window === 'undefined') return currentPath === item.href;

        const searchParams = new URLSearchParams(window.location.search);
        const isNewArrivalFilter = searchParams.get('newArrival') === 'true';

        if (item.name === 'New Arrivals') {
            return currentPath === '/admin/products' && isNewArrivalFilter;
        }
        
        if (item.name === 'Products') {
            return currentPath === '/admin/products' && !isNewArrivalFilter;
        }

        return currentPath === item.href;
    };

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs shadow-lg shadow-indigo-100">A</div>
                    Admin Panel
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);

                    // Logic for the Dynamic Orders Count Badge
                    const showOrderBadge = item.name === 'Orders' && globalData?.newOrdersCount > 0;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                active 
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-400'
                            }`}
                        >
                            <Icon className={`w-5 h-5 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-400'}`} />
                            <span className="font-medium text-sm">{item.name}</span>
                            
                            {/* DYNAMIC ORDERS BADGE */}
                            {showOrderBadge && (
                                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-in zoom-in duration-300">
                                    {globalData.newOrdersCount > 9 ? '9+' : globalData.newOrdersCount}
                                </span>
                            )}

                            {/* Optional: Indicator Dot for active state */}
                            {active && (
                                <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Admin'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}