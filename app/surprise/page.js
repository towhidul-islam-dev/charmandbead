// app/surprise/page.js
"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import GiftReveal from '@/components/GiftReveal';
import { Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

function ClaimContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [isRevealing, setIsRevealing] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) setCode(urlCode.toUpperCase());
    
    // Initialize Victory Sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
  }, [searchParams]);

  const handleOpenGift = () => {
    if (code) {
      // 1. ✨ Haptic Feedback (Vibration)
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        // Pattern: Vibrate 200ms, Pause 100ms, Vibrate 200ms
        window.navigator.vibrate([200, 100, 200]);
      }

      // 2. Play Win Sound
      audioRef.current.play().catch(() => console.log("Audio waiting for interaction"));

      // 3. Trigger Brand-Colored Confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

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
          colors: ['#EA638C', '#FBB6E6', '#FFFFFF']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#EA638C', '#FBB6E6', '#FFFFFF']
        });
      }, 250);

      // 4. Switch to Reveal Component
      setIsRevealing(true);
    }
  };

  if (isRevealing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#3E442B]">
         <GiftReveal manualCode={code} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-[#3E442B] px-6">
      <div className="w-full max-w-md space-y-10 text-center">
        
        {/* ICON */}
        <div className="flex justify-center">
          <div className="inline-block p-6 bg-[#EA638C] rounded-[2.5rem] shadow-[0_20px_50px_rgba(234,99,140,0.4)] animate-bounce">
            <Gift size={48} className="text-white" />
          </div>
        </div>
        
        {/* TEXT */}
        <div className="space-y-4">
          <h1 className="text-4xl italic font-black leading-none tracking-tighter text-white uppercase md:text-5xl">
            Your Exclusive <br />
            <span className="text-[#FBB6E6]">Registry Gift</span>
          </h1>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
            Enter your secret access code
          </p>
        </div>

        {/* INPUT & BUTTON */}
        <div className="space-y-4">
          <input 
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE-HERE"
            className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-[2.5rem] text-center text-2xl font-black tracking-[0.4em] text-[#FBB6E6] outline-none focus:border-[#EA638C] focus:bg-white/10 transition-all placeholder:text-white/10"
          />

          <button 
            onClick={handleOpenGift}
            disabled={!code}
            className="w-full py-6 bg-[#EA638C] text-white rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.5em] shadow-2xl hover:bg-[#FBB6E6] hover:text-[#3E442B] active:scale-95 transition-all disabled:opacity-20"
          >
            Open My Gift
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ClaimSurprisePage() {
  return (
    <div className="bg-[#3E442B] min-h-screen overflow-hidden">
      <Suspense fallback={<div className="min-h-screen bg-[#3E442B]" />}>
        <ClaimContent />
      </Suspense>
    </div>
  );
}