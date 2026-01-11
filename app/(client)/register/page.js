// app/(client)/register/page.js (Access at: /register)
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use next/navigation for Next.js 16/App Router

export default function RegisterPage() {
    // 💡 State now includes name
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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

        // 💡 CRITICAL FIX 1: Client-side validation to prevent empty/whitespace names
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
            // ... (rest of the fetch logic remains the same)
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Sending the whole object
                body: JSON.stringify(formData), 
            });
            // ... (rest of the response processing)
        } catch (networkError) {
            // ...
        } finally {
            setLoading(false);
        }
    };

// ... (rest of the component);

    return (
        <div className="flex items-center justify-center min-h-screen pt-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 border border-gray-200 shadow-lg rounded-xl">
                <h2 className="text-3xl font-light text-center text-red-900 hover:text-bold">Create Your Workshop Account</h2>

                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    
                    {/* 💡 NAME INPUT: Now aligned with the state and API */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="name" name="name" type="text" required
                            onChange={handleChange}
                            className="w-full p-3 mt-1 transition border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            id="email" name="email" type="email" required
                            onChange={handleChange}
                            className="w-full p-3 mt-1 transition border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password" name="password" type="password" required
                            onChange={handleChange}
                            className="w-full p-3 mt-1 transition border border-gray-300 rounded-md shadow-sm focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-lg font-semibold text-white transition duration-300 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Register Account'}
                    </button>
                </form>

                <div className="text-sm text-center">
                    Already have an account? 
                    <Link href="/login" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
                        Sign In here
                    </Link>
                </div>
            </div>
        </div>
    );
}