import { getProducts } from "@/lib/data";
import { Zap, ShieldCheck, Truck, Sparkles, ChevronRight } from "lucide-react";
import FeatureShowcase from "@/components/FeatureShowcase";
import Image from "next/image";

// 🟢 FORCE FRESH DATA (Logic remains identical)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FeaturesPage() {
  const { products: rawProducts, success } = await getProducts(false);
  const products = success && rawProducts ? JSON.parse(JSON.stringify(rawProducts)) : [];

  // ✨ Refined logic to extract unique categories AND count items
  const categories = products.reduce((acc, product) => {
    const categoryName = product.category || "General";
    const existing = acc.find((c) => c.name === categoryName);
    
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        name: categoryName,
        image: product.imageUrl || product.image || "/placeholder.png",
        count: 1
      });
    }
    return acc;
  }, []);

  return (
    <main className="min-h-screen pb-20 bg-white">
      {/* Header */}
      <section className="px-4 py-12 mt-16 text-center md:mt-20 md:py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-[#FBB6E6]/30">
          <Zap size={12} fill="currentColor" /> Premium Features
        </div>
        <h1 className="text-4xl italic font-black tracking-tighter text-[#3E442B] uppercase md:text-6xl lg:text-7xl leading-tight">
          The <span className="text-[#EA638C]">Next Level</span> Materials
        </h1>
      </section>

      {/* 🚀 CATEGORY SLIDER SECTION WITH ITEM COUNTS */}
      {categories.length > 0 && (
        <section className="mb-20 overflow-hidden">
          <div className="flex items-center justify-between px-6 mx-auto mb-8 max-w-7xl md:px-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B]">Materials Collection</h2>
            <div className="h-[1px] flex-1 mx-6 bg-gray-100 hidden md:block"></div>
            <span className="text-[10px] font-black text-[#EA638C] uppercase flex items-center gap-2 italic">
              Slide to view <ChevronRight size={12} />
            </span>
          </div>

          {/* Horizontal Slider */}
          <div className="flex gap-5 px-6 pb-8 overflow-x-auto no-scrollbar snap-x snap-mandatory md:px-8">
            {categories.map((cat, i) => (
              <div 
                key={i} 
                className="snap-center flex-shrink-0 w-[160px] md:w-[220px] group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-2 border-white shadow-md transition-all duration-500 group-hover:shadow-2xl group-hover:border-[#EA638C] group-hover:-translate-y-2 bg-gray-50">
                  <Image 
                    src={cat.image} 
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* ✨ Item Count Badge (Top Right) */}
                  <div className="absolute top-4 right-4 bg-[#FBB6E6] text-[#EA638C] px-3 py-1 rounded-full text-[9px] font-black shadow-sm z-10 border border-white/50">
                    {cat.count} {cat.count === 1 ? 'ITEM' : 'ITEMS'}
                  </div>

                  {/* Brand Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3E442B]/80 via-transparent to-transparent opacity-80" />
                  
                  {/* Label */}
                  <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
                    <p className="text-[11px] md:text-[13px] font-black text-white uppercase tracking-widest italic drop-shadow-lg">
                      {cat.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature Icons */}
      <section className="px-4 mx-auto mb-20 max-w-7xl md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {[
            { icon: ShieldCheck, title: "Quality Assured", desc: "Every item is verified for standards." },
            { icon: Truck, title: "Swift Delivery", desc: "Automated tracking from our door to yours." },
            { icon: Sparkles, title: "Fresh Inventory", desc: "New arrivals daily with live synchronization." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-start p-6 md:p-8 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:bg-[#3E442B] transition-all duration-300 shadow-sm">
              <div className="mb-4 p-3 bg-white rounded-2xl shadow-sm group-hover:bg-white/10 transition-colors">
                <item.icon className="text-[#EA638C] group-hover:text-white" size={28} />
              </div>
              <h3 className="mb-2 text-base italic font-black text-[#3E442B] uppercase group-hover:text-white leading-none">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="px-2 mx-auto max-w-7xl md:px-8">
        {products.length > 0 ? (
          <FeatureShowcase products={products} />
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-[#FBB6E6]/20 rounded-[3rem]">
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Updating Collection...</p>
          </div>
        )}
      </section>
    </main>
  );
}