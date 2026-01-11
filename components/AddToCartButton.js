"use client";
import { useState } from 'react';
import { ShoppingBagIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function AddToCartButton({ product }) {
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        // 1. Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

        // 2. Check if item already exists
        const itemExists = existingCart.find(item => item._id === product._id);

        if (itemExists) {
            itemExists.quantity += 1;
        } else {
            existingCart.push({ ...product, quantity: 1 });
        }

        // 3. Save back to localStorage
        localStorage.setItem('cart', JSON.stringify(existingCart));

        // 4. Show success state
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);

        // Optional: Dispatch a custom event to update a Navbar cart counter
        window.dispatchEvent(new Event('cartUpdate'));
    };

    return (
        <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
                added 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
            }`}
        >
            {added ? (
                <>
                    <CheckIcon className="w-6 h-6" />
                    Added to Cart
                </>
            ) : (
                <>
                    <ShoppingBagIcon className="w-6 h-6" />
                    Add to Cart
                </>
            )}
        </button>
    );
}