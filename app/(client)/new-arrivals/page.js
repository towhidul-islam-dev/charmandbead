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
            <div className="flex flex-col items-center text-center mb-12">
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full mb-4">
                    <Sparkles size={18} className="animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Just Arrived</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                    New Arrivals
                </h1>
                <p className="text-gray-500 max-w-lg">
                    Discover our latest collection and upcoming premium additions.
                </p>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-lg italic">Stay tuned! New products are arriving soon.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}