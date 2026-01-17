'use client';

import Link from 'next/link';
import { 
    HomeIcon, UserGroupIcon, CubeIcon, 
    ShoppingCartIcon, SparklesIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: CubeIcon },
    { name: 'New Arrivals', href: '/admin/new-arrivals', icon: SparklesIcon },
    { name: 'Cart Review', href: '/admin/cart-review', icon: ShoppingCartIcon }, 
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
];

export default function AdminDesktopSidebar({ user, globalData, currentPath }) {
    
    const isActive = (item) => {
        if (item.name === 'New Arrivals') return currentPath === '/admin/new-arrivals';
        return currentPath === item.href;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100">
                <h1 className="flex items-center gap-2 text-xl font-bold tracking-tighter text-indigo-600 uppercase">
                    Admin
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Icon className="flex-shrink-0 w-5 h-5" />
                            <span className="text-sm font-semibold">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center w-8 h-8 font-bold text-indigo-700 bg-indigo-100 rounded-full">
                        {user?.name?.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-gray-700 truncate">{user?.name}</p>
                </div>
            </div>
        </div>
    );
}