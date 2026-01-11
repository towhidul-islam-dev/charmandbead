// actions/delete.js
"use server";

import { revalidatePath } from 'next/cache';
import mongodb from '@/lib/mongodb';
import Product from '@/models/Product';
// 🚨 Ensure these functions are imported from your Cloudinary utility file 🚨
// import { deleteImage } from '@/lib/cloudinary'; 

// Helper function to extract the public ID from the Cloudinary URL
const extractPublicId = (imageUrl) => {
    // This logic must match how your images are stored (e.g., inside 'ecom-products' folder)
    const parts = imageUrl.split('/ecom-products/');
    if (parts.length > 1) {
        return `ecom-products/${parts[1].split('.')[0]}`;
    }
    return null;
};


export async function deleteProduct(id) {
    try {
        await mongodb();

        // 1. Find the product to get image URL before deleting the record
        const product = await Product.findById(id).select('name imageUrl');

        if (!product) {
            return { success: false, message: 'Product not found.' };
        }
        
        // 2. Delete the record from the database
        await Product.findByIdAndDelete(id);

        // 3. Delete the associated image from Cloudinary (Recommended)
        if (product.imageUrl) {
            const publicId = extractPublicId(product.imageUrl);
            if (publicId) {
                // 🚨 Use your actual deleteImage function 🚨
                // await deleteImage(publicId); 
                console.log(`[Cloudinary] Deleted DB record. Placeholder: Deleting image: ${publicId}`);
            }
        }

        // 4. Revalidate the product list page cache
        revalidatePath('/admin/products');

        return { success: true, message: `Product ${product.name} deleted successfully.` };
        
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, message: 'Failed to delete product.' };
    }
}