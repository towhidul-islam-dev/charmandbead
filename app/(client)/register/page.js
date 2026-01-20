// app/(client)/register/page.js (Access at: /register)
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react'; // 💡 Added icons for the toggle

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // 💡 State for visibility
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
        <div className="flex items-center justify-center min-h-screen pt-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 border border-gray-200 shadow-lg rounded-xl bg-white">
                <h2 className="text-3xl font-light text-center text-red-900">Create Your Workshop Account</h2>

                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="name" name="name" type="text" required
                            value={formData.name} onChange={handleChange}
                            placeholder="Your Name"
                            className="w-full p-3 mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            id="email" name="email" type="email" required
                            value={formData.email} onChange={handleChange}
                            placeholder="email@example.com"
                            className="w-full p-3 mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                id="password" name="password" 
                                type={showPassword ? "text" : "password"} // 💡 Dynamic type
                                required
                                value={formData.password} onChange={handleChange}
                                placeholder="Min. 6 characters"
                                className="w-full p-3 mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                            />
                            {/* 💡 Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none mt-0.5"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-lg font-semibold text-white transition duration-300 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Register Account'}
                    </button>
                </form>

                <div className="text-sm text-center text-gray-600">
                    Already have an account? 
                    <Link href="/login" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
                        Sign In here
                    </Link>
                </div>
            </div>
        </div>
    );
}