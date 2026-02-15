import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/data';
import { getCategoryStructure } from '@/actions/category'; // 🟢 Fetch your real DB categories
import ProductCreateForm from '@/components/ProductCreateForm';
import DeleteProductBtn from '@/components/DeleteProductBtn';
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default async function EditProductPage({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Fetch product and real category structure from DB
    const { product, success } = await getProductById(id);
    const { structure, raw } = await getCategoryStructure(); 

    if (!success || !product) {
        notFound();
    }

    const serializedProduct = JSON.parse(JSON.stringify(product));

    return (
        <div className="min-h-screen py-10 bg-gray-50/50">
            {/* Header Section */}
            <div className="flex flex-col gap-4 px-4 mx-auto mb-10 max-w-7xl md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-[#FBB6E6] text-[#EA638C] text-[10px] font-black uppercase rounded-full tracking-widest">
                            Editor Mode
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-[#3E442B] uppercase italic tracking-tighter leading-none">
                        Refine Product
                    </h1>
                    <p className="mt-2 text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                        Current Treasure: <span className="text-[#EA638C]">{serializedProduct.name}</span>
                    </p>
                </div>

                <Link href="/admin/products">
                    <button className="flex items-center gap-2 px-6 py-3 text-[11px] font-black text-[#3E442B] uppercase tracking-wider transition-all bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95">
                        <ChevronLeftIcon className="w-4 h-4" /> Back to Catalog
                    </button>
                </Link>
            </div>
            
            {/* Main Form Section */}
            <div className="mx-auto max-w-7xl">
                <ProductCreateForm 
                    initialData={serializedProduct} 
                    categoryStructure={structure || {}} 
                    rawCategories={raw || []} // 🟢 Passes data to your Quick Add modal
                /> 
            </div>

            {/* Danger Zone Section */}
            <div className="max-w-7xl px-4 mx-auto mt-16">
                <div className="p-8 border-2 border-dashed border-red-100 bg-red-50/30 rounded-[3rem]">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="text-center md:text-left">
                            <h2 className="text-xl italic font-black tracking-tighter text-red-600 uppercase">
                                Destruction Zone
                            </h2>
                            <p className="max-w-md mt-2 text-xs font-bold leading-relaxed text-red-400 uppercase tracking-tight">
                                This action is irreversible. Deleting will wipe this product from your store and Cloudinary storage.
                            </p>
                        </div>
                        
                        <div className="p-4 bg-white shadow-xl rounded-3xl">
                             <DeleteProductBtn productId={id} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20" />
        </div>
    );
}