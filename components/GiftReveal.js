// components/GiftReveal.js
"use client";
import { useState } from 'react';
import { Sparkles, Copy, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function GiftReveal({ manualCode }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const fireConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds of celebration
    const colors = ['#EA638C', '#FBB6E6', '#3E442B', '#FFD700'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleReveal = () => {
    setRevealed(true);
    fireConfetti();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(manualCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-lg mx-auto p-4">
      {!revealed ? (
        <div 
          onClick={handleReveal}
          className="group cursor-pointer relative w-64 h-64 bg-[#EA638C] rounded-[3.5rem] flex items-center justify-center shadow-[0_25px_60px_-15px_rgba(234,99,140,0.6)] hover:scale-105 transition-all duration-500"
        >
          <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-[2.5rem] animate-[spin_10s_linear_infinite]" />
          <div className="p-6 transition-transform rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <p className="absolute -bottom-12 text-[10px] font-black text-[#FBB6E6] uppercase tracking-[0.4em] animate-pulse">
            Tap to unwrap
          </p>
        </div>
      ) : (
        <div className="w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl border-[6px] border-[#FBB6E6]/30 animate-in zoom-in spin-in-1 duration-700">
          <div className="w-20 h-20 bg-[#FBB6E6] rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-lg">
            <Sparkles className="text-[#EA638C] w-10 h-10" />
          </div>
          
          <h2 className="text-[#3E442B] text-3xl font-black uppercase italic tracking-tighter leading-none">
            Registry <span className="text-[#EA638C]">Unlocked</span>
          </h2>
          
          <div className="mt-10 p-8 bg-[#3E442B] rounded-[2.5rem] relative overflow-hidden group">
            {/* Visual shine effect on the code box */}
            <div className="absolute inset-0 transition-transform duration-1000 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full" />
            
            <p className="text-[9px] font-black text-[#FBB6E6] mb-3 uppercase tracking-[0.3em]">Your Unique Reward Code</p>
            <p className="text-4xl font-black text-white tracking-[0.2em] drop-shadow-md">{manualCode}</p>
            
            <button 
              onClick={handleCopy}
              className={`mt-8 w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                copied ? 'bg-green-500 text-white' : 'bg-[#EA638C] text-white hover:bg-[#FBB6E6] hover:text-[#3E442B]'
              }`}
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? "Copied to clipboard" : "Copy Discount Code"}
            </button>
          </div>

          <button 
             onClick={() => window.location.href = '/products'}
             className="mt-8 text-[10px] font-black uppercase text-[#3E442B]/40 hover:text-[#EA638C] transition-colors tracking-widest"
          >
            ← Back to Shopping
          </button>
        </div>
      )}
    </div>
  );
}