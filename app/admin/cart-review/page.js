import CartPage from '@/components/CartPage';
import { getProducts } from '@/lib/data';
import { ShoppingCart, LayoutDashboard, RefreshCcw, AlertCircle, Eye, Database } from 'lucide-react';

export const metadata = {
    title: 'Admin Cart Review | J-Materials',
};

export default async function AdminCartReviewPage() {
    const { products, success, error } = await getProducts();

    if (!success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="p-4 mb-4 bg-red-50 rounded-3xl">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-xl font-black tracking-tighter text-gray-900 uppercase">Connection Error</h2>
                <p className="max-w-md mt-2 font-medium text-red-500">{error}</p>
            </div>
        );
    }

    const sanitizedProducts = JSON.parse(JSON.stringify(products));

    const formattedItems = sanitizedProducts.map(item => {
        const firstVariant = item.variants?.[0] || {};
        return {
            ...item,
            productId: item._id,
            uniqueKey: `${item._id}-preview`, 
            name: item.name,
            price: firstVariant.price || item.price,
            imageUrl: item.imageUrl || firstVariant.image || '/placeholder.png',
            color: firstVariant.color || "Standard",
            size: firstVariant.size || "Standard",
            stock: firstVariant.stock || item.stock || 0,
            quantity: firstVariant.minOrderQuantity || item.minOrderQuantity || 1,
            minOrderQuantity: firstVariant.minOrderQuantity || item.minOrderQuantity || 1,
        };
    });

    return (
        <div className="pb-20 max-w-[1600px] mx-auto px-4 lg:px-8">
            {/* TOP HEADER SECTION */}
            <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-[#EA638C]/10 px-3 py-1 rounded-full border border-[#EA638C]/20">
                            <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <Eye size={12} className="animate-pulse" /> Live Preview Mode
                            </span>
                        </div>
                    </div>
                    <h1 className="text-4xl italic font-black tracking-tighter text-[#3E442B] uppercase">
                        Cart <span className="text-[#EA638C]">Review</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 text-right bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-end gap-1">
                           <Database size={10} /> MongoDB Status
                        </p>
                        <p className="text-lg font-black text-[#3E442B]">{products.length} Products Loaded</p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTAINER: Full-width alignment */}
<div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
    {/* System Label Bar */}
    <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-gray-50/50">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            sys.render_full_width_bypass
        </span>
    </div>
    
    {/* 🛠️ THE FIX: Force all children to ignore max-width limits */}
    <div className="w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] p-4 md:p-8">
        <div className="w-full bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
            
            {/* The class below ([&_*]:max-w-none) is a "Nuclear Option". 
                It forces EVERY element inside to stop shrinking to a center column.
            */}
            <div className="w-full [&_*]:max-w-none [&_.container]:max-w-none [&_.container]:w-full">
                <CartPage initialItems={formattedItems} isAdminPreview={true} />
            </div>

        </div>
    </div>
</div>

            {/* FOOTER ACTION (OPTIONAL) */}
            <div className="flex justify-center mt-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                    End of Production Preview — Charm & Bead 2026
                </p>
            </div>
        </div>
    );
}