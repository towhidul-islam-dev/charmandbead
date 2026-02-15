"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, X, FolderTree, Tag, ChevronDown } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/actions/category";
import toast from "react-hot-toast"; // Toaster removed from here to fix double toast

export default function CategoryManager({
  categories = [],
  mode = "full",
  onClose,
}) {
  const [isAdding, setIsAdding] = useState(mode === "modal");
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

const parentCategories = useMemo(() => {
  if (!Array.isArray(categories)) return [];
  // Ensure we check for both null and undefined
  return categories.filter((c) => c.parentId === null || c.parentId === undefined);
}, [categories]);

const getChildren = (pid) => {
  // Convert IDs to strings to ensure the comparison (===) works
  return categories.filter((c) => String(c.parentId) === String(pid));
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the parent product form from triggering

    if (!name.trim()) return toast.error("Category name is required");

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("parentId", parentId || "");

      const result = await saveCategoryAction(formData);

      if (result?.success) {
        toast.success("Category added!");
        setName("");
        setParentId("");

        // Pass the result data back so the form can auto-select it
        if (mode === "modal") {
          onClose(result.data);
        } else {
          setIsAdding(false);
        }
      }
    } catch (error) {
      toast.error("Connection lost. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This check protects your hierarchy.")) return;
    const res = await deleteCategoryAction(id);
    if (res.success) toast.success("Removed!");
    else toast.error(res.message);
  };

  const modalUI = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3E442B]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 z-[10000]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-black text-[#3E442B] uppercase italic text-xl">
              Quick Add
            </h3>
            <p className="text-[9px] font-bold text-[#EA638C] uppercase tracking-widest">
              Expansion Mode
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
              Category Name
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Resin Charms"
              className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-[#3E442B]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
              Parent (Optional)
            </label>
            <div className="relative">
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-[#3E442B] outline-none appearance-none cursor-pointer"
              >
                <option value="">None (Top-Level)</option>
                {parentCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-[#EA638C] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:bg-gray-300"
          >
            {isPending ? "Syncing..." : "Confirm Addition"}
          </button>
        </form>
      </div>
    </div>
  );

  if (mode === "modal") return modalUI;

  return (
    <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-50 rounded-2xl text-[#EA638C]">
            <FolderTree size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">
              Architecture
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Hierarchy Management
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#3E442B] text-white p-3 rounded-2xl hover:scale-105 transition-all shadow-xl"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && modalUI}

      {/* CATEGORY LIST VIEW */}
      <div className="space-y-3">
        {parentCategories.map((parent) => {
          const children = getChildren(parent._id);
          return (
            <div key={parent._id} className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#FBB6E6] group transition-all">
                <div className="flex items-center gap-3">
                  <Tag size={14} className="text-[#EA638C]" />
                  <span className="font-black text-[#3E442B] uppercase text-xs">
                    {parent.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(parent._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Nested Children */}
              <div className="ml-8 space-y-2 border-l-2 border-pink-100 pl-4">
                {children.map((child) => (
                  <div
                    key={child._id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl group/child"
                  >
                    <span className="text-[11px] font-bold text-gray-500">
                      {child.name}
                    </span>
                    <button
                      onClick={() => handleDelete(child._id)}
                      className="opacity-0 group-child-hover:opacity-100 text-red-300 hover:text-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
