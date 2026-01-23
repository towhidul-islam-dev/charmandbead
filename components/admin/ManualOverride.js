"use client";
import { useState } from 'react';
import { ShieldCheck, Copy, Send, RefreshCcw } from 'lucide-react';
import { generateManualGift } from '@/actions/surprise';
import toast from 'react-hot-toast';

export default function ManualOverride({ gifts }) {
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleManualAssign = async () => {
    if (!selectedId) return toast.error("Please select a gift first");
    
    setLoading(true);
    const res = await generateManualGift(selectedId);
    
    if (res.success) {
      setResult(res.gift);
      toast.success(`Generated: ${res.gift.title}`, {
        style: {
          border: '1px solid #EA638C',
          padding: '16px',
          color: '#3E442B',
          fontWeight: 'bold'
        },
        iconTheme: {
          primary: '#EA638C',
          secondary: '#FFFAEE',
        },
      });
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-[#FBB6E6] mt-8 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBB6E6]/10 rounded-full -mr-16 -mt-16" />

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#3E442B] text-[#FBB6E6] rounded-2xl shadow-lg">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#3E442B] uppercase italic leading-none">
            Manual <span className="text-[#EA638C]">Override</span>
          </h3>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Bypass probability for VIPs</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-4 md:flex-row">
        <div className="flex-1 w-full">
          <label className="text-[9px] font-black uppercase text-gray-400 ml-2 mb-2 block">Select Reward to Force</label>
          <select 
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-[#EA638C] transition-all appearance-none cursor-pointer"
          >
            <option value="">Choose from registry...</option>
            {gifts.map(gift => (
              <option key={gift._id} value={gift._id}>
                {gift.title} — [{gift.code}]
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleManualAssign}
          disabled={loading || !selectedId}
          className="w-full md:w-auto px-10 py-4 bg-[#EA638C] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#3E442B] transition-all shadow-lg shadow-[#EA638C]/20 disabled:opacity-30 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? <RefreshCcw className="animate-spin" size={14} /> : <Send size={14} />}
          Generate Win
        </button>
      </div>

      {result && (
        <div className="mt-8 p-6 bg-[#3E442B] rounded-3xl flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#EA638C] rounded-2xl flex items-center justify-center text-white font-black text-xl">
              ★
            </div>
            <div>
              <p className="text-[8px] font-black text-[#FBB6E6] uppercase tracking-[0.3em]">Ready to Send</p>
              <p className="mt-1 text-lg font-black leading-none text-white">{result.code}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(result.code);
              toast.success("Code copied!");
            }}
            className="p-4 bg-white/10 text-white rounded-2xl hover:bg-[#EA638C] transition-all"
          >
            <Copy size={18} />
          </button>
        </div>
      )}
    </div>
  );
}