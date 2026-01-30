"use client";
import { useState, useMemo } from "react";
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

  // --- Dashboard Stats Logic ---
  const stats = useMemo(() => {
    return {
      totalItems: products.length,
      totalValue: products.reduce(
        (acc, p) =>
          acc +
          Number(p.price) *
            (p.hasVariants
              ? p.variants.reduce((a, v) => a + Number(v.stock), 0)
              : Number(p.stock)),
        0,
      ),
      lowStockCount: products.filter((p) => {
        const stock = p.hasVariants
          ? p.variants.reduce((a, v) => a + Number(v.stock), 0)
          : Number(p.stock);
        return stock <= 5;
      }).length,
    };
  }, [products]);

  // --- 🟢 NEW: Delete Success Handler ---
  // This updates the UI state immediately when a product is deleted
  const handleDeleteSuccess = (productId) => {
    setProducts((current) =>
      current.filter((p) => String(p._id) !== String(productId)),
    );
    // toast is handled inside the DeleteButton, but can be added here too if preferred
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
              : p,
          ),
        );
        toast.success(
          result.newState ? "Product Archived" : "Product Published",
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
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((p) => p.category))];
  }, [products]);

  return (
    <div className="p-4 mx-auto md:p-8 max-w-7xl animate-in fade-in duration-500">
      <Toaster position="bottom-right" />

      {/* --- Restock Modal --- */}
      {activeRestockProduct && (
        <RestockModal
          product={activeRestockProduct}
          onClose={() => setActiveRestockProduct(null)}
          onRefresh={() => window.location.reload()}
        />
      )}

      {/* --- Header --- */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl italic font-black tracking-tight text-[#3E442B] uppercase">
            Product <span className="text-[#EA638C]">Inventory</span>
          </h2>
          <p className="mt-1 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
            Management Dashboard
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="px-8 py-3 text-white bg-[#EA638C] font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-[#EA638C]/20 hover:scale-105 transition-all"
        >
          + Add Product
        </Link>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 text-blue-600 bg-blue-50 rounded-2xl">
            <Database size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              Total Items
            </p>
            <p className="text-2xl italic font-black text-[#3E442B]">
              {stats.totalItems}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 text-green-600 bg-green-50 rounded-2xl">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              Inv. Value
            </p>
            <p className="text-2xl italic font-black text-[#3E442B]">
              ৳{stats.totalValue.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              Low Stock
            </p>
            <p className="text-2xl italic font-black text-amber-600">
              {stats.lowStockCount}
            </p>
          </div>
        </div>
      </div>

      {/* --- Filters --- */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search
            className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#EA638C]/20 font-bold shadow-sm outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer outline-none"
          onChange={(e) => setActiveCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* --- Table --- */}
      <div className="overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-gray-50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-6 py-5 text-left">Listing Details</th>
                <th className="px-6 py-5 text-left">Category</th>
                <th className="px-6 py-5 text-left text-[#EA638C]">
                  Stock Level
                </th>
                <th className="px-6 py-5 text-left">Pricing</th>
                <th className="px-6 py-5 text-left">Last Updated</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredProducts.map((product) => {
                const totalStock = product.hasVariants
                  ? product.variants.reduce(
                      (acc, v) => acc + (Number(v.stock) || 0),
                      0,
                    )
                  : Number(product.stock) || 0;

                return (
                  <tr
                    key={product._id}
                    className={`transition-all duration-300 ${product.isArchived ? "bg-gray-50/80 opacity-60 grayscale" : "hover:bg-[#FBB6E6]/5"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 overflow-hidden border-2 border-white shadow-md shrink-0 rounded-xl">
                          <Image
                            src={product.imageUrl || "/placeholder.png"}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-black uppercase tracking-tight ${product.isArchived ? "text-gray-400 line-through" : "text-[#3E442B]"}`}
                          >
                            {product.name}
                          </span>
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                            ID: {String(product._id).slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-gray-100 text-gray-600">
                        {product.category}
                      </span>
                    </td>

                    {/* Replace the Stock Level <td> in your mapping */}
                    <td className="px-6 py-4">
                      <div
                        onClick={() => setActiveRestockProduct(product)}
                        className="flex flex-col gap-1.5 cursor-pointer group w-fit"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase ${totalStock <= 5 ? "text-[#EA638C]" : "text-[#3E442B]"}`}
                          >
                            {totalStock} Units
                          </span>
                          <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-[#EA638C] group-hover:text-white transition-all">
                            <Plus size={10} />
                          </div>
                        </div>

                        {/* Variant Indicators */}
                        {product.hasVariants && (
                          <div className="flex flex-wrap gap-1 max-w-[80px]">
                            {product.variants.map((v, i) => (
                              <div
                                key={i}
                                title={`${v.color}: ${v.stock}`}
                                className={`w-1.5 h-1.5 rounded-full border-[0.5px] border-white ${
                                  v.stock === 0
                                    ? "bg-gray-300"
                                    : v.stock <= 5
                                      ? "bg-[#EA638C]"
                                      : "bg-[#3E442B]"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm italic font-black text-[#3E442B]">
                      ৳{product.price}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {product.updatedAt
                            ? new Date(product.updatedAt).toLocaleDateString(
                                "en-GB",
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleArchiveToggle(product._id)}
                          disabled={loadingId === String(product._id)}
                          className={`p-2 rounded-xl transition-all ${product.isArchived ? "bg-yellow-400 text-black shadow-lg shadow-yellow-100" : "bg-gray-100 text-gray-400 hover:bg-[#3E442B] hover:text-white"}`}
                        >
                          {loadingId === String(product._id) ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : product.isArchived ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>

                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 text-gray-400 transition-all bg-gray-100 rounded-xl hover:bg-[#3E442B] hover:text-white"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>

                        {/* 🟢 Updated DeleteButton with onDelete prop */}
                        <DeleteButton
                          productId={product._id}
                          productName={product.name}
                          onDelete={() => handleDeleteSuccess(product._id)}
                        />
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
