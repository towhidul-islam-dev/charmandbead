import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; 
import Product from '@/models/Product'; 
import { authorizeAdmin } from "@/lib/auth"; // ✅ Using the centralized auth helper

// ------------------------------------
// --- 1. GET (READ ALL PRODUCTS) ---
// ------------------------------------
export async function GET(request) {
    // 🛡️ Use the imported helper directly
    const authError = authorizeAdmin(request);
    if (authError) return authError; 

    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const isNewArrivalParam = searchParams.get("newArrival");

        // 💡 Filter logic for New Arrivals vs All Products
        let filter = {};
        if (isNewArrivalParam === "true") {
            filter = { isNewArrival: true };
        }

        // Sorting by newest first to highlight New Arrivals
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
        await connectToDatabase(); 
        const newProductData = await request.json();
        
        // This will include your New Arrival and MOQ fields from the form
        const createdProduct = await Product.create(newProductData);

        return NextResponse.json(
            { message: 'Product created successfully', product: createdProduct },
            { status: 201 }
        );
    } catch (error) {
        console.error("API POST Error:", error.message);
        return NextResponse.json(
            { message: 'Failed to create product', details: error.message }, 
            { status: 400 }
        );
    }
}

// ----------------------------------------
// --- 3. PUT (UPDATE EXISTING PRODUCT) ---
// ----------------------------------------
export async function PUT(request) {
    const authError = authorizeAdmin(request);
    if (authError) return authError;

    try {
        await connectToDatabase(); 
        
        const { _id, ...updateData } = await request.json();
        
        if (!_id) return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });

        const updatedProduct = await Product.findByIdAndUpdate(
            _id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
             return NextResponse.json({ message: `Product ${_id} not found` }, { status: 404 });
        }

        return NextResponse.json(
            { message: `Product updated successfully`, product: updatedProduct },
            { status: 200 }
        );
    } catch (error) {
        console.error("API PUT Error:", error.message);
        return NextResponse.json({ message: 'Failed to update', details: error.message }, { status: 500 });
    }
}

// -------------------------------------------
// --- 4. DELETE (ARCHIVE/REMOVE PRODUCT) ---
// -------------------------------------------
export async function DELETE(request) {
    const authError = authorizeAdmin(request);
    if (authError) return authError;

    try {
        await connectToDatabase(); 

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('id'); 
        
        if (!productId) return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        
        // Soft delete: Change status to 'Archived' instead of removing from DB
        const archivedProduct = await Product.findByIdAndUpdate(
            productId, 
            { status: 'Archived' },
            { new: true }
        );

        if (!archivedProduct) {
             return NextResponse.json({ message: `Product not found` }, { status: 404 });
        }

        return NextResponse.json({ message: `Product archived.` }, { status: 200 });
    } catch (error) {
        console.error("API DELETE Error:", error);
        return NextResponse.json({ message: 'Failed to archive' }, { status: 500 });
    }
}