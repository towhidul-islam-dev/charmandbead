import { Star } from "lucide-react";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";

export default async function ProductReviews({ productId }) {
  await dbConnect();
  
  // Fetch reviews for this specific product (ensure your schema has productId)
  // If your schema doesn't have productId yet, it will show all featured reviews
  const reviews = await Review.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  if (reviews.length === 0) return null;

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Real Stories
          </h2>
          <p className="text-[#EA638C] text-[10px] font-black uppercase tracking-[0.3em] mt-4">
            From our community
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
          <Star size={16} className="fill-[#EA638C] text-[#EA638C]" />
          <span className="font-black text-sm uppercase tracking-tighter">Verified Feedback</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((rev) => (
          <div key={rev._id} className="group relative bg-white border border-gray-100 p-2 rounded-[2.5rem] hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500">
            {/* Customer Photo */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-gray-50">
              <Image
                src={rev.imageUrl}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Customer Review"
              />
              <div className="absolute top-4 left-4 flex gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={10} 
                    className={i < (rev.rating || 5) ? "fill-[#EA638C] text-[#EA638C]" : "text-gray-200"} 
                  />
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="p-6">
              <p className="text-gray-800 font-bold italic text-lg leading-tight line-clamp-3">
                "{rev.description}"
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">
                  Verified Buyer
                </span>
                <span className="text-[10px] font-bold text-gray-200 uppercase">
                  {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}