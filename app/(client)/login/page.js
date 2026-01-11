"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { signIn } from "next-auth/react"; // 💡 REQUIRED: Use NextAuth signIn
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const router = useRouter(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            // 💡 1. Use NextAuth signIn instead of manual fetch
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false, // We handle redirection manually
            });

            if (result?.error) {
                // ❌ FAILURE: NextAuth returns error string
                setError("Invalid email or password. Please try again.");
                toast.error("Login failed.");
            } else {
                toast.success("Welcome back!");
                
                // Using window.location.href is more reliable for the initial 
                // login redirect to ensure cookies are sent to middleware
                const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
                const session = await sessionRes.json();
            
                if (session?.user?.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard/orders';
                }
            }

        } catch (networkError) {
            console.error('Login Error:', networkError);
            setError('Could not connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen pt-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white border border-gray-200 shadow-xl rounded-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-blue-900">Sign In</h2>
                    <p className="text-gray-500 mt-2">Access your workshop dashboard</p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="workshop@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 mt-1 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 mt-1 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-bold text-blue-600 hover:underline">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}