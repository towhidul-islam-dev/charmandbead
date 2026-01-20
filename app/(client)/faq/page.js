"use client";
import React, { useState } from "react";
import { ChevronDown, MessageCircle, Truck, RefreshCcw, Languages } from "lucide-react";
import Link from "next/link";

const FAQ_CONTENT = {
  en: {
    title: "How can we help?",
    subtitle: "Find answers to the most frequently asked questions.",
    contactTitle: "Still have questions?",
    contactSub: "We're here to help you 24/7.",
    contactBtn: "Contact Support",
    sections: [
      {
        category: "Shipping",
        icon: <Truck size={20} />,
        questions: [
          { q: "How long does delivery take?", a: "Inside Dhaka: 1-2 days. Outside Dhaka: 3-5 days." },
          { q: "What are the shipping charges?", a: "Inside Dhaka: ৳60. Outside Dhaka: ৳120." }
        ]
      },
      {
        category: "Returns",
        icon: <RefreshCcw size={20} />,
        questions: [
          { q: "Can I return a product?", a: "Yes, we have a 7-day easy return policy for unused items." }
        ]
      }
    ]
  },
  bn: {
    title: "আমরা কীভাবে সাহায্য করতে পারি?",
    subtitle: "সচরাচর জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে খুঁজুন।",
    contactTitle: "আরও কিছু জানার আছে?",
    contactSub: "আমরা আপনার সেবায় ২৪/৭ নিয়োজিত আছি।",
    contactBtn: "সাপোর্টে কথা বলুন",
    sections: [
      {
        category: "শিপিং",
        icon: <Truck size={20} />,
        questions: [
          { q: "ডেলিভারি করতে কত সময় লাগে?", a: "ঢাকার ভিতরে ১-২ দিন। ঢাকার বাইরে ৩-৫ দিন।" },
          { q: "শিপিং চার্জ কত?", a: "ঢাকার ভিতরে ৬০ টাকা। ঢাকার বাইরে ১২০ টাকা।" }
        ]
      },
      {
        category: "রিটার্ন",
        icon: <RefreshCcw size={20} />,
        questions: [
          { q: "আমি কি পণ্য ফেরত দিতে পারি?", a: "হ্যাঁ, অব্যবহৃত পণ্যের ক্ষেত্রে আমাদের ৭ দিনের সহজ রিটার্ন পলিসি রয়েছে।" }
        ]
      }
    ]
  }
};

export default function FAQPage() {
  const [lang, setLang] = useState("en");
  const [openIndex, setOpenIndex] = useState(null);

  const t = FAQ_CONTENT[lang];

  return (
    <div className="max-w-4xl px-6 py-20 mx-auto min-h-screen">
      
      {/* 🌐 Language Switcher Toggle */}
      <div className="flex justify-center mb-16">
        <div className="bg-[#3E442B]/5 p-1.5 rounded-full flex items-center relative w-72 border border-[#3E442B]/10 shadow-inner">
          <button 
            onClick={() => setLang("en")}
            className={`flex-1 flex items-center justify-center py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all z-10 ${lang === 'en' ? 'text-white' : 'text-[#3E442B]/50'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang("bn")}
            className={`flex-1 flex items-center justify-center py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all z-10 ${lang === 'bn' ? 'text-white' : 'text-[#3E442B]/50'}`}
          >
            বাংলা
          </button>
          {/* Animated Slider Background */}
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#EA638C] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg shadow-[#EA638C]/30 ${lang === 'en' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-20 text-center">
        <div className="inline-flex p-5 bg-[#EA638C]/5 rounded-[2.5rem] text-[#EA638C] mb-8 border border-[#EA638C]/10 shadow-sm">
          <Languages size={40} strokeWidth={1.5} />
        </div>
        <h1 className="mb-4 text-5xl font-black tracking-tight text-[#3E442B] italic uppercase">{t.title}</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-[#3E442B]/40">{t.subtitle}</p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-16">
        {t.sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <span className="p-3 text-[#EA638C] bg-[#EA638C]/5 rounded-2xl border border-[#EA638C]/10">{section.icon}</span>
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#3E442B]/60 italic">
                {section.category}
              </h2>
            </div>

            <div className="grid gap-4">
              {section.questions.map((faq, qIdx) => {
                const globalIndex = `${sIdx}-${qIdx}`;
                const isOpen = openIndex === globalIndex;

                return (
                  <div 
                    key={qIdx}
                    className={`group transition-all duration-500 rounded-[2rem] border-2 ${
                      isOpen ? "border-[#EA638C]/20 bg-[#EA638C]/[0.02] shadow-xl shadow-[#EA638C]/5" : "border-gray-50 bg-white hover:border-[#EA638C]/10"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="flex items-center justify-between w-full text-left outline-none p-8"
                    >
                      <span className={`font-black text-xl transition-colors leading-tight ${isOpen ? "text-[#EA638C]" : "text-[#3E442B]"}`}>
                        {faq.q}
                      </span>
                      <div className={`p-2.5 rounded-xl transition-all duration-500 ${isOpen ? "bg-[#EA638C] text-white rotate-180" : "bg-[#3E442B]/5 text-[#3E442B]/30"}`}>
                        <ChevronDown size={22} strokeWidth={3} />
                      </div>
                    </button>

                    <div 
                      className={`px-8 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        isOpen ? "max-h-96 pb-10 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pt-6 border-t border-[#EA638C]/10">
                        <p className="text-lg font-medium leading-relaxed text-[#3E442B]/70">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Support Card */}
      <div className="mt-32 p-12 bg-[#3E442B] rounded-[4rem] text-center text-white relative overflow-hidden group shadow-2xl shadow-[#3E442B]/20">
        <div className="absolute top-0 right-0 w-64 h-64 -mt-24 -mr-24 rounded-full bg-[#EA638C]/10 blur-[80px] group-hover:bg-[#EA638C]/20 transition-all duration-700"></div>
        <div className="relative z-10">
          <h3 className="mb-4 text-3xl font-black italic uppercase tracking-tighter">{t.contactTitle}</h3>
          <p className="mb-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/50">{t.contactSub}</p>
          <Link 
              href="/contact" 
              className="bg-[#EA638C] hover:bg-[#d54d76] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 justify-center mx-auto active:scale-95 shadow-xl shadow-[#EA638C]/30"
            >
              <MessageCircle size={18} /> {t.contactBtn}
            </Link>
        </div>
      </div>
    </div>
  );
}