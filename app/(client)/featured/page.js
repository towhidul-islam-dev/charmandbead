import { getProducts } from "@/lib/data";
import { Zap, ShieldCheck, Truck, Sparkles } from "lucide-react";
import FeatureShowcase from "@/components/FeatureShowcase";

// 🟢 FORCE FRESH DATA: Ensures archived items are removed from this page immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FeaturesPage() {
  // 🟢 PASS 'false': Only fetch products that are NOT archived
  const { products: rawProducts, success } = await getProducts(false);

  // 💡 Serialize the products to plain JavaScript objects
  const products = success && rawProducts ? JSON.parse(JSON.stringify(rawProducts)) : [];

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <section className="px-4 py-12 mt-16 text-center md:mt-20 md:py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Zap size={12} fill="currentColor" /> Premium Features
        </div>
        <h1 className="text-4xl italic font-black tracking-tighter text-gray-900 uppercase md:text-6xl lg:text-7xl">
          The <span className="text-[#EA638C]">Next Level</span> Materials
        </h1>
      </section>

      {/* Feature Icons */}
      <section className="px-4 mx-auto mb-20 max-w-7xl md:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {[
            { icon: ShieldCheck, title: "Quality Assured", desc: "Every item is verified for standards." },
            { icon: Truck, title: "Swift Delivery", desc: "Automated tracking from our door to yours." },
            { icon: Sparkles, title: "Fresh Inventory", desc: "New arrivals daily with live synchronization." }
          ].map((item, i) => (
            <div key={i} className="p-6 md:p-8 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:bg-[#3E442B] transition-all">
              <item.icon className="mb-4 text-[#EA638C] group-hover:text-white" size={32} />
              <h3 className="mb-2 text-base italic font-black text-gray-900 uppercase group-hover:text-white">{item.title}</h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="px-2 mx-auto max-w-7xl md:px-8">
        {/* If no products are found (or all are archived), you could show a fallback or the showcase handle it */}
        {products.length > 0 ? (
          <FeatureShowcase products={products} />
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Updating Collection...</p>
          </div>
        )}
      </section>
    </main>
  );
}