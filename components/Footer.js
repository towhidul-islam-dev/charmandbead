// components/Footer.jsx

import Link from 'next/link';

export default function Footer() {
    // Current year for the copyright notice
    const currentYear = new Date().getFullYear(); 

    return (
        // 💡 Background is now 'bg-brand-dark-pink'
        // 💡 Border is now a solid 'border-brand-primary'
        <footer className="pt-10 pb-6 mt-16 text-white border-t bg-brand-primary border-brand-primary">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 pb-8 border-b border-brand-secondary md:grid-cols-4">
                    
                    {/* 1. Brand Info */}
                    <div>
                        <h3 className="mb-3 text-xl font-bold text-brand-primary">J-Materials</h3>
                        <p className="text-sm text-gray-400">
                            Source the finest certified raw materials for your jewelry workshop, direct from the source.
                        </p>
                    </div>
                    
                    {/* 2. Shop Links */}
                    <div>
                        <h4 className="mb-3 font-semibold text-white text-md">Shop</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/products" className="text-gray-300 transition hover:text-brand-primary">All Materials</Link></li>
                            <li><Link href="/featured" className="text-gray-300 transition hover:text-brand-primary">Featured Gems</Link></li>
                            <li><Link href="/metals" className="text-gray-300 transition hover:text-brand-primary">Precious Metals</Link></li>
                            <li><Link href="/contact" className="text-gray-300 transition hover:text-brand-primary">Custom Sourcing</Link></li>
                        </ul>
                    </div>
                    
                    {/* 3. Account Links */}
                    <div>
                        <h4 className="mb-3 font-semibold text-white text-md">Account</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/login" className="text-gray-300 transition hover:text-brand-primary">Sign In</Link></li>
                            <li><Link href="/account" className="text-gray-300 transition hover:text-brand-primary">View Orders</Link></li>
                            <li><Link href="/admin" className="text-brand-accent transition hover:text-red-300">Admin Access</Link></li>
                        </ul>
                    </div>
                    
                    {/* 4. Legal & Support */}
                    <div>
                        <h4 className="mb-3 font-semibold text-white text-md">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/faq" className="text-gray-300 transition hover:text-brand-primary">FAQ</Link></li>
                            <li><Link href="/policy" className="text-gray-300 transition hover:text-brand-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-300 transition hover:text-brand-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Line */}
                <div className="mt-6 text-sm text-center text-gray-500">
                    &copy; {currentYear} J-Materials. All rights reserved.
                </div>
            </div>
        </footer>
    );
}