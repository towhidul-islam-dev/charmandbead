"use client";
import { useState, useEffect } from "react";
import { startPasswordReset, verifyOTPAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, ShieldCheck, KeyRound, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
    const [loading, setLoading] = useState(false);
    
    // 🟢 Resend Timer State
    const [resendTimer, setResendTimer] = useState(0);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleRequestEmail = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        
        try {
            const res = await startPasswordReset(email);
            if (res.success) {
                toast.success("Security code dispatched");
                setStep(2);
                setResendTimer(60); // Start 60s cooldown
            } else {
                toast.error(res.error || "Failed to send code");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await verifyOTPAction(email, otp);
            if (res.success) {
                toast.success("Identity Verified");
                router.push(`/reset-password/${res.token}`);
            } else {
                toast.error(res.error || "Invalid code");
            }
        } catch (error) {
            toast.error("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-[360px] text-center">
                
                {/* Header Icon */}
                <div className="mb-6 inline-flex p-4 bg-[#FBB6E6]/20 rounded-full text-[#EA638C]">
                    {step === 1 ? <ShieldCheck size={32} /> : <KeyRound size={32} />}
                </div>

                <h1 className="text-3xl font-black text-[#3E442B] uppercase italic mb-2">
                    Security <span className="text-[#EA638C]">{step === 1 ? "Portal" : "Check"}</span>
                </h1>
                
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 px-4 leading-relaxed">
                    {step === 1 
                        ? "Enter your registry email to receive a 6-digit access code" 
                        : `Code sent to ${email.split('@')[0].slice(0, 3)}***@${email.split('@')[1]}`
                    }
                </p>
                
                {step === 1 ? (
                    /* STEP 1: EMAIL REQUEST */
                    <form onSubmit={handleRequestEmail} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative">
                            <input 
                                type="email" 
                                placeholder="REGISTERED EMAIL"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#EA638C] focus:ring-4 focus:ring-[#FBB6E6]/20 transition-all"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <button 
                            disabled={loading}
                            className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#3E442B]/10"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Access Code"}
                        </button>
                    </form>
                ) : (
                    /* STEP 2: OTP VERIFICATION */
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="000000"
                                maxLength={6}
                                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center text-3xl font-black tracking-[15px] outline-none focus:border-[#EA638C] focus:ring-4 focus:ring-[#FBB6E6]/20 transition-all placeholder:tracking-normal placeholder:opacity-20"
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                disabled={loading}
                            />
                            
                            <button 
                                disabled={loading}
                                className="w-full bg-[#EA638C] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#EA638C]/10"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                            </button>
                        </form>

                        <div className="mt-6 flex flex-col gap-3">
                            {resendTimer > 0 ? (
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <RefreshCcw size={10} className="animate-spin" />
                                    Resend available in {resendTimer}s
                                </p>
                            ) : (
                                <button 
                                    onClick={handleRequestEmail}
                                    className="text-[9px] font-black uppercase text-[#3E442B] hover:text-[#EA638C] transition-colors tracking-widest"
                                >
                                    Didn't receive code? Resend
                                </button>
                            )}
                            
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-[9px] font-black uppercase text-gray-400 hover:text-black transition-colors"
                            >
                                Change Email Address
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-10 border-t border-gray-100 pt-8">
                    <Link 
                        href="/login" 
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#3E442B] hover:text-[#EA638C] transition-all group"
                    >
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Registry
                    </Link>
                </div>
            </div>
        </main>
    );
}