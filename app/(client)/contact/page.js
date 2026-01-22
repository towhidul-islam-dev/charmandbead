"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Loader, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitContactForm } from '@/actions/contact';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const result = await submitContactForm(formData);
            
            if (result.success) {
                setIsSubmitted(true);
                toast.success("Message sent successfully!");
            } else {
                toast.error(result.message || "Failed to send message.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-3xl px-6 py-24 mx-auto mt-24 text-center border shadow-2xl border-brand-lightPink bg-white rounded-[3.5rem] animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl bg-brand-lightPink/20 text-brand-pink rotate-3">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="mb-4 text-5xl italic font-black uppercase tracking-tighter text-brand-green">
                    Message <span className="text-brand-pink">Received!</span>
                </h1>
                <p className="text-lg font-bold text-gray-500 uppercase tracking-wide max-w-md mx-auto">
                    Thanks, {formData.name.split(' ')[0]}! We'll get back to you shortly.
                </p>
                <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-10 px-10 py-4 bg-brand-green text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-pink transition-all shadow-lg shadow-brand-green/20 active:scale-95"
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <div className="px-4 py-24 mx-auto max-w-7xl animate-in fade-in duration-700">
            <header className="mb-20 text-center">
                <h1 className="text-6xl italic font-black uppercase tracking-tighter text-brand-green leading-none">
                    Get In <span className="text-brand-pink">Touch</span>
                </h1>
                <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="h-[2px] w-12 bg-brand-lightPink"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Sourcing & Support</p>
                    <div className="h-[2px] w-12 bg-brand-lightPink"></div>
                </div>
            </header>

            <div className="grid grid-cols-1 overflow-hidden bg-white border border-brand-lightPink/30 shadow-2xl lg:grid-cols-3 rounded-[3.5rem]">
                
                {/* 1. Brand Information Sidebar */}
                <div className="relative flex flex-col justify-between p-10 space-y-12 text-white lg:p-14 bg-brand-green overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl italic font-black uppercase tracking-tight mb-2">Details</h2>
                        <div className="w-12 h-1 bg-brand-pink rounded-full"></div>
                    </div>

                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center space-x-5 group cursor-pointer">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all duration-300">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-lightPink mb-1 opacity-70">Our Studio</h3>
                                <p className="text-lg font-bold group-hover:text-brand-lightPink transition-colors">123 Gemstone Lane, JC 90210</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 group cursor-pointer">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all duration-300">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-lightPink mb-1 opacity-70">Email Us</h3>
                                <p className="text-lg font-bold group-hover:text-brand-lightPink transition-colors">support@brand.com</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 group cursor-pointer">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all duration-300">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-lightPink mb-1 opacity-70">Call Us</h3>
                                <p className="text-lg font-bold group-hover:text-brand-lightPink transition-colors">(555) 123-4567</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-pink mb-2 text-center">Available Hours</p>
                        <p className="text-center font-bold text-sm tracking-tight text-brand-lightPink">Mon — Fri: 9:00 AM - 5:00 PM EST</p>
                    </div>
                </div>

                {/* 2. Contact Form Column */}
                <div className="p-10 lg:col-span-2 lg:p-16 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green ml-1">Full Name</label>
                                <input 
                                    name="name" type="text" required onChange={handleChange} value={formData.name}
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/5 outline-none transition-all font-bold text-brand-green" 
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green ml-1">Email Address</label>
                                <input 
                                    name="email" type="email" required onChange={handleChange} value={formData.email}
                                    className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/5 outline-none transition-all font-bold text-brand-green" 
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green ml-1">Subject</label>
                            <input 
                                name="subject" type="text" required onChange={handleChange} value={formData.subject}
                                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/5 outline-none transition-all font-bold text-brand-green" 
                                placeholder="How can we help you?"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green ml-1">Your Message</label>
                            <textarea 
                                name="message" rows="5" required onChange={handleChange} value={formData.message}
                                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/50 focus:ring-4 focus:ring-brand-pink/5 outline-none transition-all font-bold text-brand-green resize-none"
                                placeholder="Tell us about your sourcing needs..."
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="group relative flex items-center justify-center w-full py-6 space-x-4 text-xs font-black uppercase tracking-[0.3em] text-white transition-all bg-brand-pink rounded-3xl hover:bg-brand-green hover:shadow-2xl hover:-translate-y-1 disabled:bg-gray-200 disabled:translate-y-0 shadow-xl shadow-brand-pink/20 overflow-hidden"
                        >
                            {loading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Send Message</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}