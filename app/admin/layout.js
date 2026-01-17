import { Suspense } from 'react';
import { auth } from '@/lib/auth'; 
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar'; 
import AdminHeader from '@/components/AdminHeader'; 
import { getNewOrdersCount } from '@/actions/order';

export default async function AdminLayout({ children }) {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') redirect('/login');

    const user = session.user;
    const newOrdersCount = await getNewOrdersCount();
    const globalData = { newOrdersCount: newOrdersCount || 0 };

    return (
        <div className="relative flex min-h-screen bg-gray-50">
            {/* 🟢 THE NUCLEAR SIDEBAR: Fixed, high z-index, forced width */}
            <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-[9999]">
                <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}>
                    <AdminSidebar user={user} globalData={globalData} /> 
                </Suspense>
            </div>
            
            {/* 🟢 THE CONTENT: Pushed to the right using ml-64 */}
            <div className="flex flex-col flex-1 min-w-0 md:ml-64">
                <AdminHeader user={user} />
                <main className="p-4 md:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}