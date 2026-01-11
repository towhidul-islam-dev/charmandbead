// components/ProductEditForm.jsx
"use client";

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProduct } from '@/actions/product'; // The update Server Action

export default function ProductEditForm({ initialData, productId }) {
    const router = useRouter();
    
    // 1. Initialize Action State
    // We bind the productId to the Server Action so it receives (prevState, formData)
    const [state, formAction] = useActionState(saveProduct.bind(null, productId), {
        success: null,
        message: null,
    });
    
    // State to hold a preview of the current/new image
    const [imagePreviewUrl, setImagePreviewUrl] = useState(initialData.imageUrl);

    // 2. Handle Action State Changes (Success/Error)
    useEffect(() => {
        if (state?.success) {
            // Success: Navigate back to the product list
            console.log(`Product ${productId} updated successfully!`);
            router.push('/admin/products');
        } else if (state?.message && !state?.success) {
            // Error: Log and display the message
            console.error("Update Error:", state.message);
        }
    }, [state, router, productId]);

    // Function to handle file input change for preview
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };
    
    // --- Mock Categories for the dropdown (Adjust these to your actual list) ---
    const categories = ['Metals', 'Stones', 'Findings', 'Tools', 'Other'];

    return (
        <form action={formAction} className="p-6 space-y-6 bg-white rounded-lg shadow-xl">
            
            {/* Server Error/Validation Display */}
            {state?.message && !state?.success && (
                <div className="p-3 font-medium text-red-700 bg-red-100 rounded-md">
                    {state.message}
                </div>
            )}
            
            {/* -------------------- Product Name -------------------- */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    defaultValue={initialData.name} 
                    required 
                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            
            {/* -------------------- Price & Stock -------------------- */}
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        defaultValue={initialData.price} 
                        step="0.01"
                        required 
                        className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input 
                        type="number" 
                        id="stock" 
                        name="stock" 
                        defaultValue={initialData.stock} 
                        required 
                        className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>

            {/* -------------------- Category -------------------- */}
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select 
                    id="category" 
                    name="category" 
                    defaultValue={initialData.category} 
                    required 
                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            
            {/* -------------------- Description -------------------- */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    id="description" 
                    name="description" 
                    rows="4" 
                    defaultValue={initialData.description} 
                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                />
            </div>

            {/* -------------------- Image Replacement -------------------- */}
            <div className="p-4 border rounded-md bg-gray-50">
                <p className="mb-3 text-sm font-medium text-gray-700">Product Image</p>
                
                {/* Image Preview */}
                {imagePreviewUrl && (
                    <div className="mb-4">
                        <img src={imagePreviewUrl} alt="Product Preview" className="object-cover w-32 h-32 rounded shadow-md" />
                        <p className="mt-2 text-xs text-gray-500">Current/New image preview.</p>
                    </div>
                )}
                
                {/* File Input */}
                <div>
                    <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Replace Image</label>
                    <input 
                        type="file" 
                        id="imageFile" 
                        name="imageFile" 
                        onChange={handleFileChange}
                        className="block w-full mt-1 text-sm text-gray-500"
                    />
                </div>
            </div>

            {/* -------------------- Submit Button -------------------- */}
            <button 
                type="submit" 
                className="w-full py-2 text-lg font-semibold text-white transition duration-150 bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700"
            >
                Save Changes
            </button>
        </form>
    );
}