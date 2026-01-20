import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/data';
import ProductCreateForm from '@/components/ProductCreateForm';
import DeleteProductBtn from '@/components/DeleteProductBtn'; // 👈 Import the new button

export default async function EditProductPage({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const { product, success } = await getProductById(id);

    if (!success || !product) {
        notFound();
    }

    const serializedProduct = JSON.parse(JSON.stringify(product));

    const categoryStructure = {
        'Beads': ['Crystal Beads', 'Glass Beads', 'Wooden Beads', 'Acrylic Beads'],
        'Resin Charms': ['Animal Shapes', 'Floral', 'Glitter Series'],
        'Silver Charms': ['925 Sterling', 'Silver Plated'],
        'Row materials': ['Wires', 'Hooks', 'Clasps'],
        'Other': ['Packaging', 'Tools']
    };

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            {/* Header Section */}
            <div className="flex items-center justify-between max-w-5xl pb-3 mx-auto mb-6 border-b">
                <div>
                    <h1 className="text-3xl font-light text-gray-900">Edit Product</h1>
                    <p className="mt-1 text-sm font-medium tracking-widest text-gray-500 uppercase">
                        Editing: <span className="font-bold text-blue-600">{serializedProduct.name}</span>
                    </p>
                </div>
                <Link href="/admin/products">
                    <button className="px-5 py-2 text-white transition duration-150 bg-gray-600 rounded-lg shadow hover:bg-gray-700">
                        ← Back to List
                    </button>
                </Link>
            </div>
            
            {/* Main Form Section */}
            <div className="max-w-5xl p-8 mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl">
                <ProductCreateForm 
                    initialData={serializedProduct} 
                    categoryStructure={categoryStructure} 
                /> 
            </div>

            {/* Danger Zone Section */}
            <div className="max-w-5xl p-8 mx-auto mt-10 border border-red-100 bg-red-50 rounded-2xl">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div>
                        <h2 className="text-lg italic font-black tracking-tight text-red-800 uppercase">Danger Zone</h2>
                        <p className="max-w-md text-sm font-medium text-red-600/80">
                            Deleting this product will permanently remove all data and images from Cloudinary. This action cannot be undone.
                        </p>
                    </div>
                    
                    {/* 👈 The new interactive button component */}
                    <DeleteProductBtn productId={id} />
                </div>
            </div>

            <div className="py-12" />
        </div>
    );
}