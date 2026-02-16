"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, X, FolderTree, Tag, ChevronDown, Loader2 } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/actions/category";
import toast from "react-hot-toast";

export default function CategoryManager({
  categories = [],
  mode = "full",
  onClose,
}) {
  const [isAdding, setIsAdding] = useState(mode === "modal");
  const [isPending, setIsPending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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

  // 🟢 Fixed: Defined modalUI so the component doesn't crash
  const modalUI = (
    <div className={mode === "modal" ? "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E442B]/40 backdrop-blur-sm" : "mb-8 animate-in zoom-in-95 duration-200"}>
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-gray-100 relative">
        <button 
          onClick={() => mode === "modal" ? onClose() : setIsAdding(false)}
          className="absolute p-2 text-gray-400 transition-colors top-6 right-6 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-pink-50 rounded-xl text-[#EA638C]"><Tag size={18} /></div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#3E442B]">New Element</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Category Name (e.g. Resin Charms)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-[#3E442B]"
          />
          
          <div className="relative">
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-[#3E442B] appearance-none"
            >
              <option value="">Top Level (Parent)</option>
              {parentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>Sub-category of {cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2" size={16} />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-[#EA638C] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-[#EA638C]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" size={16} /> : "Inject into DNA"}
          </button>
        </form>
      </div>
    </div>
  );

  if (mode === "modal") return modalUI;

  return (
    <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBB6E6]/5 rounded-full -mr-12 -mt-12" />
      
      <div className="relative z-10 flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FBB6E6]/20 rounded-2xl text-[#EA638C]">
            <FolderTree size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">Architecture</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hierarchy Management</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#3E442B] text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#3E442B]/20"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {isAdding && modalUI}

      <div className="relative z-10 space-y-4">
        {parentCategories.length === 0 && !isAdding && (
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
                  <span className="font-black text-[#3E442B] uppercase text-[11px] tracking-wider">{parent.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(parent._id)}
                  disabled={deletingId === parent._id}
                  className="p-2 text-red-400 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl disabled:opacity-50"
                >
                  {deletingId === parent._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>

              <div className="ml-8 space-y-2 border-l-2 border-[#FBB6E6]/30 pl-4">
                {children.map((child) => (
                  <div key={child._id} className="flex items-center justify-between p-3 transition-all bg-white border border-gray-100 rounded-xl group/child hover:shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EA638C]/30" />
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{child.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(child._id)}
                      disabled={deletingId === child._id}
                      className="text-red-300 transition-all opacity-0 group-hover/child:opacity-100 hover:text-red-500"
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