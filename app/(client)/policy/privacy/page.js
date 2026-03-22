"use client";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Eye, Cookie, Loader2, AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
  const [lang, setLang] = useState("en");
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 1. Fetch dynamic policy from API
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error("Failed to fetch");
        
        const json = await res.json();
        // Find the 'privacy' type from the policies array
        const privacyData = json.policies?.find(p => p.type === 'privacy');
        setPolicy(privacyData);
      } catch (err) {
        console.error("Failed to load policy", err);
        setError(true);
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
      lastUpdated: policy?.updatedAt 
        ? `Amended: ${new Date(policy.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}` 
        : "Amended: March 2026",
      empty: "Policy content is currently being updated...",
      error: "Unable to load policy. Please refresh."
    },
    bn: {
      title: "গোপনীয়তা নীতি",
      subtitle: "আপনার গোপনীয়তা আমাদের অগ্রাধিকার। আমরা কীভাবে আপনার তথ্য ব্যবহার করি তা জানুন।",
      lastUpdated: policy?.updatedAt 
        ? `সর্বশেষ সংশোধন: ${new Date(policy.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}` 
        : "সর্বশেষ সংশোধন: মার্চ ২০২৬",
      empty: "নীতিমালা বর্তমানে আপডেট করা হচ্ছে...",
      error: "পলিসি লোড করা সম্ভব হয়নি। অনুগ্রহ করে রিফ্রেশ করুন।"
    }
  }[lang];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-[#EA638C] mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B]/40">Loading Secure Data</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
      <AlertCircle className="text-red-400 mb-4" size={48} />
      <p className="font-black uppercase tracking-widest text-[#3E442B]">{ui.error}</p>
    </div>
  );

  // Get the content based on current language
  const activeContent = lang === 'en' ? policy?.content_en : policy?.content_bn;

  return (
    <div className="bg-white min-h-screen py-24 px-6 selection:bg-[#EA638C] selection:text-white">
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
          <div className="inline-flex p-6 bg-[#EA638C]/5 rounded-[3rem] text-[#EA638C] mb-8 border border-[#EA638C]/10 shadow-sm animate-pulse">
            <ShieldCheck size={44} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#3E442B] tracking-tighter uppercase italic mb-6">
            {ui.title}
          </h1>
          <p className="text-[#3E442B]/50 font-bold max-w-lg mx-auto leading-relaxed uppercase text-[11px] tracking-widest px-4">
            {ui.subtitle}
          </p>
          <div className="mt-10 inline-block px-8 py-3 bg-[#3E442B] text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-xl shadow-[#3E442B]/20">
            {ui.lastUpdated}
          </div>
        </div>

        {/* Dynamic Policy Content */}
        <div className="bg-white border-2 border-gray-50 rounded-[4rem] p-10 md:p-20 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
          {/* Subtle Decorative Background Icon */}
          <Lock className="absolute -bottom-10 -right-10 text-gray-50 size-64 -rotate-12" />
          
          <div className="relative z-10">
            {activeContent ? (
              <p className="text-[#3E442B]/80 font-medium leading-[2.2] text-lg md:text-xl whitespace-pre-line text-justify">
                {activeContent}
              </p>
            ) : (
              <div className="py-20 text-center">
                <p className="text-[#3E442B]/30 font-black uppercase tracking-widest text-sm italic">
                  {ui.empty}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Brand Shield & Footer Note */}
        <div className="mt-32 pt-16 border-t border-gray-100 text-center flex flex-col items-center">
          <div className="flex gap-2 mb-8">
             <div className="w-2 h-2 rounded-full bg-[#EA638C]" />
             <div className="w-12 h-2 rounded-full bg-[#3E442B]" />
             <div className="w-2 h-2 rounded-full bg-[#FBB6E6]" />
          </div>
          <p className="text-[#3E442B]/30 font-black uppercase text-[10px] tracking-[0.6em]">
            Charm & Bead Security Standards &bull; March 2026
          </p>
        </div>
      </div>
    </div>
  );
}