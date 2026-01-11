import { getProducts } from '@/lib/data'; 
import ProductCatalog from '@/components/ProductCatalog'; 
import { Sparkles } from 'lucide-react';

export default async function ProductsServerPage() {
    // Fetch all products
    const { products: rawProducts, success, error } = await getProducts();

    // Error State with Brand Styling
    if (!success) {
        return (
            <div className="px-4 py-20 mx-auto mt-16 text-center max-w-7xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest mb-6">
                    System Error
                </div>
                <h1 className="mb-4 text-4xl italic font-black tracking-tighter text-gray-900 uppercase">
                    Catalog Offline
                </h1>
                <p className="max-w-md mx-auto font-medium text-gray-500">
                    We're having trouble reaching the warehouse. Please try refreshing the page.
                </p>
                <p className="mt-4 text-[10px] font-mono text-red-400 uppercase">{error}</p>
            </div>
        );
    }

    // This converts MongoDB ObjectIds and Buffers into plain Strings for Client Components
    const products = JSON.parse(JSON.stringify(rawProducts));

    return (
        <main className="min-h-screen pb-24 bg-white">
            {/* --- Shop Header Section --- */}
            <section className="px-4 pt-24 pb-12 text-center md:pt-32 md:pb-16 bg-gray-50/50">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <Sparkles size={12} fill="currentColor" /> Full Collection
                </div>
                <h1 className="text-4xl italic font-black tracking-tighter text-[#3E442B] uppercase md:text-6xl">
                    The <span className="text-[#EA638C]">Materials</span> <br className="md:hidden" /> Shop
                </h1>
                <p className="max-w-xl px-4 mx-auto mt-6 text-sm font-medium leading-relaxed text-gray-500">
                    Browse our complete inventory of premium components. 
                    Filter by category or use search to find exactly what you need.
                </p>
            </section>

            {/* --- Main Catalog Area --- */}
            {/* 💡 Note: Ensure ProductCatalog uses grid-cols-2 inside its component */}
            <div className="px-2 mx-auto -mt-8 md:px-8 max-w-7xl">
                {products.length > 0 ? (
                    <ProductCatalog initialProducts={products} />
                ) : (
                    <div className="py-32 text-center bg-white border border-dashed border-gray-200 rounded-[3rem]">
                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                            No items found in the current collection.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}