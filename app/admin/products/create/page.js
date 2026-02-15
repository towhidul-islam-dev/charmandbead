import Link from 'next/link';
import ProductCreateForm from '@/components/ProductCreateForm';
import { getDynamicCategoryStructure } from '@/actions/category';

export default async function CreateProductPage() {
    // 1. Fetch the structure dynamically from MongoDB
    const categoryStructure = await getDynamicCategoryStructure();

    return (
        <div className="min-h-screen p-6 bg-[#FBB6E6]/5">
            <div className="flex items-center justify-between max-w-5xl pb-5 mx-auto mb-8 border-b border-[#3E442B]/10">
                <div>
                  <h1 className="text-3xl font-black text-[#3E442B] uppercase italic tracking-tighter">Add New Product</h1>
                  <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-[0.2em] mt-1">Inventory Management</p>
                </div>
                
                <Link href="/admin/products">
                    <button className="px-6 py-2.5 text-white text-xs font-black uppercase tracking-widest transition-all bg-[#3E442B] rounded-xl shadow-lg shadow-[#3E442B]/20 hover:bg-[#3E442B]/90 active:scale-95">
                        ← Back to List
                    </button>
                </Link>
            </div>
            
            <div className="max-w-5xl p-8 mx-auto bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem]">
                {/* 2. Pass the dynamic structure */}
                <ProductCreateForm categoryStructure={categoryStructure} /> 
            </div>
        </div>
    );
}