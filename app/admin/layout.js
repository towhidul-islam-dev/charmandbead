import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { verifyAuthToken } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar'; 
import AdminHeader from '@/components/AdminHeader'; 
import { getNewOrdersCount } from '@/actions/order'; // 💡 Import the real action

export default async function AdminLayout({ children }) {
    
    const { user, error } = await verifyAuthToken();

    // Auth Protection
    if (error) {
        redirect('/login'); 
    }

    if (user.role !== 'admin') {
        redirect('/'); 
    }
    
    // 💡 REAL DATA FETCH: Get actual count from MongoDB
    const newOrdersCount = await getNewOrdersCount();
    
    // Prepare globalData with the real count
    const globalData = {
        newOrdersCount: newOrdersCount || 0,
        totalProducts: 0, // You can add a getProductsCount() action similarly
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
            
            {/* Sidebar now receives the real database count */}
            <Suspense fallback={<div className="w-64 bg-white animate-pulse" />}>
                <AdminSidebar user={user} globalData={globalData} /> 
            </Suspense>
            
            <div className="flex flex-col flex-1 min-w-0 h-full">
                <AdminHeader user={user} />
                
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}