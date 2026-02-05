"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Clock } from "lucide-react";

export default function TwoFactorForm({ email, onVerify }) {
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(timer - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    return (
        <div className="w-full max-w-[350px] p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl text-center animate-in zoom-in-95">
            <div className="inline-flex p-4 bg-pink-50 rounded-full mb-6 text-[#EA638C]">
                <ShieldCheck size={32} />
            </div>
            
            <h2 className="text-xl font-black text-[#3E442B] uppercase italic mb-2">Two-Factor</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                Code sent to <span className="text-[#EA638C]">{email}</span>
            </p>

            <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center text-3xl font-black tracking-[0.4em] py-4 bg-gray-50 border-2 border-transparent focus:border-[#EA638C] rounded-2xl outline-none transition-all text-[#3E442B]"
                placeholder="000000"
            />

            <button 
                onClick={() => onVerify(code)}
                className="w-full mt-6 bg-[#3E442B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-lg"
            >
                Confirm Access
            </button>

            <p className="mt-6 text-[9px] font-black text-gray-300 uppercase flex items-center justify-center gap-2">
                <Clock size={10} /> {timer > 0 ? `Resend in ${timer}s` : "Resend available"}
            </p>
        </div>
    );
}