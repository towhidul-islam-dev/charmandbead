import { getProducts } from "@/lib/data";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard"; 
import Link from "next/link";
import { Sparkles, ArrowRight, Instagram, ArrowUpRight, ShoppingBag } from "lucide-react";
// 🟢 Import the new Client Component
import InstagramQR from "@/components/InstagramQR";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const { products: rawProducts, success } = await getProducts(false); 
  const instagramUrl = "https://www.instagram.com/charm.and.bead";

  const products = success && rawProducts ? rawProducts.map(product => ({
    ...product,
    _id: product._id.toString(),
    variants: product.variants?.map(v => ({
      ...v,
      _id: v._id.toString()
    })) || []
  })) : [];

  return (
    <main className="min-h-screen bg-white">
      <HeroCarousel />

      <section className="px-4 py-16 text-center md:py-24 bg-gradient-to-b from-white to-gray-50/50">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EA638C]/10 text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-[#EA638C]/10">
          <Sparkles size={12} /> Premium Wholesale Materials
        </div>
        <h1 className="mb-6 text-4xl italic font-black tracking-tighter text-[#3E442B] uppercase sm:text-5xl md:text-7xl">
          Build Your <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA638C] to-[#3E442B]">
            Vision Today
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm font-medium leading-relaxed text-gray-500 md:text-lg">
          Source the finest design components. Curated collections of premium beads, 
          crystals, and high-performance materials for creators.
        </p>
      </section>

      <section className="px-2 py-12 mx-auto sm:px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col justify-between gap-4 px-2 mb-10 md:flex-row md:items-end">
          <div className="text-left">
            <h2 className="flex items-center gap-3 text-3xl italic font-black tracking-tighter text-[#3E442B] uppercase md:text-4xl">
              Trending <span className="text-[#EA638C]">Now</span>
            </h2>
          </div>
          <Link href="/products" className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase group hover:text-[#EA638C] transition-colors">
            Explore Full Catalog <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {success && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] mx-2 border border-dashed border-gray-200">
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Refreshing collection...</p>
          </div>
        )}

        {/* Instagram QR Section */}
{/* --- SHRUNK INSTAGRAM SECTION --- */}
        <div className="mt-16 max-w-4xl mx-auto relative overflow-hidden bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row items-stretch">
          <div className="z-10 flex-1 p-8 md:p-12 bg-gradient-to-br from-white to-pink-50/20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA638C]/10 text-[#EA638C] mb-4">
              <Instagram size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">Connect with us</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-[#3E442B] uppercase italic tracking-tighter leading-[0.9] mb-4">
              Style <br /> On Your <br /> 
              <span className="text-[#EA638C]">Feed.</span>
            </h2>

            <p className="max-w-[240px] mb-6 text-[11px] font-medium leading-relaxed text-gray-500">
              Scan the code to follow us on Instagram for exclusive drops and design inspiration.
            </p>

            <a 
              href={instagramUrl}
              target="_blank"
              className="group inline-flex items-center gap-2.5 bg-[#3E442B] text-white px-6 py-3.5 rounded-xl hover:bg-black transition-all duration-500 shadow-lg shadow-[#3E442B]/20"
            >
              <span className="font-black uppercase text-[9px] tracking-widest">Follow @charm.and.bead</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Right Side - Shrunk QR Container */}
          <div className="w-full md:w-[320px] bg-[#3E442B] p-8 flex flex-col items-center justify-center relative min-h-[300px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#EA638C] rounded-full blur-[100px] opacity-20 animate-pulse" />
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#EA638C]/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative bg-white p-4 rounded-[2rem] shadow-2xl transition-transform duration-700 group-hover:scale-105">
                <div className="p-1.5 border border-gray-100 border-dashed rounded-xl">
                  {/* Reduced QR scale inside the component container if possible */}
                  <InstagramQR url={instagramUrl} size={140} /> 
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#EA638C] text-white px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg">
                  Scan to Follow
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-10 md:p-20 rounded-[3rem] md:rounded-[4.5rem] bg-[#3E442B] text-white flex flex-col items-center text-center relative mx-2 overflow-hidden shadow-2xl shadow-[#3E442B]/30">
          <div className="absolute bottom-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,#EA638C,transparent)]"></div>
          
          <h3 className="z-10 mb-8 text-3xl italic font-black tracking-tighter uppercase md:text-5xl">
            Ready to <span className="text-[#EA638C]">Create?</span>
          </h3>
          <Link href="/products" className="z-10 bg-[#EA638C] text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white hover:text-[#3E442B] transition-all duration-300 shadow-xl shadow-[#EA638C]/20 flex items-center gap-2 group">
            <ShoppingBag size={16} className="group-hover:animate-bounce" /> Go to Shop
          </Link>
        </div>
      </section>
    </main>
  );
}