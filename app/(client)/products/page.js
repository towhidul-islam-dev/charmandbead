import { getProducts } from '@/lib/data'; 
import ProductCatalog from '@/components/ProductCatalog'; 
import { Sparkles } from 'lucide-react';
import { Suspense } from 'react';
import { silentInventoryHeal } from '@/actions/product'; // 🟢 Import the healer

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsServerPage() {
    return (
        /* 🎨 UI Update: Using a 5% opacity of your lightPink for a premium 'gallery' vibe */
        <main className="min-h-screen bg-[#FBB6E6]/10 pb-24">
            
            {/* 🟢 Corrected Spacing & Header */}
            <section className="px-4 pt-24 pb-12 text-center md:pt-32 md:pb-4">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-pink-100">
                    <Sparkles size={12} fill="currentColor" className="animate-pulse" /> 
                    Full Collection
                </div>

                <h1 className="text-5xl italic font-black tracking-tighter text-[#3E442B] uppercase md:text-7xl lg:text-8xl leading-none">
                    The <span className="text-[#EA638C] not-italic">Materials</span> Shop
                </h1>
                
                <p className="mt-6 text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase">
                    Curated Excellence • Est. 2026
                </p>
            </section>

            {/* 🟢 Catalog Container with consistent max-width */}
            <div className="px-4 mx-auto md:px-8 max-w-7xl">
                <Suspense fallback={<ProductSkeleton />}>
                    <ProductDataWrapper />
                </Suspense>
            </div>
        </main>
    );
}

async function ProductDataWrapper() {
    // 🟢 Step 1: Silent Heal
    // This runs on the server before getProducts, ensuring math is 100% correct
    await silentInventoryHeal();

    // Step 2: Fetch the data
    const { products: rawProducts, success } = await getProducts(false);
    const products = success && rawProducts ? JSON.parse(JSON.stringify(rawProducts)) : [];

    if (products.length === 0) {
        return (
            <div className="py-32 text-center bg-white border-2 border-dashed border-gray-100 rounded-[3rem] shadow-sm">
                <div className="flex justify-center mb-4 text-[#EA638C]/20">
                    <Sparkles size={32} />
                </div>
                <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                    New materials arriving soon.
                </p>
            </div>
        );
    }

    return <ProductCatalog initialProducts={products} />;
}

function ProductSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-[4/5] bg-white rounded-[2.5rem] shadow-sm" />
                    <div className="w-3/4 h-3 mx-auto bg-gray-200 rounded-full" />
                    <div className="w-1/2 h-3 mx-auto bg-gray-100 rounded-full" />
                </div>
            ))}
        </div>
    );
}