"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/actions/auth"; // 🟢 Import the action
import toast from "react-hot-toast";

export default function ResetPassword() {
    const { token } = useParams(); // 🟢 Get token from URL
    const router = useRouter();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Validation
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (password.length < 6) {
            return toast.error("Security key must be at least 6 characters");
        }

        setLoading(true);
        const res = await updatePasswordAction(token, password);
        
        if (res.success) {
            setIsSuccess(true);
            toast.success("Identity Secured");
            // Redirect to login after 3 seconds
            setTimeout(() => router.push("/login"), 3000);
        } else {
            toast.error(res.error || "Link expired or invalid");
        }
        setLoading(false);
    };

    if (isSuccess) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#FBB6E6]/10 p-4">
                <div className="text-center animate-in zoom-in-95 duration-500 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-[#FBB6E6]">
                    <CheckCircle2 size={64} className="text-[#3E442B] mx-auto mb-6" strokeWidth={1.5} />
                    <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                        Key <span className="text-[#EA638C]">Activated</span>
                    </h2>
                    <p className="text-[9px] text-gray-400 font-black uppercase mt-4 tracking-[0.3em]">
                        Redirecting to Registry...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-[360px] text-center">
                <div className="p-4 bg-[#FBB6E6]/30 rounded-full inline-block mb-6 text-[#EA638C]">
                    <Lock size={28} />
                </div>
                <h1 className="text-2xl font-black text-[#3E442B] uppercase italic mb-8">
                    Update <span className="text-[#EA638C]">Security</span>
                </h1>
                
                <form onSubmit={handleUpdate} className="space-y-4">
                    <input 
                        type="password" 
                        placeholder="NEW PASSWORD" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#EA638C] transition-all" 
                    />
                    <input 
                        type="password" 
                        placeholder="CONFIRM NEW PASSWORD" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#EA638C] transition-all" 
                    />
                    
                    <button 
                        disabled={loading}
                        className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Save Credentials"
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}