"use client";
import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Truck, ShieldCheck, RefreshCcw, Languages } from "lucide-react";
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
          { q: "ডেলিভারি করতে কত সময় লাগে?", a: "ঢাকার ভিতরে ১-২ দিন। ঢাকার বাইরে ৩-৫ দিন।" },
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
  const [lang, setLang] = useState("en"); // English by default
  const [openIndex, setOpenIndex] = useState(null);

  const t = FAQ_CONTENT[lang];

  return (
    <div className="max-w-3xl px-4 py-16 mx-auto">
      {/* 🌐 Language Switcher Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-1.5 rounded-[2rem] flex items-center relative w-64 border-2 border-gray-200">
          <button 
            onClick={() => setLang("en")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all z-10 ${lang === 'en' ? 'text-brand-primary' : 'text-gray-500'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang("bn")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all z-10 ${lang === 'bn' ? 'text-brand-primary' : 'text-gray-500'}`}
          >
            বাংলা
          </button>
          {/* Animated Slider Background */}
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-brand-accent rounded-[1.5rem] transition-all duration-300 ease-in-out ${lang === 'en' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex p-4 bg-blue-50 rounded-[2rem] text-brand-accent mb-6 border-4 border-white shadow-xl shadow-brand-accent/20">
          <Languages size={32} />
        </div>
        <h1 className="mb-3 text-4xl font-black tracking-tight text-gray-900">{t.title}</h1>
        <p className="font-medium text-gray-500">{t.subtitle}</p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-10">
        {t.sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <div className="flex items-center gap-2 px-4">
              <span className="p-2 text-brand-secondary bg-blue-50 rounded-xl">{section.icon}</span>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                {section.category}
              </h2>
            </div>

            <div className="grid gap-3">
              {section.questions.map((faq, qIdx) => {
                const globalIndex = `${sIdx}-${qIdx}`;
                const isOpen = openIndex === globalIndex;

                return (
                  <div 
                    key={qIdx}
                    className={`group transition-all duration-300 rounded-[2.5rem] border-2 ${
                      isOpen ? "border-brand-accent bg-blue-50/30 shadow-lg shadow-blue-50" : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="flex items-center justify-between w-full text-left outline-none p-7"
                    >
                      <span className={`font-black text-lg transition-colors leading-tight ${isOpen ? "text-pink-600" : "text-gray-800"}`}>
                        {faq.q}
                      </span>
                      <div className={`p-2 rounded-2xl transition-all duration-500 ${isOpen ? "bg-pink-600 text-white rotate-180" : "bg-gray-100 text-gray-400"}`}>
                        <ChevronDown size={20} strokeWidth={3} />
                      </div>
                    </button>

                    <div 
                      className={`px-7 overflow-hidden transition-all duration-500 ease-in-out ${
                        isOpen ? "max-h-60 pb-8 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pt-5 border-t border-blue-100">
                        <p className="text-base font-bold leading-relaxed text-gray-600">
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
      <div className="mt-20 p-10 bg-brand-primary rounded-[3.5rem] text-center text-white relative overflow-hidden" >
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-blue-500/10 blur-3xl"></div>
        <h3 className="mb-2 text-2xl font-black">{t.contactTitle}</h3>
        <p className="mb-8 text-sm font-medium text-gray-400">{t.contactSub}</p>
        <Link 
            href="/contact" 
            className="bg-[#EA638C] hover:bg-[#EA638C]/90 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-2 justify-center mx-auto active:scale-95 shadow-lg shadow-pink-500/20"
          >
            <MessageCircle size={16} /> {t.contactBtn}
          </Link>
      </div>
    </div>
  );
}