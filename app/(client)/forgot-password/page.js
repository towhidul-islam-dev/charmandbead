"use client";
import { useState } from "react";
import { startPasswordReset } from "@/actions/auth";
import toast from "react-hot-toast";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const handleRequest = async (e) => {
        e.preventDefault();
        const res = await startPasswordReset(email);
        if (res.success) toast.success("Reset link sent!");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-[360px] text-center">
                <h1 className="text-3xl font-black text-[#3E442B] uppercase italic mb-8">
                    Forgot <span className="text-[#EA638C]">Portal</span>
                </h1>
                <form onSubmit={handleRequest} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="ENTER REGISTERED EMAIL"
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#EA638C]"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button className="w-full bg-[#3E442B] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                        Send Secure Link
                    </button>
                </form>
            </div>
        </main>
    );
}