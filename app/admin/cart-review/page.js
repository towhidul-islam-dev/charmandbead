import CartPage from '@/components/CartPage';
import { getProducts } from '@/lib/data';
import { ShoppingCart, LayoutDashboard, RefreshCcw, AlertCircle, Eye } from 'lucide-react';

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

    // 🛠️ FIX: Serialize MongoDB objects to plain JSON strings/objects
    const sanitizedProducts = JSON.parse(JSON.stringify(products));

    const formattedItems = sanitizedProducts.map(item => {
        // If the product has variants, we use the first one for the preview
        const firstVariant = item.variants?.[0] || {};
        
        return {
            ...item,
            productId: item._id,
            // Create a uniqueKey so the Cart checkbox logic works
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
        <div className="pb-20">
            <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-[#EA638C]/10 px-2 py-1 rounded-lg">
                            <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest flex items-center gap-1">
                                <Eye size={12} /> Live Preview Mode
                            </span>
                        </div>
                    </div>
                    <h1 className="text-3xl italic font-black tracking-tighter text-gray-900 uppercase">
                        Cart <span className="text-[#EA638C]">Review</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-5 py-2 text-right bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Database</p>
                        <p className="text-sm font-black text-gray-800">{products.length} Products</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/80">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        previewing_cart_ui.sys
                    </span>
                </div>
                
                <div className="p-4 md:p-10 lg:p-14 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                        {/* 🟢 PASSING THE DATA HERE */}
                        <CartPage initialItems={formattedItems} isAdminPreview={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}