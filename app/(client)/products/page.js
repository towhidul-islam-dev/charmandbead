import { getProducts } from '@/lib/data'; 
import ProductCatalog from '@/components/ProductCatalog'; 
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import Category from '@/models/Category'; 
import mongodb from '@/lib/mongodb';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsServerPage({ searchParams }) {
    const params = await searchParams;
    const categorySlug = params.category || '';
    const currentPage = Number(params.page) || 1;
    const limit = 16; 

    // 🟢 KEY STABILITY: Forces a clean swap when the page/category changes
    const suspenseKey = `${categorySlug}-${currentPage}`;

    return (
        <main className="relative min-h-screen pb-24 overflow-hidden bg-white">
            {/* 🎨 Ambient Brand Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FBB6E6]/15 blur-[100px] rounded-full -z-10 translate-x-1/4 -translate-y-1/4" />
            <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-[#3E442B]/5 blur-[80px] rounded-full -z-10 -translate-x-1/4" />
            
            <section className="relative px-6 pb-10 text-center pt-28 md:pt-36 md:pb-14">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#EA638C] text-[8px] font-black uppercase tracking-[0.4em] mb-6 shadow-sm border border-[#FBB6E6]/40">
                    <Sparkles size={10} fill="currentColor" className="animate-pulse" /> 
                    {categorySlug ? categorySlug.replace(/-/g, ' ') : 'Curated Collection'}
                </div>

                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl italic font-black tracking-tighter text-[#3E442B] uppercase leading-none">
                        The <span className="text-[#EA638C] not-italic">Materials</span> Shop
                    </h1>
                </div>
            </section>

            {/* 🟢 CLS FIX: min-h prevents footer from jumping up while loading */}
            <div className="mx-auto md:px-8 max-w-7xl min-h-[70vh]">
                <Suspense key={suspenseKey} fallback={<ProductSkeleton />}>
                    <ProductDataWrapper 
                        categorySlug={categorySlug} 
                        page={currentPage} 
                        limit={limit} 
                    />
                </Suspense>
            </div>
        </main>
    );
}

// 🟢 HELPER: Enforces HTTPS & Valid Fallbacks
const ensureHttps = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }
    return url;
};

async function ProductDataWrapper({ categorySlug, page, limit }) {
    await mongodb();

    const allCategories = await Category.find({}).lean();
    let filterId = null;

    if (categorySlug) {
        const foundCategory = allCategories.find(c => c.slug === categorySlug);
        if (foundCategory) filterId = foundCategory._id.toString();
    }

    const { products: rawProducts, success, totalCount } = await getProducts(false, filterId, page, limit);
    
    if (!success || !rawProducts || rawProducts.length === 0) {
        return (
            <div className="py-24 text-center bg-white border border-dashed border-[#FBB6E6]/40 rounded-[3rem]">
                <Sparkles size={24} className="mx-auto mb-4 text-[#EA638C]/20" />
                <p className="text-[9px] font-black tracking-[0.3em] text-gray-400 uppercase leading-relaxed">
                    No treasures found. <br/> New arrivals imminent.
                </p>
            </div>
        );
    }

    // 🟢 SANITIZATION FIX: Ensure all image fields (main, gallery, variants) have secure, valid URLs
    const products = JSON.parse(JSON.stringify(rawProducts)).map(p => {
        const matchedCat = allCategories.find(c => String(c._id) === String(p.category));
        const matchedSub = matchedCat?.subCategories?.find(s => String(s._id) === String(p.subCategory));
        
        const mainImage = ensureHttps(p.imageUrl || p.image || '');
        const sanitizedGallery = Array.isArray(p.gallery) 
            ? p.gallery.map(img => ensureHttps(img)).filter(Boolean)
            : [];
            
        const sanitizedVariants = Array.isArray(p.variants)
            ? p.variants.map(v => ({
                ...v,
                imageUrl: ensureHttps(v.imageUrl || v.image || '')
            }))
            : [];

        return {
            ...p,
            imageUrl: mainImage,
            gallery: sanitizedGallery,
            variants: sanitizedVariants,
            categoryName: p.categoryName || matchedCat?.name || "Collection",
            subCategoryName: p.subCategoryName || matchedSub?.name || ""
        };
    });

    const totalPages = Math.ceil(totalCount / limit);

    const getPageNumbers = () => {
        const pages = [];
        const range = 1; 
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <>
            <ProductCatalog key={`catalog-page-${page}`} initialProducts={products} />
            
            {totalPages > 1 && (
                <div className="flex flex-col items-center justify-center gap-8 mt-24 mb-10">
                    <div className="flex items-center gap-2 p-2 bg-gray-50/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 shadow-sm">
                        
                        {/* Previous Button */}
                        <Link 
                            href={`?${categorySlug ? `category=${categorySlug}&` : ''}page=${Math.max(1, page - 1)}`}
                            scroll={false}
                            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${page === 1 ? 'opacity-20 pointer-events-none' : 'bg-white text-[#3E442B] shadow-sm hover:text-[#EA638C] active:scale-95'}`}
                        >
                            <ChevronLeft size={18} />
                        </Link>

                        {/* Numbered Navigation */}
                        <div className="flex items-center gap-1 px-2">
                            {getPageNumbers().map((p, i) => (
                                p === "..." ? (
                                    <span key={`dots-${i}`} className="px-2 text-gray-300 font-bold">...</span>
                                ) : (
                                    <Link
                                        key={p}
                                        href={`?${categorySlug ? `category=${categorySlug}&` : ''}page=${p}`}
                                        scroll={false}
                                        className={`min-w-[44px] h-11 flex flex-col items-center justify-center rounded-full text-[11px] font-black transition-all duration-300 active:scale-90 ${
                                            page === p 
                                            ? 'bg-[#3E442B] text-white shadow-lg' 
                                            : 'text-gray-400 hover:text-[#EA638C] hover:bg-white'
                                        }`}
                                    >
                                        {page === p && <span className="text-[6px] uppercase tracking-tighter opacity-60 leading-none mb-0.5">Pg</span>}
                                        {p}
                                    </Link>
                                )
                            ))}
                        </div>

                        {/* Next Button */}
                        <Link 
                            href={`?${categorySlug ? `category=${categorySlug}&` : ''}page=${Math.min(totalPages, page + 1)}`}
                            scroll={false}
                            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${page === totalPages ? 'opacity-20 pointer-events-none' : 'bg-[#3E442B] text-white shadow-md hover:bg-[#EA638C] active:scale-95'}`}
                        >
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">
                        Catalogue Discovery <span className="mx-2 opacity-30">•</span> {totalCount} Materials
                    </p>
                </div>
            )}
        </>
    );
}

function ProductSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-[4/5] bg-gray-50 rounded-[2.5rem] border border-gray-100/50" />
                    <div className="px-4 space-y-2">
                        <div className="w-full h-2 bg-gray-100 rounded-full" />
                        <div className="w-2/3 h-1.5 mx-auto bg-gray-50 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}