"use client";
import React, { useState, useEffect } from "react";
import { RotateCcw, AlertCircle, Truck, RefreshCw, ShieldCheck, Loader2, PackageSearch } from "lucide-react";

export default function RefundPolicy() {
  const [lang, setLang] = useState("en");
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔄 Fetch actual data from Server/API
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/content");
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        // Find the "refund" type policy from your database
        const refundPolicy = data.policies?.find(p => p.type === "refund");
        setPolicyData(refundPolicy);
      } catch (err) {
        console.error("Failed to load policy:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#EA638C] mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B]/40">Verifying Policy</p>
    </div>
  );

  const ui = {
    en: {
      title: "Refund Policy",
      subtitle: "Transparent and fair procedures for handling damages and returns.",
      empty: "Policy content coming soon...",
      lastUpdated: policyData?.updatedAt 
        ? `Last Revised: ${new Date(policyData.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}` 
        : "Last Revised: March 2026",
    },
    bn: {
      title: "ফেরত নীতি",
      subtitle: "ক্ষয়ক্ষতি এবং পণ্য ফেরতের জন্য স্বচ্ছ এবং ন্যায্য প্রক্রিয়া।",
      empty: "নীতিমালা শীঘ্রই আসছে...",
      lastUpdated: policyData?.updatedAt 
        ? `সর্বশেষ সংশোধন: ${new Date(policyData.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}` 
        : "সর্বশেষ সংশোধন: মার্চ ২০২৬",
    }
  }[lang];

  const content = lang === "en" ? policyData?.content_en : policyData?.content_bn;

  return (
    <div className="min-h-screen px-6 py-24 bg-white selection:bg-[#EA638C] selection:text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* 🌐 Language Switcher */}
        <div className="flex justify-center mb-20">
          <div className="bg-[#3E442B]/5 p-1.5 rounded-full flex items-center relative w-72 border border-[#3E442B]/10">
            <button 
              onClick={() => setLang("en")} 
              className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all z-10 ${lang === 'en' ? 'text-white' : 'text-[#3E442B]/40'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang("bn")} 
              className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all z-10 ${lang === 'bn' ? 'text-white' : 'text-[#3E442B]/40'}`}
            >
              বাংলা
            </button>
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#EA638C] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg shadow-[#EA638C]/30 ${lang === 'en' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`} />
          </div>
        </div>

        {/* Header */}
        <div className="mb-24 text-center">
          <div className="inline-flex p-6 bg-[#EA638C]/5 rounded-[3rem] text-[#EA638C] mb-8 border border-[#EA638C]/10 shadow-sm">
            <RotateCcw size={44} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#3E442B] tracking-tighter uppercase italic mb-6">
            {ui.title}
          </h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-[0.3em] px-4">
            {ui.subtitle}
          </p>
          <div className="mt-10 inline-block px-8 py-3 bg-[#3E442B] text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-xl shadow-[#3E442B]/20">
            {ui.lastUpdated}
          </div>
        </div>

        {/* 📄 Dynamic Content */}
        <div className="bg-gray-50/30 rounded-[4rem] p-10 md:p-20 border border-gray-100 shadow-inner relative overflow-hidden">
          <PackageSearch className="absolute -bottom-10 -left-10 text-[#3E442B]/5 size-64 rotate-12" />
          
          <div className="relative z-10">
            {content ? (
              <div className="prose prose-lg max-w-none text-[#3E442B]/80 font-medium leading-[2.2] whitespace-pre-wrap text-justify md:text-xl">
                {content}
              </div>
            ) : (
              <div className="py-20 text-center italic opacity-30 font-black uppercase tracking-widest text-sm">
                {ui.empty}
              </div>
            )}
          </div>
        </div>

        {/* Icons/Badges for Trust */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
                { icon: <AlertCircle />, label: "Inspection" },
                { icon: <RotateCcw />, label: "Returns" },
                { icon: <RefreshCw />, label: "Refunds" },
                { icon: <Truck />, label: "Shipping" }
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="text-[#EA638C] mb-4 scale-125">{item.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3E442B]/60">{item.label}</span>
                </div>
            ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center pt-20 mt-32 text-center border-t border-gray-100">
          <div className="flex gap-2 mb-8">
             <div className="w-12 h-2 rounded-full bg-[#EA638C]" />
             <div className="w-2 h-2 rounded-full bg-[#3E442B]" />
             <div className="w-2 h-2 rounded-full bg-[#FBB6E6]" />
          </div>
          <p className="text-[#3E442B]/30 font-black uppercase text-[10px] tracking-[0.5em] mb-4">Charm & Bead &bull; Authentic Raw Materials</p>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Dhaka, Bangladesh &bull; &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}