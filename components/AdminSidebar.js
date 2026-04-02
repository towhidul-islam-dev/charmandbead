'use client'; 

import { useState, useEffect } from 'react'; 
import Link from 'next/link';
import Image from 'next/image'; 
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; // 🟢 Added for animations
import { 
    HomeIcon, UserGroupIcon, CubeIcon, ShoppingCartIcon,
    SparklesIcon, ChatBubbleLeftRightIcon, GiftIcon, WrenchIcon,
    Bars3Icon, XMarkIcon, ArrowTopRightOnSquareIcon,
    BanknotesIcon,
    FolderIcon,
    PhotoIcon,
    BeakerIcon,
    DocumentTextIcon 
} from '@heroicons/react/24/outline';
import AdminDesktopSidebar from './AdminDesktopSidebar';

export default function AdminSidebar({ user, globalData, dbImage }) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayImage, setDisplayImage] = useState("");
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const activeImage = dbImage || user?.image;
        if (activeImage) {
            const finalUrl = activeImage.startsWith("http")
                ? activeImage
                : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${activeImage}`;
            setDisplayImage(finalUrl);
        }
    }, [dbImage, user]);

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Products', href: '/admin/products', icon: CubeIcon },
        { name: 'Categories', href: '/admin/categories', icon: FolderIcon }, 
        { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
        { 
            name: 'Lab Approval', 
            href: '/admin/product-lab', 
            icon: BeakerIcon, 
            badge: globalData?.pendingLabCount || 0 
        },
        { name: 'Carousel', href: '/admin/carousel', icon: PhotoIcon }, 
        { name: 'Inventory', href: '/admin/inventory', icon: WrenchIcon },
        { name: 'New Arrivals', href: '/admin/new-arrivals', icon: SparklesIcon }, 
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon, badge: globalData?.newOrdersCount || 0 },
        { name: 'Transactions', href: '/admin/transactions', icon: BanknotesIcon },
        { name: 'Gifts', href: '/admin/gifts', icon: GiftIcon },
        { name: 'Users', href: '/admin/users', icon: UserGroupIcon, badge: globalData?.newUsersCount || 0 },
        { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
    ];

    const isActive = (item) => {
        const isNewArrivalActive = searchParams ? searchParams.get('newArrival') === 'true' : false;
        if (item.href === '/admin') return pathname === '/admin';
        return pathname === item.href || pathname.startsWith(item.href + '/') || (item.name === 'New Arrivals' && isNewArrivalActive);
    };

    return (
        <>
            {/* 1. Mobile Hamburger Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-[110] p-2 rounded-lg bg-[#3E442B] text-white shadow-md md:hidden border border-white/10 active:scale-90 transition-transform"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>

            {/* 2. Mobile Sidebar Drawer with AnimatePresence */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[120] md:hidden">
                        {/* Smooth Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                            onClick={() => setIsOpen(false)} 
                        />

                        {/* Animated Sidebar Aside */}
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-y-0 left-0 w-72 bg-[#3E442B] shadow-2xl flex flex-col z-[130]"
                        >
                            <div className="flex flex-col h-full p-6">
                                <div className="flex items-center justify-between mb-10 shrink-0">
                                    <span className="text-[#FBB6E6] text-xl font-black uppercase tracking-widest italic">Charm & Bead</span>
                                    <button 
                                        onClick={() => setIsOpen(false)} 
                                        className="text-white hover:text-[#EA638C] bg-white/10 p-1.5 rounded-full"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <nav className="flex-1 pr-2 space-y-2 overflow-y-auto custom-scrollbar">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                                                    active ? 'bg-[#EA638C] text-white shadow-lg' : 'text-gray-300 hover:bg-white/10'
                                                }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                                <span className="text-sm font-bold tracking-tight uppercase">{item.name}</span>
                                                {item.badge > 0 && (
                                                    <span className="ml-auto bg-[#FBB6E6] text-[#3E442B] text-[10px] font-black px-2 py-0.5 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="pt-4 mt-4 space-y-4 border-t border-white/10 shrink-0">
                                    <Link 
                                        href="/" 
                                        className="flex items-center gap-4 px-4 py-3 text-[#FBB6E6] hover:bg-white/10 rounded-xl transition-all group"
                                    >
                                        <ArrowTopRightOnSquareIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                                        <span className="text-xs font-black tracking-widest uppercase">View Site</span>
                                    </Link>

                                    <div className="flex items-center gap-3 p-3 border bg-white/5 rounded-2xl border-white/5">
                                        <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-[#EA638C] flex items-center justify-center text-white font-black text-lg border border-[#FBB6E6]/20 shadow-lg">
                                            {displayImage ? (
                                                <Image src={displayImage} alt="Admin" fill className="object-cover" unoptimized />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase()
                                            )}
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
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* 3. Desktop Sidebar */}
            <div className="hidden md:block">
                <AdminDesktopSidebar 
                    user={user} 
                    globalData={globalData} 
                    currentPath={pathname} 
                    dbImage={dbImage} 
                />
            </div>
        </>
    );
}