"use client";
import React, { useState, useEffect } from "react";
import { 
  Save, Plus, Trash2, FileText, HelpCircle, 
  ShieldCheck, RotateCcw, Loader2, CheckCircle, Truck, XCircle, AlertTriangle 
} from "lucide-react";
import { toast } from "react-hot-toast";

const TABS = [
  { id: "faq", label: "FAQs", icon: HelpCircle },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "refund", label: "Refund", icon: RotateCcw },
  { id: "terms", label: "Terms", icon: FileText },
  { id: "shipping", label: "Shipping", icon: Truck },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("faq");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [faqs, setFaqs] = useState([]);
  const [policies, setPolicies] = useState({
    privacy: { content_en: "", content_bn: "" },
    refund: { content_en: "", content_bn: "" },
    terms: { content_en: "", content_bn: "" },
    shipping: { content_en: "", content_bn: "" },
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (data.faqs) setFaqs(data.faqs);
      
      if (data.policies) {
        const policyMap = { ...policies };
        data.policies.forEach(p => {
          policyMap[p.type] = { content_en: p.content_en, content_bn: p.content_bn };
        });
        setPolicies(policyMap);
      }
    } catch (error) {
      toast.error("Database connection failed");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete FAQ locally
  const deleteFaq = (index) => {
    if (window.confirm("Remove this FAQ from the list? (Click 'Sync All' to save changes)")) {
      const updatedFaqs = faqs.filter((_, i) => i !== index);
      setFaqs(updatedFaqs);
      toast.success("FAQ removed locally");
    }
  };

  // 🗑️ DELETE: Remove a Policy Type entirely
  const deletePolicyType = (type) => {
    if (window.confirm(`Permanently delete the ${type.toUpperCase()} policy? This will be removed from the database after you click 'Sync All Policies'.`)) {
      const updatedPolicies = { ...policies };
      delete updatedPolicies[type]; 
      setPolicies(updatedPolicies);
      
      // Redirect to FAQs after deletion to avoid UI errors
      setActiveTab("faq");
      toast.error(`${type.toUpperCase()} removed from list.`);
    }
  };

  // 🧹 Clear text fields only
  const clearPolicyFields = (type) => {
    if (window.confirm(`Clear all text from ${type.toUpperCase()}?`)) {
      setPolicies({
        ...policies,
        [type]: { content_en: "", content_bn: "" }
      });
      toast.success("Fields cleared locally");
    }
  };

  // 🟢 Global Policy Sync (FAQ-Style)
  const handleSyncAllPolicies = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category: "Policy", 
          data: policies 
        }),
      });
      if (res.ok) toast.success("All Policies Synchronized!");
      else throw new Error();
    } catch (error) {
      toast.error("Policy Sync failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaqs = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "FAQ", data: faqs }),
      });
      if (res.ok) toast.success("FAQs Synchronized!");
      else throw new Error();
    } catch (error) {
      toast.error("FAQ Sync failed");
    } finally {
      setSaving(false);
    }
  };

  const addFaq = () => {
    setFaqs([...faqs, { question_en: "", question_bn: "", answer_en: "", answer_bn: "", order: faqs.length }]);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen selection:bg-[#EA638C] selection:text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#3E442B] uppercase italic tracking-tighter leading-none">
              Content <span className="text-[#EA638C]">Manager</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3 underline decoration-[#EA638C]/30 decoration-2">Charm & Bead Admin</p>
          </div>
        </header>

        {/* 📑 Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            // Only show the tab if it's 'faq' OR if it exists in our policies state
            (tab.id === "faq" || policies[tab.id]) && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? "bg-[#3E442B] text-white shadow-xl shadow-[#3E442B]/20" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-[#3E442B]"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            )
          ))}
        </div>

        <div className="bg-white rounded-[3.5rem] p-6 md:p-12 shadow-2xl shadow-gray-200/40 border border-white">
          
          {activeTab === "faq" ? (
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="group p-8 border-2 border-gray-50 rounded-[3rem] hover:border-[#EA638C]/20 transition-all relative bg-white">
                  <button 
                    onClick={() => deleteFaq(idx)}
                    className="absolute top-8 right-8 p-3 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-[#3E442B] uppercase bg-gray-100 px-4 py-1.5 rounded-full">English Question {idx + 1}</span>
                      <input 
                        className="w-full p-6 bg-gray-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-[#3E442B]/10 font-bold" 
                        value={faq.question_en}
                        onChange={(e) => { const n = [...faqs]; n[idx].question_en = e.target.value; setFaqs(n); }}
                      />
                      <textarea 
                        className="w-full p-6 bg-gray-50 rounded-2xl text-sm border-none h-32 leading-relaxed" 
                        value={faq.answer_en}
                        onChange={(e) => { const n = [...faqs]; n[idx].answer_en = e.target.value; setFaqs(n); }}
                      />
                    </div>
                    <div className="space-y-4">
                      <span className="text-[9px] font-black text-[#EA638C] uppercase bg-pink-50 px-4 py-1.5 rounded-full">বাংলা প্রশ্ন {idx + 1}</span>
                      <input 
                        className="w-full p-6 bg-pink-50/30 rounded-2xl text-sm border-none font-bold" 
                        value={faq.question_bn}
                        onChange={(e) => { const n = [...faqs]; n[idx].question_bn = e.target.value; setFaqs(n); }}
                      />
                      <textarea 
                        className="w-full p-6 bg-pink-50/30 rounded-2xl text-sm border-none h-32 leading-relaxed" 
                        value={faq.answer_bn}
                        onChange={(e) => { const n = [...faqs]; n[idx].answer_bn = e.target.value; setFaqs(n); }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col md:flex-row gap-4 pt-8">
                <button onClick={addFaq} className="flex-[2] py-6 border-2 border-dashed border-gray-200 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-[#EA638C] hover:text-[#EA638C] transition-all flex items-center justify-center gap-3">
                  <Plus size={20} /> Add FAQ
                </button>
                <button onClick={handleSaveFaqs} disabled={saving} className="flex-1 py-6 bg-[#3E442B] text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black transition-all">
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Sync All FAQs
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-4">
                  <button onClick={() => clearPolicyFields(activeTab)} className="text-[10px] font-black uppercase text-gray-400 hover:text-[#3E442B] flex items-center gap-2">
                    <XCircle size={14} /> Clear Text
                  </button>
                </div>
                {/* 🗑️ NEW: DELETE BUTTON */}
                <button onClick={() => deletePolicyType(activeTab)} className="text-[10px] font-black uppercase text-red-400 hover:text-red-600 flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 transition-all">
                  <Trash2 size={14} /> Delete This Policy Type
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-[#3E442B] uppercase tracking-[0.4em] flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> English Content</h3>
                  <textarea 
                    className="w-full p-10 bg-gray-50 rounded-[3rem] text-base border-none min-h-[500px] leading-[1.8] font-medium text-gray-700 shadow-inner" 
                    value={policies[activeTab]?.content_en || ""}
                    onChange={(e) => setPolicies({...policies, [activeTab]: {...policies[activeTab], content_en: e.target.value}})}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.4em] flex items-center gap-2"><CheckCircle size={16} /> Bengali Content</h3>
                  <textarea 
                    className="w-full p-10 bg-pink-50/20 rounded-[3rem] text-base border-none min-h-[500px] leading-[1.8] font-medium text-gray-700 shadow-inner" 
                    value={policies[activeTab]?.content_bn || ""}
                    onChange={(e) => setPolicies({...policies, [activeTab]: {...policies[activeTab], content_bn: e.target.value}})}
                  />
                </div>
              </div>
              
              <div className="mt-12 p-1 bg-gray-50 rounded-[2.5rem] flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4 text-[#3E442B]/40 text-[9px] font-black uppercase tracking-widest"><AlertTriangle size={12} /> This will overwrite all policies in the database</div>
                <button 
                  onClick={handleSyncAllPolicies}
                  disabled={saving}
                  className="w-full py-7 bg-[#EA638C] text-white rounded-[2.2rem] font-black uppercase text-[12px] tracking-[0.5em] shadow-2xl hover:bg-[#3E442B] transition-all flex items-center justify-center gap-4"
                >
                  {saving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />} Sync All Policies
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}