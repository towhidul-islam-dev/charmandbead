import Link from 'next/link';
import ProductCreateForm from '@/components/ProductCreateForm';
// 🟢 Import the central DNA source
import { CATEGORY_DNA } from '@/lib/categoryDNA'; 

export default async function CreateProductPage() {
    return (
        <div className="min-h-screen p-6 bg-[#FBB6E6]/10"> {/* Tinted with your brand lightPink */}
            <div className="flex items-center justify-between max-w-5xl pb-5 mx-auto mb-8 border-b border-[#3E442B]/10">
                <div>
                  <h1 className="text-3xl font-black text-[#3E442B] uppercase italic tracking-tighter">
                    Add New Product
                  </h1>
                  <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-[0.2em] mt-1">
                    Inventory Management
                  </p>
                </div>
                
                <Link href="/admin/products">
                    <button className="px-6 py-2.5 text-white text-xs font-black uppercase tracking-widest transition-all bg-[#3E442B] rounded-xl shadow-lg shadow-[#3E442B]/20 hover:bg-[#3E442B]/90 active:scale-95">
                        ← Back to List
                    </button>
                </Link>
            </div>
            
            <div className="max-w-5xl mx-auto">
                {/* 🟢 Now using the imported DNA */}
                <ProductCreateForm rawCategories={CATEGORY_DNA} /> 
            </div>
        </div>
    );
}