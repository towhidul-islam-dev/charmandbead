// components/Header.jsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook to highlight the active link
// import { useAuth } from '../hooks/useAuth'; // Replace with your actual auth hook

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Featured', href: '/featured' },
];

export default function Header() {
    const pathname = usePathname();
    // PSEUDOCODE: Replace with your actual authentication state
    const { isAuthenticated, userRole } = { isAuthenticated: false, userRole: null }; 

    // Function to apply active/inactive styles
    const getLinkClasses = (href) => {
        const isActive = pathname === href;
        return `font-medium hover:text-blue-600 transition-colors duration-150 ${
            isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'
        }`;
    };

    return (
        // Fixed header for consistent navigation experience
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                
                {/* 1. Logo / Brand Name */}
                <Link href="/" className="text-3xl font-bold tracking-tight text-gray-800 hover:text-gray-900 transition">
                    💎 J-Materials
                </Link>

                {/* 2. Primary Navigation */}
                <nav className="flex space-x-8">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href} className={getLinkClasses(link.href)}>
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* 3. Authentication & Admin Links (Conditional) */}
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <>
                            {userRole === 'Admin' && (
                                <Link href="/admin/dashboard" className="text-sm px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition duration-150">
                                    Admin Panel
                                </Link>
                            )}
                            <button 
                                onClick={() => console.log('Handle Logout')}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="text-sm px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition duration-150">
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}