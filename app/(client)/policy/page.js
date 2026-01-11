"use client";
import React, { useState } from "react";
import { ShieldCheck, Lock, Eye, Cookie, ChevronDown, Languages } from "lucide-react";

const POLICY_CONTENT = {
  en: {
    title: "Privacy Policy",
    subtitle: "Your privacy is our priority. Learn how we handle your data.",
    lastUpdated: "Last Updated: December 2025",
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
    lastUpdated: "সর্বশেষ আপডেট: ডিসেম্বর ২০২৫",
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
        content: "সমস্ত পেমেন্ট সুরক্ষিত এনক্রিপ্টেড গেটওয়ে (যেমন: SSLCommerz) এর মাধ্যমে সম্পন্ন হয়। আমরা আপনার ক্রেডিট কার্ড বা মোবাইল ব্যাংকিং পিন (PIN) আমাদের সার্ভারে সংরক্ষণ করি না।"
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
    <div className="bg-gray-50/50 min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* 🌐 Language Switcher (Brand Color: #EA638C) */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-[2rem] flex items-center relative w-64 border-2 border-gray-100 shadow-sm">
            <button 
              onClick={() => setLang("en")}
              className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all z-10 ${lang === 'en' ? 'text-white' : 'text-gray-400'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang("bn")}
              className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all z-10 ${lang === 'bn' ? 'text-white' : 'text-gray-400'}`}
            >
              বাংলা
            </button>
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#EA638C] rounded-[1.5rem] transition-all duration-300 ${lang === 'en' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
            />
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex p-5 bg-[#EA638C]/10 rounded-[2.5rem] text-[#EA638C] mb-6 shadow-xl shadow-[#EA638C]/10">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">{t.title}</h1>
          <p className="text-gray-500 font-bold max-w-md mx-auto leading-relaxed">{t.subtitle}</p>
          <div className="mt-6 inline-block px-5 py-2 bg-[#EA638C]/5 text-[#EA638C] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#EA638C]/10">
            {t.lastUpdated}
          </div>
        </div>

        {/* Interactive Sections (Accordion) */}
        <div className="space-y-5">
          {t.sections.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div 
                key={section.id}
                className={`group border-2 transition-all duration-300 rounded-[2.5rem] overflow-hidden ${
                  isOpen 
                  ? "border-[#EA638C] bg-white shadow-2xl shadow-[#EA638C]/10" 
                  : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between p-7 text-left outline-none"
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${isOpen ? "bg-[#EA638C] text-white rotate-6" : "bg-[#EA638C]/5 text-[#EA638C]"}`}>
                      {section.icon}
                    </div>
                    <span className={`font-black text-lg md:text-xl transition-colors ${isOpen ? "text-[#EA638C]" : "text-gray-800"}`}>
                      {section.title}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all duration-500 ${isOpen ? "bg-[#EA638C] text-white rotate-180" : "bg-gray-100 text-gray-400"}`}>
                    <ChevronDown size={20} strokeWidth={3} />
                  </div>
                </button>

                {/* Animated Body (Initially Hidden) */}
                <div 
                  className={`px-8 md:px-10 overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-[400px] pb-10 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-6 border-t border-[#EA638C]/10 text-gray-600 font-bold leading-relaxed text-base">
                    {section.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em]">
            Your Trust • Our Commitment
          </p>
        </div>
      </div>
    </div>
  );
}