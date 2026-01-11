// app/admin/layout.js (FINAL LIVE SERVER COMPONENT)

import { redirect } from 'next/navigation';
import { verifyAuthToken } from '@/lib/auth'; 
import AdminSidebar from '@/components/AdminSidebar1'; 
import AdminHeader from '@/components/AdminHeader1'; 

async function fetchGlobalAdminData() {
    return {
        newOrdersCount: 5,
        totalProducts: 120,
    };
}

export default async function AdminLayout({ children }) {
    const { user, error } = await verifyAuthToken();

    if (error) {
        redirect('/login'); 
    }

    if (user.role !== 'admin') {
        redirect('/'); 
    }
    
    const globalData = await fetchGlobalAdminData();

    return (
        /* Added 'overflow-x-hidden' to the root to prevent 
           any horizontal "jiggle" on mobile devices.
        */
        <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
            
            {/* 1. Sidebar (Fixed position) */}
            <AdminSidebar user={user} globalData={globalData} /> 
            
            {/* 2. Main Content Area */}
            <div className={`
                flex flex-col flex-1 
                /* min-w-0 is the "Magic Fix": It forces this flex child 
                   to be able to shrink smaller than its content (the tables).
                */
                min-w-0 
                /* Desktop: Push content to the right of the 64-unit sidebar */
                md:ml-64 
                /* Mobile: Bottom padding so content isn't hidden by the Nav bar */
                pb-20 md:pb-0 
                transition-all duration-300
            `}>
                <AdminHeader user={user} />
                
                {/* overflow-x-hidden on the main tag ensures that any 
                   scrolling happens ONLY inside specific table wrappers, 
                   not the whole page.
                */}
                <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto md:p-8">
                    {/* Centered wrapper to maintain consistent max-width if desired */}
                    <div className="w-full max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}