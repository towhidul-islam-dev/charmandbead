"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layers, Package, Search, EyeOff, Eye } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";
import { toggleArchiveProduct } from "@/actions/product";
import toast, { Toaster } from "react-hot-toast"; // 🟢 Added Toaster

export default function AdminProductsClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loadingId, setLoadingId] = useState(null);

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
        // 🟢 Success Toast
        toast.success(
          result.newState ? "Product Archived" : "Product Published",
          {
            duration: 3000,
            style: {
              background: "#000", // Black background for a premium look
              color: "#fff",
              borderRadius: "16px",
              padding: "12px 24px",
              fontSize: "12px",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              border: "2px solid #EA638C", // Pink border matching your brand
            },
            iconTheme: {
              primary: "#EA638C", // Pink icon
              secondary: "#fff",
            },
          }
        );
      } else {
        toast.error("Failed to update product");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
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
    <div className="p-4 mx-auto md:p-8 max-w-7xl">
      {/* 🟢 Toast Provider Container */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl italic font-black tracking-tight text-gray-900 uppercase">
            Product <span className="text-[#EA638C]">Inventory</span>
          </h2>
          <p className="mt-1 text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
            {filteredProducts.length} items found
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="px-8 py-3 text-white bg-[#EA638C] font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-[#EA638C]/20"
        >
          + Add Product
        </Link>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search
            className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#EA638C]/20 font-bold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-100 rounded-2xl"
          onChange={(e) => setActiveCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-gray-50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4 text-left">Listing</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredProducts.map((product) => {
                const totalStock = product.hasVariants
                  ? product.variants.reduce(
                      (acc, v) => acc + (Number(v.stock) || 0),
                      0
                    )
                  : Number(product.stock) || 0;

                return (
                  <tr
                    key={product._id}
                    className={`transition-all duration-300 ${
                      product.isArchived
                        ? "bg-gray-50/80 opacity-60 grayscale"
                        : "hover:bg-gray-50/30"
                    }`}
                  >
                    <td className="flex items-center gap-4 px-6 py-4">
                      <div className="relative w-12 h-12 overflow-hidden border-2 border-white shadow-sm shrink-0 rounded-xl">
                        <Image
                          src={product.imageUrl || "/placeholder.png"}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-black uppercase tracking-tight ${
                            product.isArchived
                              ? "text-gray-400 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {product.name}
                        </span>
                        {product.isArchived && (
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                            Hidden from store
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {product.hasVariants ? (
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-purple-50 text-purple-600">
                          Variants
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600">
                          Standard
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm italic font-black">
                      ৳{product.price}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-black uppercase ${totalStock < 5 ? "text-red-500" : "text-gray-400"}`}
                      >
                        {totalStock} Units
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleArchiveToggle(product._id)}
                          disabled={loadingId === String(product._id)}
                          className={`p-2 rounded-xl transition-all ${
                            product.isArchived
                              ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                              : "bg-gray-100 text-gray-400 hover:bg-black hover:text-white"
                          }`}
                        >
                          {loadingId === String(product._id) ? (
                            <div className="w-5 h-5 border-2 border-current rounded-full border-t-transparent animate-spin" />
                          ) : product.isArchived ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>

                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 text-gray-400 transition-all bg-gray-100 rounded-xl hover:bg-black hover:text-white"
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
                        <DeleteButton
                          productId={product._id}
                          productName={product.name}
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
