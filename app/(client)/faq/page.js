"use client";
import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  MessageCircle, 
  Truck, 
  ShoppingBag, 
  ShieldCheck,
  HelpCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

// Helper to map icons to categories (since icons aren't stored in DB)
const getIcon = (category) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("ship") || cat.includes("ডেলিভারি")) return <Truck size={20} />;
  if (cat.includes("payment") || cat.includes("পেমেন্ট")) return <ShieldCheck size={20} />;
  return <ShoppingBag size={20} />;
};

export default function FAQPage() {
  const [lang, setLang] = useState("en");
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Content from your new API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch('/api/admin/content');
        const json = await res.json();
        // Group FAQs by category if needed, or display as a list
        setFaqs(json.faqs || []);
      } catch (err) {
        console.error("Failed to load FAQs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  // Labels for UI elements (static)
  const ui = {
    en: {
      title: "How can we help?",
      subtitle: "Find answers to the most frequently asked questions.",
      contactTitle: "Still have questions?",
      contactSub: "We're here to help you 24/7.",
      contactBtn: "Contact Support",
    },
    bn: {
      title: "সাহায্য প্রয়োজন?",
      subtitle: "সচরাচর জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে খুঁজুন।",
      contactTitle: "আরও কিছু জানার আছে?",
      contactSub: "আমরা আপনার সেবায় ২৪/৭ নিয়োজিত আছি।",
      contactBtn: "সাপোর্টে কথা বলুন",
    }
  }[lang];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl px-6 py-24 mx-auto">
        
        {/* 🌐 Language Switcher */}
        <div className="flex justify-center mb-20">
          <div className="bg-[#3E442B]/5 p-1.5 rounded-full flex items-center relative w-72 border border-[#3E442B]/10 shadow-inner">
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

        {/* Header */}
        <div className="mb-24 text-center">
          <div className="inline-flex p-6 bg-[#EA638C]/5 rounded-[3rem] text-[#EA638C] mb-8 border border-[#EA638C]/10">
            <HelpCircle size={44} strokeWidth={1.5} />
          </div>
          <h1 className="mb-6 text-5xl md:text-6xl font-black tracking-tighter text-[#3E442B] italic uppercase">
            {ui.title}
          </h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-[0.3em]">
            {ui.subtitle}
          </p>
        </div>

        {/* Dynamic FAQ Accordion */}
        <div className="grid gap-5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            // Select content based on active language toggle
            const question = lang === 'en' ? faq.question_en : faq.question_bn;
            const answer = lang === 'en' ? faq.answer_en : faq.answer_bn;

            return (
              <div 
                key={faq._id || idx}
                className={`group transition-all duration-500 rounded-[2.5rem] border-2 ${
                  isOpen 
                  ? "border-[#EA638C]/20 bg-[#EA638C]/[0.02] shadow-xl shadow-[#EA638C]/5" 
                  : "border-gray-50 bg-white hover:border-[#EA638C]/10"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex items-center justify-between w-full text-left outline-none p-7 md:p-9"
                >
                  <span className={`font-black text-lg md:text-xl transition-colors leading-tight pr-4 ${isOpen ? "text-[#EA638C]" : "text-[#3E442B]"}`}>
                    {question}
                  </span>
                  <div className={`shrink-0 p-2.5 rounded-xl transition-all duration-500 ${isOpen ? "bg-[#EA638C] text-white rotate-180" : "bg-[#3E442B]/5 text-[#3E442B]/20"}`}>
                    <ChevronDown size={20} strokeWidth={3} />
                  </div>
                </button>

                <div 
                  className={`px-7 md:px-9 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isOpen ? "max-h-[500px] pb-10 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-8 border-t border-[#EA638C]/10 text-[#3E442B]/70 font-medium leading-relaxed text-lg">
                    {answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Card */}
        <div className="mt-32 p-10 md:p-16 bg-[#3E442B] rounded-[3.5rem] text-center text-white relative overflow-hidden group shadow-2xl shadow-[#3E442B]/20">
          <div className="absolute top-0 right-0 w-80 h-80 -mt-32 -mr-32 rounded-full bg-[#EA638C]/20 blur-[100px] group-hover:bg-[#EA638C]/30 transition-all duration-700" />
          <div className="relative z-10">
            <h3 className="mb-4 text-3xl italic font-black tracking-tighter uppercase md:text-4xl">
              {ui.contactTitle}
            </h3>
            <p className="mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              {ui.contactSub}
            </p>
            <Link 
              href="/contact" 
              className="inline-flex bg-[#EA638C] hover:bg-[#FBB6E6] hover:text-[#3E442B] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all items-center gap-3 active:scale-95 shadow-xl shadow-[#EA638C]/20"
            >
              <MessageCircle size={18} /> {ui.contactBtn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}