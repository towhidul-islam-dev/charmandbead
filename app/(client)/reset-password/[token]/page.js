"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { updatePasswordAction } from "@/actions/auth";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const { token } = useParams();
    const router = useRouter();
    
    // Form State
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // 🟢 1. Password Strength Logic
    const strength = useMemo(() => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score++; // Length
        if (/[A-Z]/.test(password)) score++; // Uppercase
        if (/[0-9]/.test(password)) score++; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) score++; // Specials
        return score;
    }, [password]);

    const getStrengthData = () => {
        switch (strength) {
            case 1: return { label: "WEAK", color: "#FF4D4D" };
            case 2: return { label: "FAIR", color: "#FFA500" };
            case 3: return { label: "GOOD", color: "#EA638C" }; // Brand Pink
            case 4: return { label: "STRONG", color: "#3E442B" }; // Brand Green
            default: return { label: "EMPTY", color: "#f3f4f6" };
        }
    };

    const { label: strengthLabel, color: strengthColor } = getStrengthData();

    // 🟢 2. Security & Redirect Logic
    useEffect(() => {
        if (!token) {
            toast.error("Security session missing");
            router.push("/forgot-password");
        }
    }, [token, router]);

    useEffect(() => {
        if (isSuccess && countdown > 0) {
            const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (isSuccess && countdown === 0) {
            router.push("/login");
        }
    }, [isSuccess, countdown, router]);

    // 🟢 3. Action Handler
    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error("Keys do not match");
        }
        if (strength < 2) {
            return toast.error("Please create a stronger password");
        }

        setLoading(true);
        try {
            const res = await updatePasswordAction(token, password);
            if (res.success) {
                setIsSuccess(true);
                toast.success("Identity Secured");
            } else {
                toast.error(res.error || "Session expired. Please restart.");
                setTimeout(() => router.push("/forgot-password"), 2000);
            }
        } catch (err) {
            toast.error("A system error occurred");
        } finally {
            setLoading(false);
        }
    };

    // 🟢 4. Success View
    if (isSuccess) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="text-center animate-in zoom-in-95 duration-500 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-[#FBB6E6]">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-[#FBB6E6] blur-2xl opacity-40 animate-pulse"></div>
                        <CheckCircle2 size={64} className="text-[#3E442B] relative" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                        Key <span className="text-[#EA638C]">Activated</span>
                    </h2>
                    <p className="text-[10px] text-gray-400 font-black uppercase mt-4 tracking-[0.3em]">
                        Redirecting to Registry in {countdown}s...
                    </p>
                </div>
            </main>
        );
    }

    // 🟢 5. Form View
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FBB6E6]/10 p-4">
            <div className="w-full max-w-[380px] text-center bg-white p-10 rounded-[3rem] shadow-xl border border-white">
                <div className="p-4 bg-[#FBB6E6]/30 rounded-full inline-block mb-6 text-[#EA638C]">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl font-black text-[#3E442B] uppercase italic mb-8">
                    Secure <span className="text-[#EA638C]">Update</span>
                </h1>
                
                <form onSubmit={handleUpdate} className="space-y-6 text-left">
                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-widest">New Password</label>
                            <span style={{ color: strengthColor }} className="text-[8px] font-black uppercase transition-colors duration-300">
                                {strengthLabel}
                            </span>
                        </div>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[12px] outline-none focus:border-[#EA638C] transition-all" 
                        />
                        {/* Strength Meter Bar */}
                        <div className="flex gap-1.5 px-1 mt-2">
                            {[1, 2, 3, 4].map((s) => (
                                <div 
                                    key={s}
                                    className="h-1 flex-1 rounded-full transition-all duration-500"
                                    style={{ 
                                        backgroundColor: strength >= s ? strengthColor : "#E5E7EB" 
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-widest ml-1">Confirm Key</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full p-4 bg-gray-50 border ${password && confirmPassword && password !== confirmPassword ? 'border-red-400' : 'border-gray-100'} rounded-2xl text-[12px] outline-none focus:border-[#EA638C] transition-all`} 
                        />
                        {password && confirmPassword && password !== confirmPassword && (
                            <span className="text-[8px] text-red-500 font-bold uppercase mt-1 block tracking-tighter ml-1">Keys do not match</span>
                        )}
                    </div>
                    
                    <button 
                        disabled={loading || strength < 2 || (password !== confirmPassword)}
                        className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#3E442B]/20"
                    >
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Syncing...</>
                        ) : (
                            <>Activate Key <ArrowRight size={14} /></>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}