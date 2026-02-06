"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/actions/auth";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const { token } = useParams();
    const router = useRouter();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // 🟢 Safety check: If no token or expired session
    useEffect(() => {
        if (!token) {
            toast.error("Security session missing");
            router.push("/forgot-password"); // Changed from /login to restart the flow
        }
    }, [token, router]);

    // 🟢 Success countdown logic
    useEffect(() => {
        if (isSuccess && countdown > 0) {
            const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (isSuccess && countdown === 0) {
            router.push("/login");
        }
    }, [isSuccess, countdown, router]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (password.length < 8) { // Security tip: Industry standard is 8+ for OTP resets
            return toast.error("Security key must be at least 8 characters");
        }

        setLoading(true);
        try {
            const res = await updatePasswordAction(token, password);
            
            if (res.success) {
                setIsSuccess(true);
                toast.success("Identity Secured");
            } else {
                toast.error(res.error || "Session expired. Please restart.");
                // Redirect back to forgot password to get a new code
                setTimeout(() => router.push("/forgot-password"), 2000);
            }
        } catch (err) {
            toast.error("A system error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="text-center animate-in zoom-in-95 duration-500 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-[#FBB6E6]">
                    <div className="relative inline-block mb-6">
                         {/* Visual glow effect */}
                        <div className="absolute inset-0 bg-[#FBB6E6] blur-2xl opacity-40 animate-pulse"></div>
                        <CheckCircle2 size={64} className="text-[#3E442B] relative" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                        Key <span className="text-[#EA638C]">Activated</span>
                    </h2>
                    <p className="text-[9px] text-gray-400 font-black uppercase mt-4 tracking-[0.3em]">
                        Redirecting in {countdown}s...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FBB6E6]/10 p-4">
            <div className="w-full max-w-[360px] text-center bg-white p-10 rounded-[3rem] shadow-xl">
                <div className="p-4 bg-[#FBB6E6]/30 rounded-full inline-block mb-6 text-[#EA638C]">
                    <Lock size={28} />
                </div>
                <h1 className="text-2xl font-black text-[#3E442B] uppercase italic mb-8">
                    Update <span className="text-[#EA638C]">Security</span>
                </h1>
                
                <form onSubmit={handleUpdate} className="space-y-4 text-left">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-widest ml-2">New Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[12px] outline-none focus:border-[#EA638C] transition-all" 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-widest ml-2">Confirm Key</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full p-4 bg-gray-50 border ${password && confirmPassword && password !== confirmPassword ? 'border-red-400' : 'border-gray-100'} rounded-2xl text-[12px] outline-none focus:border-[#EA638C] transition-all`} 
                        />
                        {password && confirmPassword && password !== confirmPassword && (
                            <span className="text-[8px] text-red-500 font-bold uppercase mt-1 block tracking-tighter ml-2">Passwords do not match</span>
                        )}
                    </div>
                    
                    <button 
                        disabled={loading || (password !== confirmPassword && confirmPassword !== "")}
                        className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#3E442B]/20"
                    >
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Processing...</>
                        ) : (
                            "Save Credentials"
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}