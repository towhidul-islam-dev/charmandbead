"use client";
import React, { useState, useEffect } from "react";
import { Scale, Gavel, Loader2, PackageCheck, CreditCard, ShoppingBag, AlertCircle } from "lucide-react";

export default function TermsPolicy() {
  const [lang, setLang] = useState("en");
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔄 Fetch dynamic terms from your Server/API
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/content");
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        // Filter the policies array for the "terms" type as defined in your Schema
        const termsPolicy = data.policies?.find(p => p.type === "terms");
        setPolicyData(termsPolicy);
      } catch (err) {
        console.error("Failed to load terms:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#3E442B] mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B]/40">Securing Terms</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <AlertCircle className="text-red-400 mb-4" size={48} />
      <p className="font-black uppercase tracking-widest text-[#3E442B]">Connection Lost. Please Refresh.</p>
    </div>
  );

  const ui = {
    en: {
      title: "Wholesale Terms",
      subtitle: "Professional standards for our wholesale partners and registry members.",
      empty: "Terms of service are being updated...",
      lastUpdated: policyData?.updatedAt 
        ? `Effective Date: ${new Date(policyData.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}` 
        : "Effective Date: March 2026",
    },
    bn: {
      title: "পাইকারি শর্তাবলী",
      subtitle: "আমাদের পাইকারি পার্টনার এবং রেজিস্ট্রি সদস্যদের জন্য পেশাদার মানদণ্ড।",
      empty: "শর্তাবলী আপডেট করা হচ্ছে...",
      lastUpdated: policyData?.updatedAt 
        ? `কার্যকরী তারিখ: ${new Date(policyData.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}` 
        : "কার্যকরী তারিখ: মার্চ ২০২৬",
    }
  }[lang];

  const content = lang === "en" ? policyData?.content_en : policyData?.content_bn;

  return (
    <div className="min-h-screen px-6 py-24 bg-white selection:bg-[#3E442B] selection:text-white">
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
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#3E442B] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg shadow-[#3E442B]/20 ${lang === 'en' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`} />
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-24 text-center">
          <div className="inline-flex p-6 bg-[#3E442B]/5 rounded-[3rem] text-[#3E442B] mb-8 border border-[#3E442B]/10 shadow-sm">
            <Gavel size={44} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#3E442B] tracking-tighter uppercase italic mb-6 leading-[0.9]">
            {ui.title}
          </h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-[0.3em] px-4">
            {ui.subtitle}
          </p>
          <div className="mt-10 inline-block px-8 py-3 bg-[#3E442B] text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-xl shadow-[#3E442B]/20">
            {ui.lastUpdated}
          </div>
        </div>

        {/* 📄 Dynamic Terms Content */}
        <div className="bg-gray-50/40 rounded-[4rem] p-10 md:p-20 border border-gray-100 shadow-inner relative overflow-hidden">
          {/* Background Decorative Icon */}
          <Scale className="absolute -bottom-10 -right-10 text-[#3E442B]/5 size-64 -rotate-12" />
          
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

        {/* Visual Pillars of Trust */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
                { icon: <PackageCheck size={24} />, label: "Eligibility" },
                { icon: <Scale size={24} />, label: "Pricing" },
                { icon: <CreditCard size={24} />, label: "Payment" },
                { icon: <ShoppingBag size={24} />, label: "Fulfillment" }
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-[#3E442B]/20 transition-all duration-300">
                    <div className="text-[#3E442B] mb-4">{item.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3E442B]/50 text-center">{item.label}</span>
                </div>
            ))}
        </div>

        {/* Brand Shield & Footer */}
        <div className="flex flex-col items-center pt-20 mt-32 text-center border-t border-gray-100">
          <div className="flex gap-2 mb-8">
             <div className="w-12 h-2 rounded-full bg-[#3E442B]" />
             <div className="w-2 h-2 rounded-full bg-[#EA638C]" />
             <div className="w-2 h-2 rounded-full bg-[#FBB6E6]" />
          </div>
          <p className="text-[#3E442B]/30 font-black uppercase text-[10px] tracking-[0.5em] mb-4">
            Charm & Bead &bull; Legal Compliance &bull; 2026
          </p>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Savar, Dhaka Division &bull; Bangladesh</p>
        </div>
      </div>
    </div>
  );
}