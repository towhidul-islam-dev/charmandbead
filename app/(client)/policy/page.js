"use client";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Eye, Cookie, ChevronDown, Loader2 } from "lucide-react";

// Icons mapping for visual flair
const POLICY_ICONS = [
  <Eye size={22} key="eye" />,
  <ShieldCheck size={22} key="shield" />,
  <Lock size={22} key="lock" />,
  <Cookie size={22} key="cookie" />
];

export default function PrivacyPolicy() {
  const [lang, setLang] = useState("en");
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch dynamic policy from API
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch('/api/admin/content');
        const json = await res.json();
        // Find the 'privacy' type from the policies array
        const privacyData = json.policies?.find(p => p.type === 'privacy');
        setPolicy(privacyData);
      } catch (err) {
        console.error("Failed to load policy", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const ui = {
    en: {
      title: "Privacy Policy",
      subtitle: "Your privacy is our priority. Learn how we handle your data with transparency.",
      lastUpdated: policy?.updatedAt ? `Amended: ${new Date(policy.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : "Amended: January 2026",
    },
    bn: {
      title: "গোপনীয়তা নীতি",
      subtitle: "আপনার গোপনীয়তা আমাদের অগ্রাধিকার। আমরা কীভাবে আপনার তথ্য ব্যবহার করি তা জানুন।",
      lastUpdated: policy?.updatedAt ? `সর্বশেষ সংশোধন: ${new Date(policy.updatedAt).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })}` : "সর্বশেষ সংশোধন: জানুয়ারি ২০২৬",
    }
  }[lang];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
    </div>
  );

  // Get the content based on current language
  const activeContent = lang === 'en' ? policy?.content_en : policy?.content_bn;

  return (
    <div className="bg-white min-h-screen py-24 px-6">
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
            {ui.title}
          </h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-widest">
            {ui.subtitle}
          </p>
          <div className="mt-8 inline-block px-6 py-2.5 bg-[#3E442B] text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
            {ui.lastUpdated}
          </div>
        </div>

        {/* Dynamic Policy Content */}
        <div className="bg-white border-2 border-gray-50 rounded-[3rem] p-10 md:p-16 shadow-xl shadow-gray-100/50">
          <div className="prose prose-lg max-w-none">
            {/* Using whitespace-pre-line to preserve paragraphs from your Admin Textarea */}
            <p className="text-[#3E442B]/80 font-medium leading-[2] text-lg whitespace-pre-line">
              {activeContent || "Policy content is currently being updated..."}
            </p>
          </div>
        </div>

        {/* Brand Shield & Footer Note */}
        <div className="mt-32 pt-16 border-t border-gray-100 text-center flex flex-col items-center">
          <div className="w-12 h-1 bg-gradient-to-r from-[#EA638C] to-[#3E442B] rounded-full mb-8" />
          <p className="text-[#3E442B]/30 font-black uppercase text-[10px] tracking-[0.5em]">
            Charm & Bead Security &bull; Global Standards
          </p>
        </div>
      </div>
    </div>
  );
}