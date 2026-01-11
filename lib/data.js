// lib/data.js
import 'server-only'; // Ensure this function only runs on the server

import mongodb from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { cache } from 'react';

// Use react's cache function to ensure this query runs only once per request,
// even if called multiple times within the same render cycle.
export const getProducts = cache(async () => {
    try {
        await mongodb(); 

        const products = await Product.find({})
            // 🚨 ADDED 'hasVariants' and 'variants' HERE
            .select('name price stock category imageUrl createdAt hasVariants variants')
            .sort({ createdAt: -1 }) 
            .lean(); 

        const serializedProducts = products.map(product => ({
            ...product,
            _id: product._id.toString(),
            createdAt: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString(),
            // Ensure variants is at least an empty array to avoid frontend crashes
            variants: product.variants || [] 
        }));

        return { success: true, products: serializedProducts };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, products: [], error: error.message };
    }
});


// =========================================================================
// 🚨 NEW FUNCTION: getProductById 🚨
// =========================================================================

// export const getProductById = cache(async (id) => {
//     try {
//         await mongodb(); 

//         const product = await Product.findById(id)
//             // 🚨 FIX: Added 'variants' and 'hasVariants' to the selection
//             .select('name description price stock category imageUrl createdAt variants hasVariants isNewArrival') 
//             .lean();

//         if (!product) {
//             return { success: false, product: null, error: "Product not found." };
//         }

//         const serializedProduct = JSON.parse(JSON.stringify(product));

//         return { success: true, product: serializedProduct, error: null };
//     } catch (error) {
//         console.error(`Failed to fetch product ID ${id}:`, error);
//         return { success: false, product: null, error: error.message };
//     }
// });

export const getProductById = cache(async (id) => {
    try {
        await mongodb(); 

        const product = await Product.findById(id)
            // Ensure ALL these fields are in your Mongoose Schema
            .select('name description price stock category imageUrl variants hasVariants isNewArrival createdAt') 
            .lean();

        if (!product) {
            return { success: false, product: null, error: "Product not found." };
        }

        // Deep serialization: This handles nested _id objects inside the variants array
        const serializedProduct = JSON.parse(JSON.stringify(product));

        console.log("✅ SERVER SIDE CHECK - Variant Count:", serializedProduct.variants?.length);

        return { success: true, product: serializedProduct, error: null };
    } catch (error) {
        console.error(`❌ DATABASE ERROR for ID ${id}:`, error);
        return { success: false, product: null, error: error.message };
    }
});
export const getUsers = cache(async () => {
    try {
        await mongodb(); 

        // 💡 Added 'addresses' to the select string
        const users = await User.find({})
            .select('name email role addresses createdAt') 
            .sort({ createdAt: -1 })
            .lean();

        // Serialize the results
        const serializedUsers = users.map(user => ({
            ...user,
            _id: user._id.toString(),
            createdAt: user.createdAt.toISOString(),
            // 💡 Ensure addresses array exists for the frontend map even if empty
            addresses: user.addresses || [] 
        }));

        return { success: true, users: serializedUsers };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, users: [], error: error.message };
    }
});

// lib/data.js

export async function getRelatedProducts(category, currentId) {
    try {
        await connectDB();
        // Fetch 4 products in the same category, excluding the one currently being viewed
        const related = await Product.find({ 
            category: category, 
            _id: { $ne: currentId } 
        })
        .limit(4)
        .lean();

        return { 
            success: true, 
            products: JSON.parse(JSON.stringify(related)) 
        };
    } catch (error) {
        return { success: false, products: [] };
    }
}

