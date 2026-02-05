"use client";
import React, { useState } from "react";
import { RotateCcw, AlertCircle, Truck, RefreshCw, ChevronDown } from "lucide-react";

const POLICY_CONTENT = {
  en: {
    title: "Refund Policy",
    subtitle: "Transparent and fair procedures for handling damages and returns.",
    lastUpdated: "Amended: January 2026",
    sections: [
      {
        id: 1,
        title: "Damage Inspection",
        icon: <AlertCircle size={22} />,
        content: "Wholesale goods must be inspected within 48 hours of delivery. Any claims for transit damage must be submitted via email with photo/video evidence of the unboxing process."
      },
      {
        id: 2,
        title: "Eligible Returns",
        icon: <RotateCcw size={22} />,
        content: "Returns are accepted only for manufacturing defects or incorrect shipments. Due to the nature of wholesale pricing, we do not offer returns for 'change of mind' or unsold inventory."
      },
      {
        id: 3,
        title: "Refund Process",
        icon: <RefreshCw size={22} />,
        content: "Approved refunds are processed within 7-10 business days. Funds are returned to the original payment source or issued as 'Registry Credit' for your next wholesale purchase."
      },
      {
        id: 4,
        title: "Logistics Costs",
        icon: <Truck size={22} />,
        content: "For defective items, Charm Store covers the return shipping costs. In all other pre-approved return cases, the customer is responsible for safe transit back to our warehouse."
      }
    ]
  },
  bn: {
    title: "ফেরত নীতি",
    subtitle: "ক্ষয়ক্ষতি এবং পণ্য ফেরতের জন্য স্বচ্ছ এবং ন্যায্য প্রক্রিয়া।",
    lastUpdated: "সর্বশেষ সংশোধন: জানুয়ারি ২০২৬",
    sections: [
      {
        id: 1,
        title: "ক্ষয়ক্ষতি পরিদর্শন",
        icon: <AlertCircle size={22} />,
        content: "ডেলিভারির ৪৮ ঘণ্টার মধ্যে পাইকারি পণ্য পরিদর্শন করতে হবে। ট্রানজিট ক্ষতির জন্য যেকোনো দাবি অবশ্যই আনবক্সিং ভিডিও/ছবি সহ ইমেলের মাধ্যমে জমা দিতে হবে।"
      },
      {
        id: 2,
        title: "ফেরতযোগ্য পণ্য",
        icon: <RotateCcw size={22} />,
        content: "শুধুমাত্র উৎপাদনগত ত্রুটি বা ভুল শিপমেন্টের জন্য পণ্য ফেরত নেওয়া হয়। পাইকারি মূল্যের কারণে, আমরা 'পছন্দ না হওয়া' বা অবিক্রিত পণ্যের জন্য ফেরত অফার করি না।"
      },
      {
        id: 3,
        title: "রিফান্ড প্রক্রিয়া",
        icon: <RefreshCw size={22} />,
        content: "অনুমোদিত রিফান্ড ৭-১০ কার্যদিবসের মধ্যে সম্পন্ন হয়। অর্থ মূল পেমেন্ট সোর্সে ফেরত পাঠানো হয় অথবা পরবর্তী ক্রয়ের জন্য 'রেজিস্ট্রি ক্রেডিট' হিসেবে দেওয়া হয়।"
      },
      {
        id: 4,
        title: "পরিবহন খরচ",
        icon: <Truck size={22} />,
        content: "ত্রুটিপূর্ণ পণ্যের ক্ষেত্রে, Charm Store ফেরত শিপিং খরচ বহন করে। অন্যান্য প্রি-অ্যাপ্রুভড ফেরতের ক্ষেত্রে, গ্রাহককে আমাদের গুদামে পণ্য পাঠানোর খরচ বহন করতে হবে।"
      }
    ]
  }
};

export default function RefundPolicy() {
  const [lang, setLang] = useState("en");
  const [openSection, setOpenSection] = useState(null);
  const t = POLICY_CONTENT[lang];

  return (
    <div className="min-h-screen px-6 py-24 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* 🌐 Language Switcher */}
        <div className="flex justify-center mb-20">
          <div className="bg-[#3E442B]/5 p-1.5 rounded-full flex items-center relative w-72 border border-[#3E442B]/10">
            <button onClick={() => setLang("en")} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all z-10 ${lang === 'en' ? 'text-white' : 'text-[#3E442B]/40'}`}>English</button>
            <button onClick={() => setLang("bn")} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all z-10 ${lang === 'bn' ? 'text-white' : 'text-[#3E442B]/40'}`}>বাংলা</button>
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#EA638C] rounded-full transition-all duration-500 shadow-lg shadow-[#EA638C]/30 ${lang === 'en' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`} />
          </div>
        </div>

        {/* Header */}
        <div className="mb-24 text-center">
          <div className="inline-flex p-6 bg-[#EA638C]/5 rounded-[3rem] text-[#EA638C] mb-8 border border-[#EA638C]/10 shadow-sm">
            <RotateCcw size={44} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#3E442B] tracking-tighter uppercase italic mb-6">{t.title}</h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-widest">{t.subtitle}</p>
          <div className="mt-8 inline-block px-6 py-2.5 bg-[#3E442B] text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em]">{t.lastUpdated}</div>
        </div>

        {/* Accordion */}
        <div className="space-y-6">
          {t.sections.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div key={section.id} className={`group border-2 transition-all duration-500 rounded-[3rem] overflow-hidden ${isOpen ? "border-[#EA638C]/20 bg-[#EA638C]/[0.02] shadow-xl shadow-[#EA638C]/5" : "border-gray-50 bg-white hover:border-[#EA638C]/10"}`}>
                <button onClick={() => setOpenSection(isOpen ? null : section.id)} className="flex items-center justify-between w-full p-8 text-left outline-none md:p-10">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${isOpen ? "bg-[#EA638C] text-white shadow-lg shadow-[#EA638C]/30" : "bg-[#3E442B]/5 text-[#3E442B]/40"}`}>{section.icon}</div>
                    <span className={`font-black text-xl md:text-2xl tracking-tight transition-colors ${isOpen ? "text-[#EA638C]" : "text-[#3E442B]"}`}>{section.title}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all duration-500 ${isOpen ? "bg-[#EA638C] text-white rotate-180" : "bg-[#3E442B]/5 text-[#3E442B]/20"}`}><ChevronDown size={22} strokeWidth={3} /></div>
                </button>
                <div className={`px-10 md:px-14 overflow-hidden transition-all duration-700 ${isOpen ? "max-h-[500px] pb-12 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="pt-8 border-t border-[#EA638C]/10 text-[#3E442B]/70 font-medium leading-relaxed text-lg">{section.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="flex flex-col items-center pt-16 mt-32 text-center border-t border-gray-100">
          <div className="w-12 h-1 bg-gradient-to-r from-[#EA638C] to-[#3E442B] rounded-full mb-8" />
          <p className="text-[#3E442B]/30 font-black uppercase text-[10px] tracking-[0.5em]">Global Trade Standards &bull; Trusted Logistics</p>
        </div>
      </div>
    </div>
  );
}