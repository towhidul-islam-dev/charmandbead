import { getProducts } from "@/lib/data";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Instagram,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";
import InstagramQR from "@/components/InstagramQR";
import LabTeaser from "@/components/home/LabTeaser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const { products: rawProducts, success } = await getProducts(false);
  const instagramUrl = "https://www.instagram.com/charm.and.bead";

  // Keeping your exact existing logic for product mapping
  const products =
    success && rawProducts
      ? rawProducts.map((product) => ({
          ...product,
          _id: product._id.toString(),
          variants:
            product.variants?.map((v) => ({
              ...v,
              _id: v._id.toString(),
            })) || [],
        }))
      : [];

  return (
    <main className="min-h-screen bg-white">
      <HeroCarousel />

      {/* Hero Section - UI Unchanged */}
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
          Source the finest design components. Curated collections of premium
          beads, crystals, and high-performance materials for creators.
        </p>
      </section>

      <section className="px-2 py-12 mx-auto sm:px-4 md:px-8 max-w-7xl">
        {/* Trending Section - UI Unchanged */}
        <div className="flex flex-col justify-between gap-4 px-2 mb-10 md:flex-row md:items-end">
          <div className="text-left">
            <h2 className="flex items-center gap-3 text-3xl italic font-black tracking-tighter text-[#3E442B] uppercase md:text-4xl">
              Trending <span className="text-[#EA638C]">Now</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase group hover:text-[#EA638C] transition-colors"
          >
            Explore Full Catalog{" "}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
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
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Refreshing collection...
            </p>
          </div>
        )}

        {/* --- ADDED: Product Lab Section --- */}
        <div className="mt-20">
          <LabTeaser />
        </div>

{/* --- UPDATED: Ultra-Thin Desktop Instagram Section (Mobile Unchanged) --- */}
{/* --- ULTRA-MODERN: Instagram Section --- */}
<div className="mt-16 w-full relative overflow-hidden bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-2xl flex flex-col md:flex-row items-center md:h-[180px] min-h-0">
  
  {/* Left Side: Editorial Typography */}
  <div className="z-10 w-full md:w-1/2 p-10 md:p-6 md:pl-16 bg-gradient-to-br from-white to-gray-50/50 flex flex-col items-center md:items-start text-center md:text-left h-full justify-center">
    
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA638C]/10 text-[#EA638C] mb-4 md:mb-2 border border-[#EA638C]/5">
      <Instagram size={12} strokeWidth={3} />
      <span className="text-[10px] md:text-[8px] font-black uppercase tracking-[0.2em]">Connect with us</span>
    </div>
    
    <h2 className="text-3xl font-black text-[#3E442B] uppercase italic tracking-tighter leading-[0.85] mb-4 md:mb-1.5 md:text-2xl">
      Style On <span className="text-[#EA638C]">Your Feed.</span>
    </h2>
    
    <p className="max-w-xs md:max-w-none text-sm md:text-[9px] font-bold text-gray-400 uppercase tracking-tight mb-6 md:mb-3">
      Scan for exclusive drops & design inspiration.
    </p>

    <a 
      href={instagramUrl}
      target="_blank"
      className="group inline-flex items-center gap-2 bg-[#3E442B] text-white px-8 md:px-5 py-3.5 md:py-2 rounded-xl hover:bg-black transition-all duration-500 shadow-xl shadow-[#3E442B]/20"
    >
      <span className="font-black uppercase text-[10px] md:text-[8px] tracking-[0.1em]">Follow @charm.and.bead</span>
      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  </div>

  {/* Right Side: High-End QR Presentation */}
  <div className="w-full md:w-1/2 bg-[#3E442B] p-10 md:p-4 flex items-center justify-center relative min-h-[300px] md:min-h-0 h-full">
    {/* Dynamic Background Effects */}
    <div className="absolute inset-0 bg-gradient-to-tr from-[#3E442B] via-[#3E442B] to-[#EA638C]/20" />
    <div className="absolute top-0 right-0 w-48 h-48 bg-[#EA638C] rounded-full blur-[80px] opacity-10 animate-pulse" />

    <div className="relative group perspective-1000">
      {/* Floating Glass Container */}
      <div className="relative bg-white p-4 md:p-2.5 rounded-[2.2rem] md:rounded-[1.2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-2">
        
        {/* Decorative Dotted Border */}
        <div className="p-2 md:p-1 border-[1.5px] border-dashed border-gray-100 rounded-[1.8rem] md:rounded-[1rem] bg-white flex items-center justify-center">
          <div className="w-[160px] h-[160px] md:w-[100px] md:h-[100px] flex items-center justify-center">
            <InstagramQR url={instagramUrl} size={100} /> 
          </div>
        </div>
        
        {/* Floating "Scan" Badge - Upgraded to Pill Style */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#EA638C] text-white px-4 py-1.5 rounded-full shadow-[0_8px_20px_rgba(234,99,140,0.4)] border-2 border-white/20">
           <div className="flex items-center gap-1.5">
             <div className="w-1 h-1 bg-white rounded-full animate-ping" />
             <span className="text-[8px] md:text-[6px] font-black uppercase tracking-[0.25em] whitespace-nowrap">Scan</span>
           </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* CTA Section - UI Unchanged */}
        <div className="mt-16 p-10 md:p-16 rounded-[3rem] bg-[#3E442B] text-white flex flex-col items-center text-center relative mx-2 overflow-hidden shadow-2xl">
          <div className="absolute bottom-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,#EA638C,transparent)]"></div>

          <h3 className="z-10 mb-8 text-3xl italic font-black tracking-tighter uppercase md:text-5xl">
            Ready to <span className="text-[#EA638C]">Create?</span>
          </h3>
          <Link
            href="/products"
            className="z-10 bg-[#EA638C] text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white hover:text-[#3E442B] transition-all duration-300 shadow-xl shadow-[#EA638C]/20 flex items-center gap-2 group"
          >
            <ShoppingBag size={16} className="group-hover:animate-bounce" /> Go
            to Shop
          </Link>
        </div>
      </section>
    </main>
  );
}
