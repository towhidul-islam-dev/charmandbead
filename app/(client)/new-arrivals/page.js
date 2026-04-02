import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// This tells Next.js to refresh this page every 60 seconds
export const revalidate = 60;

export default async function NewArrivalsPage({ searchParams }) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const limit = 12; // Adjusted for a clean 3 or 4 column grid
    
    let products = [];
    let totalCount = 0;

    try {
        await dbConnect();
        
        // Fetch total count for pagination
        totalCount = await Product.countDocuments({ isNewArrival: true });

        // Fetch paginated data
        const data = await Product.find({ isNewArrival: true })
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * limit)
            .limit(limit)
            .lean();
        
        products = JSON.parse(JSON.stringify(data));
        
    } catch (error) {
        console.error("Database error in New Arrivals:", error);
    }

    const totalPages = Math.ceil(totalCount / limit);

    // Pagination Logic Helper
    const getPageNumbers = () => {
        const pages = [];
        const range = 1;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <main className="relative min-h-screen pb-24 overflow-hidden bg-white">
            {/* 🎨 Ambient Brand Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FBB6E6]/15 blur-[100px] rounded-full -z-10 translate-x-1/4 -translate-y-1/4" />
            
            <div className="max-w-7xl mx-auto px-4 py-16 mt-16 md:mt-24 min-h-[70vh]">
                {/* Header Section - Brand Aligned */}
                <div className="flex flex-col items-center mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#EA638C] text-[8px] font-black uppercase tracking-[0.4em] mb-6 shadow-sm border border-[#FBB6E6]/40">
                        <Sparkles size={12} className="animate-pulse" />
                        <span>Just Arrived</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl italic font-black tracking-tighter text-[#3E442B] uppercase leading-none mb-6">
                        New <span className="text-[#EA638C] not-italic">Arrivals</span>
                    </h1>
                    
                    <p className="max-w-lg text-[10px] md:text-xs font-bold tracking-widest text-gray-400 uppercase leading-relaxed">
                        Discover our latest collection and upcoming <br /> premium additions to the catalog.
                    </p>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="py-24 text-center border-2 border-gray-100 border-dashed bg-gray-50/30 rounded-[3rem] mx-2">
                        <p className="text-[10px] font-black tracking-[0.3em] text-gray-300 uppercase leading-relaxed">
                            Stay tuned! <br /> New products are arriving soon.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-8">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        {/* Pagination Controls - Brand Aligned */}
                        {totalPages > 1 && (
                            <div className="flex flex-col items-center justify-center gap-6 mt-20">
                                <div className="flex items-center gap-2 p-1.5 bg-gray-50/80 backdrop-blur-md rounded-full border border-gray-100 shadow-sm">
                                    <Link
                                        href={`?page=${Math.max(1, currentPage - 1)}`}
                                        scroll={false}
                                        className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${currentPage === 1 ? 'opacity-20 pointer-events-none' : 'bg-white text-[#3E442B] hover:text-[#EA638C] shadow-sm'}`}
                                    >
                                        <ChevronLeft size={18} />
                                    </Link>

                                    <div className="flex items-center gap-1 px-1">
                                        {getPageNumbers().map((p, i) => (
                                            p === "..." ? (
                                                <span key={`dots-${i}`} className="px-2 text-gray-300 font-bold text-xs">...</span>
                                            ) : (
                                                <Link
                                                    key={p}
                                                    href={`?page=${p}`}
                                                    scroll={false}
                                                    className={`w-11 h-11 flex flex-col items-center justify-center rounded-full text-[10px] font-black transition-all ${
                                                        currentPage === p ? 'bg-[#3E442B] text-white shadow-md' : 'text-gray-400 hover:text-[#EA638C]'
                                                    }`}
                                                >
                                                    {currentPage === p && <span className="text-[5px] uppercase tracking-tighter opacity-60 leading-none">Pg</span>}
                                                    {p}
                                                </Link>
                                            )
                                        ))}
                                    </div>

                                    <Link
                                        href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                                        scroll={false}
                                        className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${currentPage === totalPages ? 'opacity-20 pointer-events-none' : 'bg-[#3E442B] text-white hover:bg-[#EA638C] shadow-md'}`}
                                    >
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">
                                    Latest Treasures <span className="mx-2 opacity-30">•</span> {totalCount} Total
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}