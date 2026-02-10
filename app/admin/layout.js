import { Suspense } from 'react';
import { auth } from '@/lib/auth'; 
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar'; 
import AdminHeader from '@/components/AdminHeader'; 
import { getAdminGlobalData } from '@/lib/data'; 
import { NotificationProvider } from "@/Context/NotificationContext"; 
import { Toaster } from 'react-hot-toast';

export default async function AdminLayout({ children }) {
    const session = await auth();
    
    if (!session || session.user?.role !== 'admin') {
        redirect('/login');
    }

    const user = session.user;
    const globalDataResponse = await getAdminGlobalData();
    
    const globalData = {
        newOrdersCount: globalDataResponse.newOrdersCount || 0,
        newUsersCount: globalDataResponse.newUsersCount || 0
    };

    return (
        <NotificationProvider> 
            <Toaster position="top-center" reverseOrder={false} />

            {/* Added overflow-x-hidden here to prevent the whole page from shaking/scrolling horizontally */}
            <div className="relative flex min-h-screen bg-gray-50 overflow-x-hidden">
                
                {/* Sidebar Container */}
                {/* We keep this as a wrapper. The 'fixed' positioning should be inside AdminSidebar/AdminDesktopSidebar */}
                <div className="z-[9999] shrink-0"> 
                    <Suspense fallback={<div className="w-64 h-full bg-white animate-pulse" />}>
                        <AdminSidebar user={user} globalData={globalData} /> 
                    </Suspense>
                </div>
                
                {/* Main Content Area */}
                {/* 1. md:ml-64 matches your desktop sidebar width */}
                {/* 2. flex-1 and min-w-0 are CRITICAL to stop tables from breaking the layout */}
                <div className="flex flex-col flex-1 min-w-0 md:ml-64 transition-all duration-300">
                    <AdminHeader user={user} />
                    
                    {/* Main Section */}
                    {/* Added responsive padding for better mobile feel */}
                    <main className="p-4 md:p-8 lg:p-10 w-full">
                        {children}
                    </main>
                </div>
            </div>
        </NotificationProvider>
    );
}