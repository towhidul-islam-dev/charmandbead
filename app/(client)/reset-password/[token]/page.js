"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updatePasswordAction } from "@/actions/auth";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updatePasswordAction(token, password);
    if (res.success) {
      setIsSuccess(true);
      toast.success("Security Updated");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      toast.error(res.error || "Update failed");
    }
    setLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center animate-in zoom-in-95">
          <CheckCircle2 size={48} className="text-[#3E442B] mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#3E442B] uppercase italic">Update <span className="text-[#EA638C]">Complete</span></h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">Redirecting to Login...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FBB6E6]/10 p-4">
      <div className="w-full max-w-[400px] bg-white rounded-[3rem] p-10 shadow-2xl border border-[#FBB6E6]/30">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-[#3E442B]/5 rounded-full mb-4 text-[#3E442B]">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">
            New <span className="text-[#EA638C]">Security</span> Key
          </h1>
        </div>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-1">
             <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.2em] ml-2">New Password</label>
             <input 
                type="password"
                placeholder="••••••••"
                required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] outline-none focus:border-[#EA638C] focus:ring-4 focus:ring-[#FBB6E6]/20 transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
          </div>
          <button 
            disabled={loading} 
            className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-[#3E442B]/10"
          >
            {loading ? "SAVING..." : "ACTIVATE KEY"}
          </button>
        </form>
      </div>
    </main>
  );
}