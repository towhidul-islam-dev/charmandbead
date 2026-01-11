// app/api/admin/products/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; // 💡 Import connection utility
import Product from '@/models/Product'; // 💡 Import the Mongoose Product Model
import { authorizeAdmin } from "@/lib/auth";

/**
 * 🛡️ Security Check Utility:
 * (Authorization logic remains the same)
 */
function authorizeAdmin(request) {
    // PSEUDOCODE: Replace with actual token/session validation
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    // In a real app, this token would be verified against a user session
    if (!token || token !== 'VALID_ADMIN_TOKEN') {
        return new NextResponse(
            JSON.stringify({ message: 'Authentication required or not authorized' }), 
            { status: 403 }
        );
    }
    return null; // Authorization successful
}


// ------------------------------------
// --- 1. GET (READ ALL PRODUCTS) ---
// ------------------------------------
// export async function GET(request) {
//     const authuError = authorizeAdmin(request);
//     if (authError) return athError; 

//     try {
//         await connectToDatabase(); // 💡 Connect to MongoDB

//         // Mongoose Code: Find all products and sort by name
//         const products = await Product.find({}).sort({ name: 1 });
        
//         return NextResponse.json(products, { status: 200 });
//     } catch (error) {
//         console.error("API GET Error:", error);
//         return new NextResponse(JSON.stringify({ message: 'Failed to fetch products' }), { status: 500 });
//     }
// }

export async function GET(request) {
    const authError = authorizeAdmin(request);
    if (authError) return authError; 

    try {
        await connectToDatabase();

        // 💡 1. Extract query parameters from the URL
        const { searchParams } = new URL(request.url);
        const isNewArrivalParam = searchParams.get("newArrival");

        // 💡 2. Build the filter object
        // If ?newArrival=true is in the URL, we only fetch those.
        // Otherwise, we fetch everything for the admin.
        let filter = {};
        if (isNewArrivalParam === "true") {
            filter = { isNewArrival: true };
        }

        // 💡 3. Find products with the filter and sort
        // Sorting by 'createdAt: -1' is usually better for New Arrivals (newest first)
        const products = await Product.find(filter).sort({ createdAt: -1 });
        
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error("API GET Error:", error);
        return NextResponse.json(
            { message: 'Failed to fetch products' }, 
            { status: 500 }
        );
    }
}


// ------------------------------------
// --- 2. POST (CREATE NEW PRODUCT) ---
// ------------------------------------
export async function POST(request) {
    const authError = authorizeAdmin(request);
    if (authError) return authError;

    try {
        await connectToDatabase(); // 💡 Connect to MongoDB
        const newProductData = await request.json();
        
        // Mongoose Code: Create a new product document
        const createdProduct = await Product.create(newProductData);

        return new NextResponse(
            JSON.stringify({ message: 'Product created successfully', product: createdProduct }),
            { status: 201 }
        );
    } catch (error) {
        console.error("API POST Error:", error.message); // Log Mongoose validation error message
        return new NextResponse(JSON.stringify({ message: 'Failed to create product', details: error.message }), { status: 400 });
    }
}


// ----------------------------------------
// --- 3. PUT (UPDATE EXISTING PRODUCT) ---
// ----------------------------------------
export async function PUT(request) {
    const authError = authorizeAdmin(request);
    if (authError) return authError;

    try {
        await connectToDatabase(); // 💡 Connect to MongoDB
        
        // Mongoose uses the MongoDB document _id as the primary identifier
        const { _id, ...updateData } = await request.json();
        
        // Ensure an ID is provided
        if (!_id) return new NextResponse(JSON.stringify({ message: 'Product ID is required for update' }), { status: 400 });

        // Mongoose Code: Find by ID and update
        // { new: true } returns the *updated* document
        // { runValidators: true } ensures Mongoose validates the updated data
        const updatedProduct = await Product.findByIdAndUpdate(
            _id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
             return new NextResponse(JSON.stringify({ message: `Product ${_id} not found` }), { status: 404 });
        }

        return new NextResponse(
            JSON.stringify({ message: `Product ${_id} updated successfully`, product: updatedProduct }),
            { status: 200 }
        );
    } catch (error) {
        console.error("API PUT Error:", error.message);
        return new NextResponse(JSON.stringify({ message: 'Failed to update product', details: error.message }), { status: 500 });
    }
}


// -------------------------------------------
// --- 4. DELETE (ARCHIVE/REMOVE PRODUCT) ---
// -------------------------------------------
export async function DELETE(request) {
    const authError = authorizeAdmin(request);
    if (authError) return authError;

    try {
        await connectToDatabase(); // 💡 Connect to MongoDB

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id'); // MongoDB ID (or any other identifier you use)
        
        if (!productId) return new NextResponse(JSON.stringify({ message: 'Product ID is required' }), { status: 400 });
        
        // Mongoose Code (Soft Delete): Update the status field instead of deleting
        const archivedProduct = await Product.findByIdAndUpdate(
            productId, 
            { status: 'Archived' },
            { new: true }
        );

        if (!archivedProduct) {
             return new NextResponse(JSON.stringify({ message: `Product ${productId} not found` }), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ message: `Product ${productId} archived.` }), { status: 200 });
    } catch (error) {
        console.error("API DELETE Error:", error);
        return new NextResponse(JSON.stringify({ message: 'Failed to archive product' }), { status: 500 });
    }
}