import Link from 'next/link';
import ProductCreateForm from '@/components/ProductCreateForm';

/** * 🟢 FIXED DNA STRUCTURE 
 * Replaced "cat_resin" with 24-character Hex IDs to satisfy MongoDB ObjectId requirements.
 */
const CATEGORY_DNA = [
  // MAIN CATEGORIES (Note: 24-character hex strings)
  { _id: "65cd1234567890abcdef0001", name: "Resin Art", slug: "resin-art", parentId: null },
  { _id: "65cd1234567890abcdef0002", name: "Jewelry Making", slug: "jewelry-making", parentId: null },
  { _id: "65cd1234567890abcdef0003", name: "Packaging", slug: "packaging", parentId: null },

  // SUB-CATEGORIES FOR RESIN ART (Matching parentId to 0001)
  { _id: "65cd1234567890abcdef0004", name: "Epoxy Resin", slug: "epoxy-resin", parentId: "65cd1234567890abcdef0001" },
  { _id: "65cd1234567890abcdef0005", name: "UV Resin", slug: "uv-resin", parentId: "65cd1234567890abcdef0001" },
  { _id: "65cd1234567890abcdef0006", name: "Silicone Molds", slug: "silicone-molds", parentId: "65cd1234567890abcdef0001" },

  // SUB-CATEGORIES FOR JEWELRY (Matching parentId to 0002)
  { _id: "65cd1234567890abcdef0007", name: "Charms & Pendants", slug: "charms", parentId: "65cd1234567890abcdef0002" },
  { _id: "65cd1234567890abcdef0008", name: "Tools & Pliers", slug: "tools", parentId: "65cd1234567890abcdef0002" },
  { _id: "65cd1234567890abcdef0009", name: "Beading Wires", slug: "beading-wires", parentId: "65cd1234567890abcdef0002" },
];

export default async function CreateProductPage() {
    return (
        <div className="min-h-screen p-6 bg-[#FBB6E6]/10"> {/* Tinted with your brand lightPink */}
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
                <ProductCreateForm rawCategories={CATEGORY_DNA} /> 
            </div>
        </div>
    );
}