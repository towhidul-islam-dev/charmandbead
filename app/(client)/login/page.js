"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { signIn } from "next-auth/react"; 
import toast from 'react-hot-toast';
import { UserCircle, Eye, EyeOff, Loader2 } from "lucide-react"; // Added Eye icons and Loader

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // 🟢 State for visibility
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const router = useRouter(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false, 
            });

            if (result?.error) {
                setError("Verification Failed. Please check your credentials.");
                toast.error("Access Denied");
            } else {
                toast.success("Identity Confirmed");
                router.push("/");
                router.refresh(); 
            }

        } catch (networkError) {
            setError('System Connection Interrupted.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
            <div className="w-full max-w-md p-10 space-y-8 bg-white border border-gray-100 shadow-2xl rounded-[3rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="text-center">
                    <div className="inline-flex p-4 bg-[#3E442B]/5 rounded-full mb-4 text-[#3E442B]">
                        <UserCircle size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                        Partner <span className="text-[#EA638C]">Access</span>
                    </h2>
                    <p className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-[0.4em]">Secure Wholesale Portal</p>
                </div>

                {error && (
                    <div className="p-3 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50/50 border border-red-100 rounded-2xl text-center">
                        {error}
                    </div>
                )}

                {/* Form Section */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.2em] ml-2">Registry Email</label>
                        <input
                            type="email"
                            required
                            placeholder="PARTNER@CHARMBEAD.COM"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-medium outline-none focus:border-[#EA638C] focus:bg-white transition-all placeholder:text-gray-300"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.2em] ml-2">Security Key</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} // 🟢 Toggle type
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] outline-none focus:border-[#EA638C] focus:bg-white transition-all pr-12"
                            />
                            {/* 🟢 Visibility Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#EA638C] transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-white font-black text-[10px] uppercase tracking-[0.4em] bg-[#3E442B] rounded-2xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-[#3E442B]/10 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 size={14} className="animate-spin" /> Verifying...</>
                        ) : 'Establish Session'}
                    </button>
                </form>

                {/* Bottom Links Section */}
                <div className="pt-4 space-y-3 text-center border-t border-gray-50">
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/forgot-password" size={14} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-[#EA638C] transition-colors">
                            Forgot Password?
                        </Link>
                        <div className="h-3 w-[1px] bg-gray-200"></div>
                        <Link href="/register" className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest hover:underline">
                            Create New Account
                        </Link>
                    </div>
                    <p className="text-[8px] font-bold text-gray-200 uppercase tracking-[0.5em]">Charm & Bead Official Registry</p>
                </div>

            </div>
        </div>
    );
}