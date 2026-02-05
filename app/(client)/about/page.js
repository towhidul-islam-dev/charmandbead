"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, Gem, Globe, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const [stats, setStats] = useState({
    completedOrders: 0,
    districtsCovered: 0,
    establishedYear: 2026, // Constant based on brand history
    loading: true
  });

  useEffect(() => {
  async function fetchLiveStats() {
    try {
      const response = await fetch('/api/public/stats', {
        next: { revalidate: 3600 } // Cache data for 1 hour to stay fast
      }); 
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      setStats({
        completedOrders: data.totalOrders,
        districtsCovered: data.activeStates,
        establishedYear: data.establishedYear,
        loading: false
      });
    } catch (error) {
      // Fallback values if server is down or database is empty
      setStats({
        completedOrders: "1,200", 
        districtsCovered: 64,
        establishedYear: 2026,
        loading: false
      });
    }
  }
  fetchLiveStats();
}, []);

  const displayStats = [
    { label: "Established", value: stats.establishedYear },
    { label: "Completed Orders", value: stats.loading ? "..." : `${stats.completedOrders}+` },
    { label: "Districts Covered", value: stats.loading ? "..." : stats.districtsCovered },
    { label: "Global Partners", value: "45+" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="grid items-center grid-cols-1 gap-16 mx-auto max-w-7xl lg:grid-cols-2">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EA638C]/5 border border-[#EA638C]/10 rounded-full text-[#EA638C] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <Sparkles size={14} /> Our Heritage
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-[#3E442B] tracking-tighter uppercase italic leading-[0.85] mb-8">
              Crafting <br /> 
              <span className="text-[#EA638C]">Legacy</span> <br />
              Since {stats.establishedYear}.
            </h1>
            <p className="text-[#3E442B]/70 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
              Charm & Bead was born from an obsession: finding the world's most exquisite components for creators who refuse to compromise.
            </p>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-[#3E442B]/5 shadow-2xl relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80" 
                alt="Jewelry Sourcing" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#FBB6E6] rounded-full blur-[100px] opacity-40 -z-10" />
          </div>
        </div>
      </section>

      {/* --- LIVE STATS BAR --- */}
      <section className="bg-[#3E442B] py-16">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {displayStats.map((stat, i) => (
              <div key={i} className="text-center border-r border-white/10 last:border-none">
                <div className="text-[#FBB6E6] text-4xl font-black mb-2 flex justify-center items-center gap-2">
                  {stats.loading && i > 0 ? <Loader2 className="animate-spin" size={24} /> : stat.value}
                </div>
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MISSION --- */}
      <section className="px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#EA638C] mb-8 italic">The Philosophy</h2>
          <p className="text-3xl md:text-5xl font-bold text-[#3E442B] leading-[1.1] tracking-tight italic">
            "We supply the building blocks for your next <span className="underline decoration-[#FBB6E6] decoration-8 underline-offset-4">masterpiece</span>."
          </p>
        </div>
      </section>

      {/* --- VALUES --- */}
      <section className="py-24 px-6 bg-[#3E442B]/5">
        <div className="grid grid-cols-1 gap-12 mx-auto max-w-7xl md:grid-cols-3">
          <ValueCard 
            icon={<Gem />} 
            title="Sourced Quality" 
            desc="Every gemstone is verified for purity and ethical origin before entering our registry."
          />
          <ValueCard 
            icon={<Globe />} 
            title={`Active in ${stats.districtsCovered} Districts`} 
            desc="From Dhaka to the furthest corners of the country, our logistics network ensures your materials arrive safely."
          />
          <ValueCard 
            icon={<ShieldCheck />} 
            title="Business Security" 
            desc="Our wholesale platform is built on trust, secure payments, and transparent MOQ standards."
          />
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto bg-[#EA638C] rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden group">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="mb-8 text-4xl italic font-black tracking-tighter uppercase md:text-6xl">Start Your Registry</h2>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-3 bg-[#3E442B] text-white px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white hover:text-[#3E442B] transition-all shadow-2xl"
            >
              Shop All Materials <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Reusable Value Card
function ValueCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-12 rounded-[3.5rem] border border-[#3E442B]/5 hover:border-[#EA638C]/20 transition-all shadow-sm group">
      <div className="w-16 h-16 bg-[#3E442B] text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#EA638C] transition-colors shadow-lg">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <h3 className="text-xl font-black text-[#3E442B] uppercase tracking-tighter mb-4 italic">{title}</h3>
      <p className="text-[#3E442B]/60 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}