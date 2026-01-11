import CartPage from '@/components/CartPage';
import { getProducts } from '@/lib/data';
import { ShoppingCart, LayoutDashboard, RefreshCcw, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'Admin Cart Review | J-Materials',
};

export default async function AdminCartReviewPage() {
    // 1. Fetch products from database
    const { products, success, error } = await getProducts();

    if (!success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="p-4 bg-red-50 rounded-full mb-4">
                    <AlertCircle className="text-red-500 w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Connection Error</h2>
                <p className="text-red-500 max-w-md mt-2">{error}</p>
            </div>
        );
    }

    // 2. Format data for the CartPage component
    const formattedItems = products.map(item => ({
        ...item,
        id: item._id.toString(),
        // 🚨 FIX: In your screenshot, images are broken. 
        // Ensure 'imageUrl' matches your DB field and '/placeholder.png' exists in /public.
        img: item.imageUrl || '/placeholder.png', 
        quantity: 1,
        isSelected: true,
        // Adding metadata for a cleaner admin preview
        addedDate: new Date().toLocaleDateString('en-GB')
    }));

    return (
        <div className="min-h-screen bg-[#f9fafb] md:ml-64 pb-20">
            {/* --- 🏗️ Professional Dashboard Header --- */}
            <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingCart size={16} className="text-blue-600" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Preview Mode</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Cart Review</h1>
                        <p className="text-sm text-gray-500 mt-1">Reviewing how live items appear in the user checkout flow.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:block px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Total Items</p>
                            <p className="text-sm font-bold text-gray-800">{products.length} Products</p>
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md">
                            <RefreshCcw size={16} /> Sync Database
                        </button>
                    </div>
                </div>
            </header>

            {/* --- 📦 Staging Area Container --- */}
            <main className="p-6 md:p-10 max-w-6xl">
                {/* By wrapping the CartPage in a white rounded container with "browser dots",
                    we create a visual separation between the Admin Dashboard and the User Preview.
                */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
                    {/* Fake Browser Toolbar */}
                    <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">End-User View Mockup</h2>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                        </div>
                    </div>
                    
                    <div className="p-4 md:p-8 lg:p-12">
                        {/* Render the Client Component */}
                        <CartPage initialItems={formattedItems} />
                    </div>
                </div>

                {/* --- Admin Guidance Alert --- */}
                <div className="mt-10 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <LayoutDashboard className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Developer Guidance</h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed max-w-2xl">
                            This page renders the actual <code className="bg-blue-100 px-1 rounded font-mono">CartPage.jsx</code> component used by customers. 
                            Use this review to verify that product images are optimized, prices are correctly formatted, 
                            and name lengths don't break the layout.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}