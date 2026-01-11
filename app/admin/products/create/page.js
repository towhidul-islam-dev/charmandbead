import Link from 'next/link';
import ProductCreateForm from '@/components/ProductCreateForm';

export default function CreateProductPage() {
    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="flex items-center justify-between max-w-5xl pb-3 mx-auto mb-6 border-b">
                <h1 className="text-3xl font-light text-gray-900">Add New Product</h1>
                <Link href="/admin/products">
                    <button className="px-5 py-2 text-white transition duration-150 bg-gray-600 rounded-lg shadow hover:bg-gray-700">
                        ← Back to List
                    </button>
                </Link>
            </div>
            
            {/* Increased width to 5xl for the variant table */}
            <div className="max-w-5xl p-8 mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl">
                <ProductCreateForm categories={['Resin Charms', 'Silver Charms', 'Beads', 'Row materials', 'Other']} /> 
            </div>
        </div>
    );
}