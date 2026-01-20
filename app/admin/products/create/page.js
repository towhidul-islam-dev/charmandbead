import Link from 'next/link';
import ProductCreateForm from '@/components/ProductCreateForm';

export default function CreateProductPage() {
    // 1. Define the hierarchy
    const categoryStructure = {
        'Beads': ['Crystal Beads', 'Glass Beads', 'Wooden Beads', 'Acrylic Beads'],
        'Resin Charms': ['Animal Shapes', 'Floral', 'Glitter Series'],
        'Silver Charms': ['925 Sterling', 'Silver Plated'],
        'Row materials': ['Wires', 'Hooks', 'Clasps'],
        'Other': ['Packaging', 'Tools']
    };

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
            
            <div className="max-w-5xl p-8 mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl">
                {/* 2. Pass the new structure */}
                <ProductCreateForm categoryStructure={categoryStructure} /> 
            </div>
        </div>
    );
}