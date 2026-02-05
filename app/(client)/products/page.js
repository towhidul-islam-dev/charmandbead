import { getProducts } from '@/lib/data'; 
import ProductCatalog from '@/components/ProductCatalog'; 
import { Sparkles } from 'lucide-react';
import { Suspense } from 'react';
import { silentInventoryHeal } from '@/actions/product'; 

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsServerPage() {
    return (
        <main className="min-h-screen bg-white pb-24 relative overflow-hidden">
            {/* 🎨 Ambient Brand Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FBB6E6]/15 blur-[100px] rounded-full -z-10 translate-x-1/4 -translate-y-1/4" />
            <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-[#3E442B]/5 blur-[80px] rounded-full -z-10 -translate-x-1/4" />
            
            {/* 🟢 Refined Compact Header */}
            <section className="px-6 pt-28 pb-10 text-center md:pt-36 md:pb-14 relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#EA638C] text-[8px] font-black uppercase tracking-[0.4em] mb-6 shadow-sm border border-[#FBB6E6]/40">
                    <Sparkles size={10} fill="currentColor" className="animate-pulse" /> 
                    Curated Collection
                </div>

                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl italic font-black tracking-tighter text-[#3E442B] uppercase leading-none">
                        The <span className="text-[#EA638C] not-italic">Materials</span> Shop
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 mt-5">
                        <div className="h-[1px] w-6 bg-[#3E442B]/20" />
                        <p className="text-[9px] font-bold tracking-[0.5em] text-gray-400 uppercase">
                            Premium Wholesale • 2026
                        </p>
                        <div className="h-[1px] w-6 bg-[#3E442B]/20" />
                    </div>
                </div>
            </section>

            {/* 🟢 Catalog Container */}
            <div className="px-4 mx-auto md:px-8 max-w-7xl">
                <Suspense fallback={<ProductSkeleton />}>
                    <ProductDataWrapper />
                </Suspense>
            </div>
        </main>
    );
}

async function ProductDataWrapper() {
    await silentInventoryHeal();

    const { products: rawProducts, success } = await getProducts(false);
    const products = success && rawProducts ? JSON.parse(JSON.stringify(rawProducts)) : [];

    if (products.length === 0) {
        return (
            <div className="py-24 text-center bg-white border border-dashed border-[#FBB6E6]/40 rounded-[3rem]">
                <Sparkles size={24} className="mx-auto mb-4 text-[#EA638C]/20" />
                <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase leading-relaxed">
                    Updating the catalog. <br/> New arrivals imminent.
                </p>
            </div>
        );
    }

    return <ProductCatalog initialProducts={products} />;
}

function ProductSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-[4/5] bg-gray-50 rounded-[2.5rem] border border-gray-100/50" />
                    <div className="space-y-2 px-4">
                        <div className="w-full h-2 bg-gray-100 rounded-full" />
                        <div className="w-2/3 h-1.5 mx-auto bg-gray-50 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}