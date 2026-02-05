import dbConnect  from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import { Sparkles } from "lucide-react";

// This tells Next.js to refresh this page every 60 seconds
export const revalidate = 60;

export default async function NewArrivalsPage() {
    let products = [];

    try {
        await dbConnect();
        
        // 💡 Direct DB Query: No 'fetch' or 'undefined URL' issues
        const data = await Product.find({ isNewArrival: true })
                                  .sort({ createdAt: -1 })
                                  .lean(); // .lean() makes it a plain JS object
        
        // Convert MongoDB objects to plain JSON for the Client Components
        products = JSON.parse(JSON.stringify(data));
        
    } catch (error) {
        console.error("Database error in New Arrivals:", error);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 mt-10 min-h-[70vh]">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-12 text-center">
                <div className="flex items-center gap-2 px-4 py-2 mb-4 text-indigo-600 rounded-full bg-indigo-50">
                    <Sparkles size={18} className="animate-pulse" />
                    <span className="text-xs font-bold tracking-wider uppercase">Just Arrived</span>
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
                    New Arrivals
                </h1>
                <p className="max-w-lg text-gray-500">
                    Discover our latest collection and upcoming premium additions.
                </p>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="py-20 text-center border-2 border-gray-200 border-dashed bg-gray-50 rounded-3xl">
                    <p className="text-lg italic text-gray-400">Stay tuned! New products are arriving soon.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-8">
    {products.map((product) => (
        <ProductCard key={product._id} product={product} />
    ))}
</div>
            )}
        </div>
    );
}