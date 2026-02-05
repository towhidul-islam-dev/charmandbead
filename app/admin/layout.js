// app/admin/layout.js (or wherever your AdminLayout is)
import { Suspense } from 'react';
import { auth } from '@/lib/auth'; 
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar'; 
import AdminHeader from '@/components/AdminHeader'; 
import { getAdminGlobalData } from '@/lib/data'; 
// 🟢 IMPORT THE PROVIDER
import { NotificationProvider } from "@/Context/NotificationContext"; 

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
        // 🟢 WRAP EVERYTHING HERE
        <NotificationProvider> 
            <div className="relative flex min-h-screen bg-gray-50">
                <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-[9999]">
                    <Suspense fallback={<div className="w-full h-full bg-white border-r border-gray-100 animate-pulse" />}>
                        <AdminSidebar user={user} globalData={globalData} /> 
                    </Suspense>
                </div>
                
                <div className="flex flex-col flex-1 min-w-0 pb-20 md:ml-64 md:pb-0">
                    <AdminHeader user={user} />
                    <main className="p-4 md:p-10">
                        {children}
                    </main>
                </div>
            </div>
        </NotificationProvider>
    );
}