"use client";
import { Gift, Copy, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function MyRewards({ wins = [] }) {
  const [copiedId, setCopiedId] = useState(null);

  // ✨ Confetti Rain Effect on Mount
  useEffect(() => {
    if (wins.length > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#EA638C', '#FBB6E6'] 
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#3E442B', '#EA638C'] 
        });
      }, 250);
    }
  }, [wins.length]);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Reward code copied!", {
      style: {
        borderRadius: '15px',
        background: '#3E442B',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      },
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">
            My <span className="text-[#EA638C]">Rewards</span>
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
            Exclusive Registry Benefits
          </p>
        </div>
        {wins.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#FBB6E6]/20 rounded-full border border-[#FBB6E6]/30 animate-pulse">
            <Sparkles size={14} className="text-[#EA638C]" />
            <span className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest">
              {wins.length} Rewards Unlocked
            </span>
          </div>
        )}
      </div>

      {/* Rewards List */}
      {wins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
            <Gift className="text-gray-200" size={40} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-6 leading-relaxed">
            You haven't unlocked any surprises yet.<br/>Every order is a chance to win!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {wins.map((win) => {
            // 🟢 EXTRACTION LOGIC: Pull percentage from code string (e.g. GIFT50 -> 50)
            const match = win.code.match(/\d+/);
            const extractedValue = match ? match[0] : win.value;

            return (
              <div 
                key={win._id} 
                className="group bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#FBB6E6] transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#3E442B] rounded-3xl flex items-center justify-center text-[#FBB6E6] shrink-0 shadow-lg group-hover:rotate-6 transition-transform border border-[#EA638C]/20">
                    <span className="text-xl italic font-black leading-none">
                      {/* 🟢 Display extracted percentage or value */}
                      {win.discountType === 'percentage' ? `${extractedValue}%` : `৳${extractedValue}`}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-black text-[#3E442B] uppercase text-sm leading-tight group-hover:text-[#EA638C] transition-colors">
                      {win.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-gray-400">
                      <Calendar size={12} className="shrink-0" />
                      <span className="text-[9px] font-bold uppercase tracking-tighter">
                        Won {new Date(win.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#FAFAFA] p-2 rounded-2xl md:w-56 justify-between border border-gray-100 group-hover:bg-white transition-all shadow-inner">
                  <code className="pl-4 text-[11px] font-black text-[#3E442B] tracking-[0.2em]">
                    {win.code}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(win.code, win._id)}
                    className={`p-3 rounded-xl transition-all shadow-sm ${
                      copiedId === win._id 
                      ? 'bg-green-500 text-white shadow-green-200' 
                      : 'bg-white text-[#EA638C] hover:bg-[#EA638C] hover:text-white'
                    }`}
                  >
                    {copiedId === win._id ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}