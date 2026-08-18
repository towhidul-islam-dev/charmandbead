"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  EyeOff,
  Eye,
  Database,
  Banknote,
  AlertTriangle,
  Clock,
  Plus,
  Loader2,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DeleteButton from "@/components/DeleteButton";
import RestockModal from "@/components/RestockModal";
import { toggleArchiveProduct } from "@/actions/product";
import toast, { Toaster } from "react-hot-toast";

export default function AdminProductsClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loadingId, setLoadingId] = useState(null);
  const [activeRestockProduct, setActiveRestockProduct] = useState(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 👈 Set how many products you want per page

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // --- Dashboard Stats Logic ---
  const stats = useMemo(() => {
    return {
      totalItems: products.length,
      totalValue: products.reduce(
        (acc, p) =>
          acc +
          Number(p.price) *
            (p.hasVariants
              ? p.variants.reduce((a, v) => a + (Number(v.stock) || 0), 0)
              : Number(p.stock) || 0),
        0
      ),
      lowStockCount: products.filter((p) => {
        const stock = p.hasVariants
          ? p.variants.reduce((a, v) => a + (Number(v.stock) || 0), 0)
          : Number(p.stock) || 0;
        return stock <= 5;
      }).length,
    };
  }, [products]);

  const handleRestockSuccess = (updatedProduct) => {
    if (updatedProduct && updatedProduct._id) {
      setProducts((prev) =>
        prev.map((p) => (String(p._id) === String(updatedProduct._id) ? updatedProduct : p))
      );
    }
  };

  const handleDeleteSuccess = (productId) => {
    setProducts((current) =>
      current.filter((p) => String(p._id) !== String(productId))
    );
  };

  const handleArchiveToggle = async (productId) => {
    setLoadingId(productId);
    try {
      const result = await toggleArchiveProduct(productId);
      if (result.success) {
        setProducts((currentList) =>
          currentList.map((p) =>
            String(p._id) === String(productId)
              ? { ...p, isArchived: result.newState }
              : p
          )
        );
        toast.success(
          result.newState ? "Product Archived" : "Product Published",
          { style: { background: "#3E442B", color: "#fff" } }
        );
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product?.name) return false;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const pCat = product.categoryName || "Uncategorized";
      const matchesCategory =
        activeCategory === "All" || pCat === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const getPageNumbers = () => {
    const pages = [];
    const range = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const categories = useMemo(() => {
    const names = products.map((p) => p.categoryName || "Uncategorized");
    const uniqueNames = Array.from(new Set(names)).filter((n) => n !== "Uncategorized");
    return ["All", ...uniqueNames.sort(), "Uncategorized"];
  }, [products]);

  return (
    <div className="p-4 mx-auto overflow-x-hidden duration-500 md:p-8 max-w-7xl animate-in fade-in">
      <Toaster position="bottom-right" />

      {activeRestockProduct && (
        <RestockModal
          product={activeRestockProduct}
          onClose={() => setActiveRestockProduct(null)}
          onSuccess={(updatedProduct) => {
            handleRestockSuccess(updatedProduct);
            setActiveRestockProduct(null);
          }}
        />
      )}

      {/* --- Header --- */}
      <div className="flex flex-col items-start justify-between gap-6 mb-8 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl md:text-3xl italic font-black tracking-tight text-[#3E442B] uppercase">
            Product <span className="text-[#EA638C]">Inventory</span>
          </h2>
          <p className="mt-1 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
            Management Dashboard
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="w-full md:w-auto text-center px-8 py-4 text-white bg-[#EA638C] font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-[#EA638C]/20 hover:scale-105 active:scale-95 transition-all"
        >
          + Add Product
        </Link>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 md:grid-cols-3">
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 text-[#3E442B] bg-[#3E442B]/10 rounded-xl">
            <Database size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Items</p>
            <p className="text-xl italic font-black text-[#3E442B]">{stats.totalItems}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 text-[#3E442B] bg-[#FBB6E6]/30 rounded-xl">
            <Banknote size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Value</p>
            <p className="text-xl italic font-black text-[#3E442B]">৳{stats.totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 sm:col-span-2 md:col-span-1">
          <div className="p-3 text-[#EA638C] bg-[#EA638C]/10 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Low Stock</p>
            <p className="text-xl italic font-black text-[#EA638C]">{stats.lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* --- Filters --- */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#EA638C]/20 font-bold shadow-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="w-full md:w-48 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-[#3E442B] bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-[#EA638C]/20"
          onChange={(e) => {
            setActiveCategory(e.target.value);
            setCurrentPage(1);
          }}
          value={activeCategory}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* --- Content Area --- */}
      {totalProducts === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 mb-4 text-gray-100" />
          <h3 className="text-lg font-black text-[#3E442B] uppercase italic">Inventory Empty</h3>
        </div>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {paginatedProducts.map((product) => {
              const totalStock = product.hasVariants
                ? product.variants?.reduce((acc, v) => acc + (Number(v.stock) || 0), 0) || 0
                : Number(product.stock) || 0;

              return (
                <div 
                  key={product._id} 
                  className={`bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden transition-all ${product.isArchived ? "opacity-60 grayscale" : ""}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-20 h-20 overflow-hidden border-2 border-white shadow-lg shrink-0 rounded-2xl">
                      <Image src={product.imageUrl || "/placeholder.png"} alt={product.name || "Product"} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex flex-col">
                      <span className="px-2 py-0.5 bg-[#3E442B]/5 text-[8px] font-black uppercase text-[#3E442B] rounded-md w-fit mb-1">
                        {product.categoryName || "Uncategorized"}
                      </span>
                      <h4 className="text-sm font-black text-[#3E442B] uppercase italic truncate leading-tight">
                        {product.name}
                      </h4>
                      <span className="text-[10px] font-black text-[#EA638C] mt-1">৳{product.price}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div 
                      onClick={() => setActiveRestockProduct(product)}
                      className="flex flex-col items-center justify-center p-4 transition-transform border border-gray-100 cursor-pointer bg-gray-50 rounded-2xl active:scale-95 group"
                    >
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Level</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${totalStock <= 5 ? "text-[#EA638C]" : "text-[#3E442B]"}`}>
                          {totalStock} Units
                        </span>
                        <Plus size={12} className="text-[#EA638C] group-hover:scale-125 transition-transform" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 border border-gray-100 bg-gray-50 rounded-2xl">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Product ID</span>
                      <span className="text-[10px] font-black text-gray-500 uppercase">#{String(product._id).slice(-6)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleArchiveToggle(product._id)}
                        className={`p-3 rounded-xl transition-all ${product.isArchived ? "bg-[#3E442B] text-white" : "bg-gray-100 text-gray-400 hover:text-[#EA638C]"}`}
                      >
                        {loadingId === String(product._id) ? <Loader2 size={18} className="animate-spin" /> : product.isArchived ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <Link href={`/admin/products/edit/${product._id}`} className="p-3 text-gray-400 bg-gray-100 rounded-xl hover:text-[#3E442B]">
                        <Package size={18} />
                      </Link>
                    </div>
                    <DeleteButton productId={product._id} productName={product.name} onDelete={() => handleDeleteSuccess(product._id)} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-gray-50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50/50">
                  <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-5 text-left">Listing Details</th>
                    <th className="px-6 py-5 text-left">Category & Type</th>
                    <th className="px-6 py-5 text-left text-[#EA638C]">Stock Level</th>
                    <th className="px-6 py-5 text-left">Pricing</th>
                    <th className="px-6 py-5 text-left">Last Updated</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {paginatedProducts.map((product) => {
                    const totalStock = product.hasVariants
                      ? product.variants?.reduce((acc, v) => acc + (Number(v.stock) || 0), 0) || 0
                      : Number(product.stock) || 0;

                    return (
                      <tr key={product._id} className={`transition-all duration-300 ${product.isArchived ? "bg-gray-50/80 opacity-60 grayscale" : "hover:bg-[#FBB6E6]/10"}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 overflow-hidden border-2 border-white shadow-md shrink-0 rounded-xl">
                              <Image src={product.imageUrl || "/placeholder.png"} alt={product.name || "Product"} fill className="object-cover" unoptimized />
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm font-black uppercase tracking-tight ${product.isArchived ? "text-gray-400 line-through" : "text-[#3E442B]"}`}>{product.name}</span>
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">ID: {String(product._id).slice(-6)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-[#3E442B]/5 text-[#3E442B] w-fit">
                              {product.categoryName || "Uncategorized"}
                            </span>
                            {product.subCategoryName && (
                              <span className="text-[8px] font-bold text-[#EA638C] mt-1 px-1 italic">
                                {product.subCategoryName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div onClick={() => setActiveRestockProduct(product)} className="flex flex-col gap-1.5 cursor-pointer group w-fit">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-black uppercase ${totalStock <= 5 ? "text-[#EA638C]" : "text-[#3E442B]"}`}>{totalStock} Units</span>
                              <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-[#EA638C] group-hover:text-white transition-all"><Plus size={10} /></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm italic font-black text-[#3E442B]">৳{product.price}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock size={12} /><span className="text-[10px] font-bold uppercase tracking-tighter">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString("en-GB") : "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleArchiveToggle(product._id)} disabled={loadingId === String(product._id)} className={`p-2 rounded-xl transition-all ${product.isArchived ? "bg-[#3E442B] text-white shadow-lg shadow-[#3E442B]/20" : "bg-gray-100 text-gray-400 hover:bg-[#EA638C] hover:text-white"}`}>
                              {loadingId === String(product._id) ? <Loader2 size={18} className="animate-spin" /> : product.isArchived ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <Link href={`/admin/products/edit/${product._id}`} className="p-2 text-gray-400 transition-all bg-gray-100 rounded-xl hover:bg-[#3E442B] hover:text-white">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </Link>
                            <DeleteButton productId={product._id} productName={product.name} onDelete={() => handleDeleteSuccess(product._id)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-6 mt-16">
              <div className="flex items-center gap-2 p-1.5 bg-white shadow-xl rounded-full border border-gray-50">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-gray-50 text-[#3E442B] hover:text-[#EA638C]'}`}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((p, i) => (
                    p === "..." ? (
                      <span key={`dots-${i}`} className="px-2 text-xs font-bold text-gray-300">...</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-11 h-11 flex flex-col items-center justify-center rounded-full text-[10px] font-black transition-all ${
                          currentPage === p ? 'bg-[#3E442B] text-white shadow-lg' : 'text-gray-400 hover:text-[#EA638C]'
                        }`}
                      >
                        {currentPage === p && <span className="text-[5px] uppercase tracking-tighter opacity-60 leading-none">Pg</span>}
                        {p}
                      </button>
                    )
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-[#3E442B] text-white hover:bg-[#EA638C] shadow-lg'}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">
                Inventory Registry <span className="mx-2 opacity-30">•</span> {totalProducts} Records
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}