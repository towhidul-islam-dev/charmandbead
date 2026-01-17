import { getProducts } from "@/lib/data";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard"; 
import Link from "next/link";
import { Sparkles, ArrowRight, Instagram, ArrowUpRight } from "lucide-react";
import QRCode from "react-qr-code";

// 🟢 FORCE FRESH DATA: Ensures that when you archive an item in admin, 
// it disappears from the homepage immediately for users.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // 🟢 PASS 'false': This triggers the { isArchived: { $ne: true } } filter in your lib/data.js
  const { products: rawProducts, success } = await getProducts(false); 
  const instagramUrl = "https://www.instagram.com/charm.and.bead";

  // --- SERIALIZATION LOGIC START ---
  const products = success && rawProducts ? rawProducts.map(product => ({
    ...product,
    _id: product._id.toString(),
    variants: product.variants?.map(v => ({
      ...v,
      _id: v._id.toString()
    })) || []
  })) : [];
  // --- SERIALIZATION LOGIC END ---

  return (
    <main className="min-h-screen bg-white">
      {/* Offset for Fixed Navbar */}
      <div className="mt-16 md:mt-20">
        <HeroCarousel />
      </div>

      {/* Hero Content Section */}
      <section className="px-4 py-16 text-center md:py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-[#EA638C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Sparkles size={12} /> The Future of Materials
        </div>
        <h1 className="mb-6 text-4xl italic font-black tracking-tighter text-gray-900 uppercase sm:text-5xl md:text-7xl">
          Build Your <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA638C] to-indigo-600">
            Vision Today
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm font-medium leading-relaxed text-gray-500 md:text-lg">
          Premium materials for designers, builders, and creators. 
          Discover a curated collection of high-performance components.
        </p>
      </section>

      {/* Product Grid Section */}
      <section className="px-2 py-12 mx-auto sm:px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col justify-between gap-4 px-2 mb-10 md:flex-row md:items-end">
          <div className="text-left">
            <h2 className="flex items-center gap-3 text-3xl italic font-black tracking-tighter text-gray-900 uppercase md:text-4xl">
              Trending Now
            </h2>
          </div>
          <Link href="/products" className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase group hover:text-black">
            Explore Full Catalog <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 🟢 The Grid: This now automatically excludes archived items */}
        {success && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] mx-2">
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Restocking soon...</p>
          </div>
        )}

        {/* Instagram QR Section */}
        <div className="mt-24 relative overflow-hidden bg-white rounded-[3rem] md:rounded-[4rem] border border-gray-100 shadow-2xl shadow-gray-100 flex flex-col md:flex-row items-stretch mx-2">
          <div className="z-10 flex-1 p-10 md:p-16 lg:p-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EA638C]/10 text-[#EA638C] mb-6">
              <Instagram size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Connect with us</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#3E442B] uppercase italic tracking-tighter leading-[0.9] mb-6">
              Style <br /> On Your <br /> 
              <span className="text-[#EA638C]">Feed.</span>
            </h2>
            <p className="max-w-xs mb-8 text-xs font-medium leading-relaxed text-gray-500 md:text-sm">
              Scan the code to follow us on Instagram for exclusive drops and design inspiration.
            </p>
            <a 
              href={instagramUrl}
              target="_blank"
              className="group inline-flex items-center gap-3 bg-[#3E442B] text-white px-6 py-4 rounded-xl hover:bg-black transition-all duration-300"
            >
              <span className="font-black uppercase text-[10px] tracking-widest">Follow @your_handle</span>
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <div className="w-full md:w-[400px] bg-[#3E442B] p-12 flex flex-col items-center justify-center relative min-h-[400px]">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#EA638C]/30 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <div className="p-2 border border-gray-100 border-dashed rounded-xl">
                  <QRCode 
                    value={instagramUrl}
                    size={160}
                    fgColor="#3E442B"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#EA638C] text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                  Scan to Follow
                </div>
              </div>
            </div>
            <div className="absolute italic font-black select-none top-10 right-10 text-white/5 text-8xl">
              INSTA
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-gray-900 text-white flex flex-col items-center text-center relative mx-2">
          <h3 className="z-10 mb-6 text-2xl italic font-black uppercase md:text-3xl">Ready to start?</h3>
          <Link href="/products" className="bg-[#EA638C] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 transition-transform">
            Go to Shop
          </Link>
        </div>
      </section>
    </main>
  );
}