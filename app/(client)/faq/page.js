"use client";
import React, { useState } from "react";
import { 
  ChevronDown, 
  MessageCircle, 
  Truck, 
  RefreshCcw, 
  Languages, 
  HelpCircle, 
  ShoppingBag, 
  ShieldCheck 
} from "lucide-react";
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
        category: "Registry & Wholesale",
        icon: <ShoppingBag size={20} />,
        questions: [
          { q: "What is the Minimum Order Quantity (MOQ)?", a: "We have no price constraints, you can take according to your need. But you have to buy at least the minimum amount." },
          // { q: "How do I see wholesale pricing?", a: "You must be logged into your verified Registry Account to see and access bulk pricing." },
          // { q: "Can I customize bulk orders?", a: "Yes, we offer custom sourcing for rare beads and specific metal alloys. Contact our concierge for details." }
        ]
      },
      {
        category: "Shipping & Tracking",
        icon: <Truck size={20} />,
        questions: [
          { q: "How long does delivery take?", a: "Inside Dhaka: 3-5 days. Outside Dhaka: 4-6 days." },
          { q: "How do I track my order?", a: "You will receive an SMS and email with a tracking link once your order is dispatched." }
        ]
      },
      {
        category: "Payments & Security",
        icon: <ShieldCheck size={20} />,
        questions: [
          { q: "Which payment methods are accepted?", a: "We accept bKash, Nagad, Visa, Mastercard, and direct Bank Transfers." },
          { q: "Is my payment information secure?", a: "Absolutely. We use SSLCommerz encryption and never store your PIN or card details." }
        ]
      }
    ]
  },
  bn: {
    title: "সাহায্য প্রয়োজন?",
    subtitle: "সচরাচর জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে খুঁজুন।",
    contactTitle: "আরও কিছু জানার আছে?",
    contactSub: "আমরা আপনার সেবায় ২৪/৭ নিয়োজিত আছি।",
    contactBtn: "সাপোর্টে কথা বলুন",
    sections: [
      {
        category: "রেজিস্ট্রি এবং পাইকারি",
        icon: <ShoppingBag size={20} />,
        questions: [
          { q: "ন্যূনতম অর্ডারের পরিমাণ (MOQ) কত?", a: "পাইকারি মূল্যের সুবিধা পেতে সাধারণত প্রতি অর্ডারে কমপক্ষে ৫,০০০ টাকা খরচ করতে হয়।" },
          // { q: "আমি কীভাবে পাইকারি মূল্য দেখতে পাব?", a: "পাইকারি মূল্য দেখতে আপনাকে আপনার ভেরিফাইড রেজিস্ট্রি অ্যাকাউন্টে লগ-ইন করতে হবে।" }
        ]
      },
      {
        category: "শিপিং এবং ডেলিভারি",
        icon: <Truck size={20} />,
        questions: [
         { 
  q: "ডেলিভারি করতে কত সময় লাগে?", 
  a: "ঢাকার ভিতরে ৩-৫ দিন। ঢাকার বাইরে ৪-৬ দিন।" 
}
        ]
      },
      {
        category: "পেমেন্ট এবং নিরাপত্তা",
        icon: <ShieldCheck size={20} />,
        questions: [
          { q: "আমার পেমেন্ট কি নিরাপদ?", a: "অবশ্যই। আমরা SSLCommerz এনক্রিপশন ব্যবহার করি এবং আপনার পিন বা কার্ড ডিটেইলস সংরক্ষণ করি না।" }
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
            {t.title}
          </h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-[0.3em]">
            {t.subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-20">
          {t.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-8">
              <div className="flex items-center gap-4 px-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#3E442B]/10" />
                <div className="flex items-center gap-3">
                  <span className="text-[#EA638C]">{section.icon}</span>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#3E442B]/40 italic">
                    {section.category}
                  </h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#3E442B]/10" />
              </div>

              <div className="grid gap-5">
                {section.questions.map((faq, qIdx) => {
                  const globalIndex = `${sIdx}-${qIdx}`;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div 
                      key={qIdx}
                      className={`group transition-all duration-500 rounded-[2.5rem] border-2 ${
                        isOpen 
                        ? "border-[#EA638C]/20 bg-[#EA638C]/[0.02] shadow-xl shadow-[#EA638C]/5" 
                        : "border-gray-50 bg-white hover:border-[#EA638C]/10"
                      }`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="flex items-center justify-between w-full text-left outline-none p-7 md:p-9"
                      >
                        <span className={`font-black text-lg md:text-xl transition-colors leading-tight pr-4 ${isOpen ? "text-[#EA638C]" : "text-[#3E442B]"}`}>
                          {faq.q}
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
                          {faq.a}
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
        <div className="mt-32 p-10 md:p-16 bg-[#3E442B] rounded-[3.5rem] text-center text-white relative overflow-hidden group shadow-2xl shadow-[#3E442B]/20">
          <div className="absolute top-0 right-0 w-80 h-80 -mt-32 -mr-32 rounded-full bg-[#EA638C]/20 blur-[100px] group-hover:bg-[#EA638C]/30 transition-all duration-700" />
          <div className="relative z-10">
            <h3 className="mb-4 text-3xl italic font-black tracking-tighter uppercase md:text-4xl">
              {t.contactTitle}
            </h3>
            <p className="mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              {t.contactSub}
            </p>
            <Link 
              href="/contact" 
              className="inline-flex bg-[#EA638C] hover:bg-[#FBB6E6] hover:text-[#3E442B] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all items-center gap-3 active:scale-95 shadow-xl shadow-[#EA638C]/20"
            >
              <MessageCircle size={18} /> {t.contactBtn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}