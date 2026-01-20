"use client";
import React, { useState } from "react";
import { ShieldCheck, Lock, Eye, Cookie, ChevronDown } from "lucide-react";

const POLICY_CONTENT = {
  en: {
    title: "Privacy Policy",
    subtitle: "Your privacy is our priority. Learn how we handle your data with transparency.",
    lastUpdated: "Amended: January 2026",
    sections: [
      {
        id: 1,
        title: "Information We Collect",
        icon: <Eye size={22} />,
        content: "We collect information you provide directly to us, such as when you create an account, make a purchase (name, email, phone number, shipping address), or communicate with our customer support team."
      },
      {
        id: 2,
        title: "How We Use Your Data",
        icon: <ShieldCheck size={22} />,
        content: "Your data is used to process orders, ensure timely delivery, send order updates via SMS/Email, and improve our website experience. We do not sell your personal data to third parties."
      },
      {
        id: 3,
        title: "Payment Security",
        icon: <Lock size={22} />,
        content: "All payments are processed through secure, encrypted gateways (e.g., SSLCommerz). We do not store your credit card or mobile banking PIN details on our servers."
      },
      {
        id: 4,
        title: "Cookies & Tracking",
        icon: <Cookie size={22} />,
        content: "We use cookies to remember your login session and wishlist items. You can disable cookies in your browser settings, but some features may not function correctly."
      }
    ]
  },
  bn: {
    title: "গোপনীয়তা নীতি",
    subtitle: "আপনার গোপনীয়তা আমাদের অগ্রাধিকার। আমরা কীভাবে আপনার তথ্য ব্যবহার করি তা জানুন।",
    lastUpdated: "সর্বশেষ সংশোধন: জানুয়ারি ২০২৬",
    sections: [
      {
        id: 1,
        title: "আমরা যে তথ্য সংগ্রহ করি",
        icon: <Eye size={22} />,
        content: "আপনি যখন আমাদের সাইটে অ্যাকাউন্ট তৈরি করেন বা কেনাকাটা করেন, তখন আমরা আপনার নাম, ইমেল, ফোন নম্বর এবং শিপিং ঠিকানার মতো তথ্য সংগ্রহ করি।"
      },
      {
        id: 2,
        title: "আপনার তথ্যের ব্যবহার",
        icon: <ShieldCheck size={22} />,
        content: "আপনার তথ্য অর্ডার প্রসেস করতে, সঠিক সময়ে ডেলিভারি নিশ্চিত করতে এবং এসএমএস/ইমেলের মাধ্যমে আপডেটস পাঠাতে ব্যবহৃত হয়। আমরা কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য বিক্রি করি না।"
      },
      {
        id: 3,
        title: "পেমেন্ট নিরাপত্তা",
        icon: <Lock size={22} />,
        content: "সমস্ত পেমেন্ট সুরক্ষিত এনক্রিপ্টেড গেটওয়ে (যেমন: SSLCommerz) এর মাধ্যমে সম্পন্ন হয়। আমরা আপনার ক্রেডিট কার্ড বা মোবাইল ব্যাংকিং পিন (PIN) আমাদের সার্ভারে সংরক্ষণ করি না।"
      },
      {
        id: 4,
        title: "কুকিজ এবং ট্র্যাকিং",
        icon: <Cookie size={22} />,
        content: "আপনার লগইন সেশন এবং উইশলিস্ট মনে রাখার জন্য আমরা কুকিজ ব্যবহার করি। আপনি চাইলে ব্রাউজার সেটিংসে কুকিজ বন্ধ করতে পারেন।"
      }
    ]
  }
};

export default function PrivacyPolicy() {
  const [lang, setLang] = useState("en");
  const [openSection, setOpenSection] = useState(null);

  const t = POLICY_CONTENT[lang];

  return (
    <div className="bg-white min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* 🌐 Language Switcher (Luxury Toggle Design) */}
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
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#EA638C] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg shadow-[#EA638C]/30 ${lang === 'en' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
            />
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-24">
          <div className="inline-flex p-6 bg-[#EA638C]/5 rounded-[3rem] text-[#EA638C] mb-8 border border-[#EA638C]/10 shadow-sm">
            <ShieldCheck size={44} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#3E442B] tracking-tighter uppercase italic mb-6">
            {t.title}
          </h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-widest">
            {t.subtitle}
          </p>
          <div className="mt-8 inline-block px-6 py-2.5 bg-[#3E442B] text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
            {t.lastUpdated}
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-6">
          {t.sections.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div 
                key={section.id}
                className={`group border-2 transition-all duration-500 rounded-[3rem] overflow-hidden ${
                  isOpen 
                  ? "border-[#EA638C]/20 bg-[#EA638C]/[0.02] shadow-xl shadow-[#EA638C]/5" 
                  : "border-gray-50 bg-white hover:border-[#EA638C]/10"
                }`}
              >
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between p-8 md:p-10 text-left outline-none"
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${isOpen ? "bg-[#EA638C] text-white shadow-lg shadow-[#EA638C]/30" : "bg-[#3E442B]/5 text-[#3E442B]/40"}`}>
                      {section.icon}
                    </div>
                    <span className={`font-black text-xl md:text-2xl tracking-tight transition-colors ${isOpen ? "text-[#EA638C]" : "text-[#3E442B]"}`}>
                      {section.title}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all duration-500 ${isOpen ? "bg-[#EA638C] text-white rotate-180" : "bg-[#3E442B]/5 text-[#3E442B]/20"}`}>
                    <ChevronDown size={22} strokeWidth={3} />
                  </div>
                </button>

                <div 
                  className={`px-10 md:px-14 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isOpen ? "max-h-[500px] pb-12 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-8 border-t border-[#EA638C]/10 text-[#3E442B]/70 font-medium leading-relaxed text-lg">
                    {section.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand Shield & Footer Note */}
        <div className="mt-32 pt-16 border-t border-gray-100 text-center flex flex-col items-center">
          <div className="w-12 h-1 bg-gradient-to-r from-[#EA638C] to-[#3E442B] rounded-full mb-8" />
          <p className="text-[#3E442B]/30 font-black uppercase text-[10px] tracking-[0.5em]">
            Elite Data Security &bull; Global Standards
          </p>
        </div>
      </div>
    </div>
  );
}