import { getProducts } from '@/lib/data'; 
import ProductCatalog from '@/components/ProductCatalog'; 
import { Sparkles } from 'lucide-react';
import { Suspense } from 'react';
// 🟢 FORCE FRESH DATA: Critical for the main shop to prevent 
// customers from seeing or buying archived items.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsServerPage() {
    return (
        <main className="min-h-screen pb-24">
            <section className="px-4 py-12 mt-16 text-center md:mt-20 md:py-16 ">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <Sparkles size={12} fill="currentColor" /> Full Collection
                </div>
                <h1 className="text-4xl italic font-black tracking-tighter text-[#3E442B] uppercase md:text-6xl">
                    The <span className="text-[#EA638C]">Materials</span> Shop
                </h1>
            </section>

            <div className="px-2 mx-auto mt-8 md:px-8 max-w-7xl">
                {/* Wrap the data fetching part in Suspense */}
                <Suspense fallback={<ProductSkeleton />}>
                    <ProductDataWrapper />
                </Suspense>
            </div>
        </main>
    );
}

// Separate the data fetching logic
async function ProductDataWrapper() {
    const { products: rawProducts, success } = await getProducts(false);
    const products = success && rawProducts ? JSON.parse(JSON.stringify(rawProducts)) : [];

    if (products.length === 0) {
        return (
            <div className="py-32 text-center border border-dashed border-gray-200 rounded-[3rem]">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    No items found in this collection.
                </p>
            </div>
        );
    }

    return <ProductCatalog initialProducts={products} />;
}

// Simple Loading UI to prevent layout shift
function ProductSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-[2rem]" />
            ))}
        </div>
    );
}