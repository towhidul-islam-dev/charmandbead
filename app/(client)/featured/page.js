import { getProducts } from "@/lib/data";
import { Zap, ShieldCheck, Truck, Sparkles } from "lucide-react";
import CategoryFilterSection from "@/components/CategoryFilterSection"; // We will move the logic here

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FeaturesPage() {
  const { products: rawProducts, success } = await getProducts(false);
  const products = success && rawProducts ? JSON.parse(JSON.stringify(rawProducts)) : [];

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

      {/* Feature Icons */}
      <section className="px-4 mx-auto mb-16 max-w-7xl md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {[
            { icon: ShieldCheck, title: "Quality Assured", desc: "Every item is verified for standards." },
            { icon: Truck, title: "Swift Delivery", desc: "Automated tracking from our door to yours." },
            { icon: Sparkles, title: "Fresh Inventory", desc: "New arrivals daily with live synchronization." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-start p-6 md:p-8 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:bg-[#3E442B] transition-all duration-300 shadow-sm">
              <div className="p-3 mb-4 transition-colors bg-white shadow-sm rounded-2xl group-hover:bg-white/10">
                <item.icon className="text-[#EA638C] group-hover:text-white" size={28} />
              </div>
              <h3 className="mb-2 text-base italic font-black text-[#3E442B] uppercase group-hover:text-white leading-none">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-gray-500 group-hover:text-gray-300">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 Integrated Category Slider & Showcase logic */}
      <section className="px-2 mx-auto max-w-7xl md:px-8">
        {products.length > 0 ? (
          <CategoryFilterSection products={products} />
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-[#FBB6E6]/20 rounded-[3rem]">
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Updating Collection...</p>
          </div>
        )}
      </section>
    </main>
  );
}