import Link from 'next/link';
import ProductCreateForm from '@/components/ProductCreateForm';

/** * 🟢 HARDCODED DNA STRUCTURE 
 * This includes both Main Categories (parentId: null) 
 * and Sub-Categories (parentId: matching a main ID).
 */
const CATEGORY_DNA = [
  // MAIN CATEGORIES
  { _id: "cat_resin", name: "Resin Art", slug: "resin-art", parentId: null },
  { _id: "cat_jewelry", name: "Jewelry Making", slug: "jewelry-making", parentId: null },
  { _id: "cat_packaging", name: "Packaging", slug: "packaging", parentId: null },

  // SUB-CATEGORIES FOR RESIN ART
  { _id: "sub_epoxy", name: "Epoxy Resin", slug: "epoxy-resin", parentId: "cat_resin" },
  { _id: "sub_uv", name: "UV Resin", slug: "uv-resin", parentId: "cat_resin" },
  { _id: "sub_molds", name: "Silicone Molds", slug: "silicone-molds", parentId: "cat_resin" },

  // SUB-CATEGORIES FOR JEWELRY
  { _id: "sub_charms", name: "Charms & Pendants", slug: "charms", parentId: "cat_jewelry" },
  { _id: "sub_tools", name: "Tools & Pliers", slug: "tools", parentId: "cat_jewelry" },
  { _id: "sub_wires", name: "Beading Wires", slug: "beading-wires", parentId: "cat_jewelry" },
];

export default async function CreateProductPage() {
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
            
            <div className="max-w-5xl mx-auto">
                {/* 🟢 Implementation Check:
                   We pass CATEGORY_DNA as 'rawCategories'.
                   The form will now:
                   1. Show only parentId: null in the first dropdown.
                   2. Unlock the second dropdown only when a Category is chosen.
                   3. Show only Sub-Categories that match the parentId of the chosen Category.
                */}
                <ProductCreateForm rawCategories={CATEGORY_DNA} /> 
            </div>
        </div>
    );
}