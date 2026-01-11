// components/AdminSidebar.jsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// You might need to install and import icons here (e.g., lucide-react)

const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        // Fixed width (w-64) and fixed position (sticky top-0) for the sidebar
        // 💡 Using brand-dark-pink background and brand-primary for accents
        <div className="flex flex-col w-64 bg-brand-dark-pink text-white h-screen sticky top-0 shadow-xl">
            
            {/* Logo/Title Area */}
            <div className="p-6 border-b border-brand-primary/50">
                <h1 className="text-2xl font-bold text-brand-accent">J-Admin</h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center p-3 rounded-lg transition duration-150 
                                ${isActive 
                                    ? 'bg-brand-primary text-white shadow-md' 
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            {/* You would add icons here */}
                            <span className="ml-3 font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer or User Info (Optional) */}
            <div className="p-4 border-t border-brand-primary/50">
                <p className="text-sm text-gray-400">Logged in as Admin</p>
            </div>
        </div>
    );
}