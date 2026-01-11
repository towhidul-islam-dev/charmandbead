// app/admin/products/edit/[id]/page.jsx

import { getProductById } from '@/lib/data';
import ProductEditForm from '@/components/ProductEditForm'; 
import Link from 'next/link';

// ✅ Make sure the function is async
export default async function EditProductPage({ params }) {
    
    // 🚨 THE FIX: Unwrapping the params Promise 🚨
    const resolvedParams = await params; 
    const id = resolvedParams.id; 

    const { product, success, error } = await getProductById(id);

    if (!success || !product) {
        return (
            <div className="p-8 mt-10 text-center">
                <h1 className="text-2xl font-bold text-red-600">Error Loading Product</h1>
                <p className="mt-2 text-gray-600">{error || `Product with ID ${id} not found.`}</p>
                <Link href="/admin/products" className="inline-block mt-4 text-blue-500 hover:underline">
                    Back to Product List
                </Link>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl p-8 mx-auto">
            <h1 className="pb-2 mb-6 text-3xl font-black border-b text-gray-900">
                Edit Product: {product.name}
            </h1>
            <ProductEditForm initialData={product} productId={product._id} />
        </div>
    );
}