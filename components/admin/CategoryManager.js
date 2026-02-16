"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, X, FolderTree, Tag, ChevronDown, Loader2 } from "lucide-react"; // Added Loader2
import { saveCategoryAction, deleteCategoryAction } from "@/actions/category";
import toast from "react-hot-toast";

export default function CategoryManager({
  categories = [],
  mode = "full",
  onClose,
}) {
  const [isAdding, setIsAdding] = useState(mode === "modal");
  const [isPending, setIsPending] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which ID is deleting
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  const parentCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(
      (c) => !c.parentId || c.parentId === "null" || c.parentId === ""
    );
  }, [categories]);

  const getChildren = (pid) => {
    return categories.filter((c) => String(c.parentId) === String(pid));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!name.trim()) return toast.error("Category name is required");

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("parentId", parentId || "");

      const result = await saveCategoryAction(formData);

      if (result?.success) {
        toast.success("Architecture updated! ✨");
        setName("");
        setParentId("");

        if (mode === "modal") {
          onClose(result.data);
        } else {
          setIsAdding(false);
        }
      } else {
        toast.error(result.error || "Failed to save category.");
      }
    } catch (error) {
      toast.error("Connection lost. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This check protects your product hierarchy.")) return;
    
    setDeletingId(id);
    try {
        const res = await deleteCategoryAction(id);
        if (res.success) toast.success("Removed from DNA!");
        else toast.error(res.message);
    } finally {
        setDeletingId(null);
    }
  };

  // ... (Keep your modalUI variable exactly as it is, it looks perfect) ...

  if (mode === "modal") return modalUI;

  return (
    <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBB6E6]/5 rounded-full -mr-12 -mt-12" />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FBB6E6]/20 rounded-2xl text-[#EA638C]">
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
          className="bg-[#3E442B] text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#3E442B]/20"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && modalUI}

      {/* CATEGORY LIST VIEW */}
      <div className="space-y-4 relative z-10">
        {parentCategories.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-gray-50 rounded-[2rem]">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No architecture defined yet.</p>
            </div>
        )}

        {parentCategories.map((parent) => {
          const children = getChildren(parent._id);
          return (
            <div key={parent._id} className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#FBB6E6] hover:bg-white group transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Tag size={14} className="text-[#EA638C]" />
                  <span className="font-black text-[#3E442B] uppercase text-[11px] tracking-wider">
                    {parent.name}
                  </span>
                  <span className="text-[9px] font-bold text-gray-300 bg-white px-2 py-0.5 rounded-full border border-gray-100 uppercase">
                    ID: {parent.slug}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(parent._id)}
                  disabled={deletingId === parent._id}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                >
                  {deletingId === parent._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>

              {/* Nested Children with Brand Themed Line */}
              <div className="ml-8 space-y-2 border-l-2 border-[#FBB6E6]/30 pl-4">
                {children.map((child) => (
                  <div
                    key={child._id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl group/child hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EA638C]/30" />
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                        {child.name}
                        </span>
                    </div>
                    <button
                      onClick={() => handleDelete(child._id)}
                      disabled={deletingId === child._id}
                      className="opacity-0 group-child-hover:opacity-100 text-red-300 hover:text-red-500 transition-all"
                    >
                      {deletingId === child._id ? <Loader2 size={12} className="animate-spin" /> : <X size={14} />}
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