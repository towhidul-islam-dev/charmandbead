// components/CartPage.jsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'; 
import Image from 'next/image';

export default function CartPage({ initialItems = [] }) {
    // Sync state with server-provided data
    const [cartItems, setCartItems] = useState(initialItems);

    // --- Helper: Safe Image URL Parser ---
    const getSafeImageUrl = (item) => {
        // 1. Check every possible field for a URL
        const url = item.imageUrl || item.img || item.image;

        if (!url || typeof url !== 'string' || url.includes("PLACEHOLDER")) {
            return "/placeholder.png"; 
        }

        // 2. Fix Cloudinary or absolute URLs that might be missing the protocol
        if (url.startsWith('//')) return `https:${url}`;

        // 3. Ensure local paths have a leading slash
        if (!url.startsWith('http') && !url.startsWith('/')) {
            return `/${url}`;
        }

        return url;
    };

    const formatTaka = (amount, decimals = 2) => {
        return `৳${Number(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // --- Interaction Handlers ---
    const updateQuantity = useCallback((id, delta) => {
        setCartItems(prev => prev.map(item => 
            item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    }, []);

    const toggleSelection = useCallback((id) => {
        setCartItems(prev => {
            if (id === 'all') {
                const allSelected = prev.every(item => item.isSelected);
                return prev.map(item => ({ ...item, isSelected: !allSelected }));
            }
            return prev.map(item => item._id === id ? { ...item, isSelected: !item.isSelected } : item);
        });
    }, []);

    const removeItem = useCallback((id) => {
        setCartItems(prev => prev.filter(item => item._id !== id));
    }, []);

    // --- Calculations ---
    const { subtotal, grandTotal } = useMemo(() => {
        const selected = cartItems.filter(item => item.isSelected);
        const sub = selected.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const shipping = 760 * 1.2; 
        return { subtotal: sub, grandTotal: sub + shipping };
    }, [cartItems]);

    if (cartItems.length === 0) {
        return <div className="p-20 font-medium text-center text-gray-500">Your cart is empty.</div>;
    }

    return (
        <div className="max-w-5xl min-h-screen p-4 pb-32 mx-auto md:p-6 bg-gray-50">
            <div className="flex items-center p-3 space-x-2 bg-white border-b rounded-t-lg shadow-sm">
                <input 
                    type="checkbox" 
                    checked={cartItems.length > 0 && cartItems.every(i => i.isSelected)} 
                    onChange={() => toggleSelection('all')} 
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                />
                <span className="font-bold">Select All Items</span>
            </div>

            <div className="bg-white divide-y rounded-b-lg shadow-md">
                {cartItems.map((item) => (
                    <div key={item._id} className="flex items-start gap-4 p-4">
                        <input 
                            type="checkbox" 
                            checked={item.isSelected} 
                            onChange={() => toggleSelection(item._id)} 
                            className="w-5 h-5 mt-2 text-indigo-600 rounded cursor-pointer"
                        />
                        <div className="relative flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border">
                            <Image 
                                src={getSafeImageUrl(item)} 
                                alt={item.name || "Product"} 
                                fill 
                                className="object-cover"
                                sizes="96px"
                                // 💡 Important: This prevents breakage if the URL returns 404
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder.png";
                                }}
                                // unoptimized allows external images without next.config.js whitelist
                                unoptimized 
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                            <p className="mt-1 text-xs text-gray-500">Added on: {formatDate(item.createdAt)}</p>
                            
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center border rounded">
                                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1 px-2 border-r hover:bg-gray-100">-</button>
                                    <span className="px-3 text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1 px-2 border-l hover:bg-gray-100">+</button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-red-600">{formatTaka(item.price * item.quantity)}</p>
                                    <button onClick={() => removeItem(item._id)} className="mt-1 text-gray-400 hover:text-red-500">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sticky Bottom Summary */}
            <div className="fixed bottom-16 md:bottom-0 inset-x-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <div>
                        <p className="text-xs text-gray-500">Shipping charge will be added later</p>
                        <p className="text-lg font-bold">Total: <span className="text-red-600">{formatTaka(grandTotal)}</span></p>
                    </div>
                    <button className="px-8 py-3 font-bold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}