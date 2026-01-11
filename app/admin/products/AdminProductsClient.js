"use client";
import { useState } from "react";
import Link from "next/link";
import Image from 'next/image';
import { Layers, Package, Search, Filter } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";

export default function AdminProductsClient({ initialProducts }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

 const filteredProducts = initialProducts.filter(product => {
  // Ensure product and product.name exist to avoid crashes
  if (!product || !product.name) return false;

  const matchesSearch = product.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
    
  const matchesCategory = 
    activeCategory === "All" || 
    product.category === activeCategory;

  return matchesSearch && matchesCategory;
});


  const categories = ["All", ...new Set(initialProducts.map(p => p.category))];

  return (
    <div className="p-4 mx-auto md:p-8 max-w-7xl">
      {/* Header & Search Bar (Keep your styled UI from the previous step) */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Product Management</h2>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
            {filteredProducts.length} items found
          </p>
        </div>
        <Link href="/admin/products/create" className="w-full px-8 py-3 text-center text-white bg-[#EA638C] font-black rounded-2xl md:w-auto uppercase text-xs tracking-widest shadow-xl shadow-[#EA638C]/20">
          + Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#EA638C]/20"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none appearance-none font-medium text-gray-600"
          onChange={(e) => setActiveCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-gray-50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            {/* ... Rest of the <thead> and <tbody> from previous response ... */}
            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredProducts.map((product) => {
                const hasVariants = product.hasVariants && product.variants?.length > 0;
                const totalStock = hasVariants 
                  ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
                  : (Number(product.stock) || 0);

                return (
                  <tr key={product._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border">
                         <Image src={product.imageUrl || "/placeholder.png"} alt="" fill className="object-cover" />
                      </div>
                      <span className="text-sm font-black text-gray-900">{product.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      {hasVariants ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-purple-50 text-purple-600">
                          <Layers size={10} /> {product.variants.length} Variants
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600">
                          <Package size={10} /> Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-sm">৳{product.price}</td>
                    <td className="px-6 py-4">
                       <span className={`text-xs font-black ${totalStock < 5 ? 'text-red-500' : 'text-gray-600'}`}>
                         {totalStock} Units
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <Link href={`/admin/products/edit/${product._id}`} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-[#EA638C]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                         </Link>
                         <DeleteButton productId={product._id} productName={product.name} />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}