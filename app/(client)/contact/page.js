// app/(client)/contact/page.js (Access at: /contact)
"use client";

import { useState } from 'react';

import { Mail, Phone, MapPin, Loader } from 'lucide-react'; // Example icons from lucide-react (install if needed)

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
        
        // --- PSEUDOCODE: Replace with actual API call to submit form data ---
        console.log('Submitting contact form:', formData);
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Replace with: fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
        // -------------------------------------------------------------------

        setLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="max-w-3xl px-4 py-24 mx-auto mt-16 text-center border border-green-200 shadow-xl bg-green-50 rounded-xl">
                <h1 className="mb-4 text-4xl font-semibold text-green-700">Message Sent Successfully!</h1>
                <p className="text-xl text-green-600">
                    Thank you for reaching out. We will review your inquiry and get back to you within one business day.
                </p>
            </div>
        );
    }

    return (
        <div className="px-4 py-16 mx-auto mt-16 max-w-7xl ">
            <header className="mb-12 text-center">
                <h1 className="text-5xl tracking-wide text-orange-900 font-extralight">Get In Touch</h1>
                <p className="mt-3 text-xl text-gray-600">
                    For custom sourcing, bulk inquiries, or technical support, use the form below.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-12 p-8 overflow-hidden bg-white border border-gray-100 shadow-2xl lg:grid-cols-3 rounded-2xl lg:p-0">
                
                {/* 1. Contact Information Column (Static, Professional Look) */}
                <div className="flex flex-col justify-center p-8 space-y-8 text-white lg:col-span-1 lg:p-12 bg-brand-primary">
                    <h2 className="text-3xl font-bold text-blue-400">Contact Details</h2>

                    <div className="space-y-6">
                        {/* Address */}
                        <div className="flex items-start space-x-3">
                            <MapPin className="flex-shrink-0 w-6 h-6 mt-1 text-blue-400" />
                            <div>
                                <h3 className="text-lg font-semibold">Our Headquarters</h3>
                                <p className="text-gray-300">123 Gemstone Lane, Jewelry City, JC 90210</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start space-x-3">
                            <Mail className="flex-shrink-0 w-6 h-6 mt-1 text-blue-400" />
                            <div>
                                <h3 className="text-lg font-semibold">Email Support</h3>
                                <p className="text-gray-300">support@j-materials.com</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start space-x-3">
                            <Phone className="flex-shrink-0 w-6 h-6 mt-1 text-blue-400" />
                            <div>
                                <h3 className="text-lg font-semibold">Phone Inquiries</h3>
                                <p className="text-gray-300">(555) 123-4567 (Mon-Fri, 9am-5pm EST)</p>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="pt-4 mt-8 border-t border-white">
                        <p className="text-sm text-gray-500">

[Image of a map showing the business location]
</p>
                    </div>
                </div>

                {/* 2. Contact Form Column */}
                <div className="p-8 lg:col-span-2 lg:p-12">
                    <h2 className="mb-6 text-3xl font-semibold text-gray-800">Send Us a Message</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input name="name" type="text" required onChange={handleChange} className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input name="email" type="email" required onChange={handleChange} className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                            <input name="subject" type="text" required onChange={handleChange} className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500" />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Inquiry</label>
                            <textarea name="message" rows="5" required onChange={handleChange} className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500"></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex items-center justify-center w-full py-3 space-x-2 text-lg font-semibold text-white transition duration-150 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {loading && <Loader className="w-5 h-5 animate-spin" />}
                            <span>{loading ? 'Submitting...' : 'Send Message'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
/** 
export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- PSEUDOCODE: Replace with API call to submit form data ---
        console.log('Submitting contact form...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // -----------------------------------------------------------

        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="max-w-2xl px-4 py-20 mx-auto mt-16 text-center shadow-lg bg-green-50 rounded-xl">
                <h1 className="mb-4 text-3xl font-semibold text-green-700">Thank You!</h1>
                <p className="text-lg text-green-600">
                    Your message has been received. A representative will contact you within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl px-4 py-12 mx-auto mt-16">
            <h1 className="pb-2 mb-6 text-4xl font-light border-b">Contact Our Sourcing Experts</h1>
            <p className="mb-8 text-lg text-gray-600">
                For custom orders, bulk inquiries, or technical support, please fill out the form below.
            </p>

            <div className="grid grid-cols-1 gap-8 p-8 bg-white border border-gray-100 shadow-lg md:grid-cols-3 rounded-xl">
                
                
                <div className="space-y-4 md:col-span-1">
                    <h3 className="text-xl font-semibold text-gray-800">Reach Us Directly</h3>
                    <p className="text-gray-600"><strong>Email:</strong> support@j-materials.com</p>
                    <p className="text-gray-600"><strong>Phone:</strong> (555) 123-4567</p>
                    <p className="text-gray-600">
                        <strong>Address:</strong><br/>
                        123 Gemstone Lane<br/>
                        Jewelry City, JC 90210
                    </p>
                </div>

                
                <form onSubmit={handleSubmit} className="space-y-4 md:col-span-2">
                    <input type="text" placeholder="Your Full Name" required className="w-full p-3 border border-gray-300 rounded-lg" />
                    <input type="email" placeholder="Your Email Address" required className="w-full p-3 border border-gray-300 rounded-lg" />
                    <input type="text" placeholder="Subject of Inquiry (e.g., Bulk Order, Technical)" required className="w-full p-3 border border-gray-300 rounded-lg" />
                    <textarea placeholder="Your Message" rows="5" required className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                    
                    <button type="submit" className="w-full py-3 text-lg font-semibold text-white transition duration-150 bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
}
*/