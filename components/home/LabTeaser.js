"use client";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default function LabTeaser() {
  const [topTrends, setTopTrends] = useState([]);

  useEffect(() => {
    const fetchTopThree = async () => {
      const res = await fetch("/api/recommend/top-trends");
      const data = await res.json();
      // Only take the top 3 active (non-stocked) items
      setTopTrends(data.filter(t => t.status !== "Stocked").slice(0, 3));
    };
    fetchTopThree();
  }, []);

  if (topTrends.length === 0) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100">
              <Zap size={12} className="text-[#EA638C] fill-current" />
              <span className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest text-nowrap">Live from the Lab</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-[#3E442B] leading-[0.85]">
              VOTED BY <br /> <span className="text-[#EA638C]">YOU.</span>
            </h2>
          </div>
          
          <Link 
            href="/product-lab" 
            className="group flex items-center gap-3 text-sm font-black uppercase tracking-tighter text-[#3E442B] hover:text-[#EA638C] transition-colors"
          >
            Enter the Lab <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* TREND CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topTrends.map((trend, i) => (
            <div key={trend._id} className="group relative">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-100">
                <img 
                  src={trend.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt="trending" 
                />
                
                {/* Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#3E442B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <p className="text-white text-2xl font-black italic uppercase tracking-tighter leading-none">
                    {trend.aiAnalysis.category}
                  </p>
                  <p className="text-pink-300 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Sparkles size={10} /> {trend.votes} Votes
                  </p>
                </div>

                {/* Rank Badge */}
                <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-[#3E442B] font-black italic text-lg italic">#{i + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA FOOTER */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-[10px] font-black tracking-[0.4em] uppercase mb-6">
            Have a style in mind? Upload it now.
          </p>
          <Link 
            href="/product-lab"
            className="inline-block bg-[#3E442B] text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-[#EA638C] hover:scale-105 transition-all shadow-2xl"
          >
            Suggest a Treasure
          </Link>
        </div>
      </div>
    </section>
  );
}