"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const router = useRouter(); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); 
        setLoading(true);

        if (!formData.name.trim()) {
            setError("Please enter your full name.");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/login?registered=true');
            } else {
                setError(data.message || "Registration failed. Please try again.");
            }
        } catch (networkError) {
            setError("Network error. Please check if your server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md p-10 space-y-8 bg-white border border-gray-100 shadow-2xl rounded-[3rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section - Branded */}
                <div className="text-center">
                    <div className="inline-flex p-4 bg-[#3E442B]/5 rounded-full mb-4 text-[#3E442B]">
                        <UserPlus size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                        Partner <span className="text-[#EA638C]">Registry</span>
                    </h2>
                    <p className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-[0.4em]">Establish Wholesale Access</p>
                </div>

                {error && (
                    <div className="p-3 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50/50 border border-red-100 rounded-2xl text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.2em] ml-2">Full Name</label>
                        <input
                            name="name" type="text" required
                            value={formData.name} onChange={handleChange}
                            placeholder="YOUR NAME"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] outline-none focus:border-[#EA638C] transition-all placeholder:text-gray-300"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.2em] ml-2">Email Address</label>
                        <input
                            name="email" type="email" required
                            value={formData.email} onChange={handleChange}
                            placeholder="EMAIL@EXAMPLE.COM"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] outline-none focus:border-[#EA638C] transition-all placeholder:text-gray-300"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[#3E442B] uppercase tracking-[0.2em] ml-2">Password</label>
                        <div className="relative">
                            <input
                                name="password" 
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password} onChange={handleChange}
                                placeholder="MIN. 6 CHARACTERS"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] outline-none focus:border-[#EA638C] transition-all pr-12"
                            />
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
                        className="w-full py-4 text-white font-black text-[10px] uppercase tracking-[0.4em] bg-[#3E442B] rounded-2xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-[#3E442B]/10"
                    >
                        {loading ? 'Processing...' : 'Register Account'}
                    </button>
                </form>

                <div className="pt-6 text-center border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Already have an account? 
                        <Link href="/login" className="ml-2 text-[#EA638C] hover:underline transition-all">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}