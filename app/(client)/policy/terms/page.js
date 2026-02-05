"use client";
import React, { useState } from "react";
import { Scale, PackageCheck, CreditCard, ShoppingBag, ChevronDown } from "lucide-react";

const POLICY_CONTENT = {
  en: {
    title: "Wholesale Terms",
    subtitle: "Professional standards for our wholesale partners and registry members.",
    lastUpdated: "Amended: January 2026",
    sections: [
      {
        id: 1,
        title: "Registry Eligibility",
        icon: <PackageCheck size={22} />,
        content: "Membership in the Charm Store Registry is reserved for verified resellers. By purchasing, you confirm that you are acquiring goods for business use and agree to our Minimum Order Quantity (MOQ) requirements."
      },
      {
        id: 2,
        title: "Wholesale Pricing",
        icon: <Scale size={22} />,
        content: "Prices shown are exclusive to registry members. We maintain a Minimum Advertised Price (MAP) policy to protect brand value; selling below this price may result in account suspension."
      },
      {
        id: 3,
        title: "Payment & Settlement",
        icon: <CreditCard size={22} />,
        content: "All wholesale orders must be settled via our secure gateway. For partial payments or COD balances, funds must be cleared at the point of delivery as per the generated invoice."
      },
      {
        id: 4,
        title: "Order Fulfillment",
        icon: <ShoppingBag size={22} />,
        content: "Stock is deducted in real-time. In the rare event of a stock discrepancy during high-volume registry events, we will issue a credit note or immediate refund for the missing items."
      }
    ]
  },
  bn: {
    title: "পাইকারি শর্তাবলী",
    subtitle: "আমাদের পাইকারি পার্টনার এবং রেজিস্ট্রি সদস্যদের জন্য পেশাদার মানদণ্ড।",
    lastUpdated: "সর্বশেষ সংশোধন: জানুয়ারি ২০২৬",
    sections: [
      {
        id: 1,
        title: "রেজিস্ট্রি যোগ্যতা",
        icon: <PackageCheck size={22} />,
        content: "Charm Store রেজিস্ট্রিতে সদস্যপদ শুধুমাত্র যাচাইকৃত রিসেলারদের জন্য সংরক্ষিত। কেনাকাটার মাধ্যমে আপনি নিশ্চিত করছেন যে আপনি ব্যবসায়িক ব্যবহারের জন্য পণ্য কিনছেন এবং আমাদের MOQ শর্তাবলীতে সম্মত।"
      },
      {
        id: 2,
        title: "পাইকারি মূল্য নির্ধারণ",
        icon: <Scale size={22} />,
        content: "প্রদর্শিত মূল্য শুধুমাত্র রেজিস্ট্রি সদস্যদের জন্য। ব্র্যান্ড ভ্যালু রক্ষায় আমরা MAP নীতি অনুসরণ করি; নির্ধারিত মূল্যের নিচে বিক্রি করলে অ্যাকাউন্ট স্থগিত করা হতে পারে।"
      },
      {
        id: 3,
        title: "পেমেন্ট এবং সেটেলমেন্ট",
        icon: <CreditCard size={22} />,
        content: "সমস্ত পাইকারি অর্ডার আমাদের সুরক্ষিত গেটওয়ের মাধ্যমে পরিশোধ করতে হবে। আংশিক পেমেন্ট বা COD-এর ক্ষেত্রে, ইনভয়েস অনুযায়ী ডেলিভারির সময় অর্থ পরিশোধ নিশ্চিত করতে হবে।"
      },
      {
        id: 4,
        title: "অর্ডার পূর্ণতা",
        icon: <ShoppingBag size={22} />,
        content: "পণ্য স্টক রিয়েল-টাইমে আপডেট হয়। যদি কোনো কারণে স্টকের অসঙ্গতি দেখা দেয়, আমরা ক্রেডিট নোট বা তাৎক্ষণিক রিফান্ড প্রদান করব।"
      }
    ]
  }
};

export default function TermsPolicy() {
  const [lang, setLang] = useState("en");
  const [openSection, setOpenSection] = useState(null);
  const t = POLICY_CONTENT[lang];

  return (
    <div className="bg-white min-h-screen py-24 px-6">
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
        <div className="text-center mb-24">
          <div className="inline-flex p-6 bg-[#EA638C]/5 rounded-[3rem] text-[#EA638C] mb-8 border border-[#EA638C]/10 shadow-sm">
            <Scale size={44} strokeWidth={1.5} />
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
                <button onClick={() => setOpenSection(isOpen ? null : section.id)} className="w-full flex items-center justify-between p-8 md:p-10 text-left outline-none">
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
        <div className="mt-32 pt-16 border-t border-gray-100 text-center flex flex-col items-center">
          <div className="w-12 h-1 bg-gradient-to-r from-[#EA638C] to-[#3E442B] rounded-full mb-8" />
          <p className="text-[#3E442B]/30 font-black uppercase text-[10px] tracking-[0.5em]">Legal Integrity &bull; Commerce Standards</p>
        </div>
      </div>
    </div>
  );
}