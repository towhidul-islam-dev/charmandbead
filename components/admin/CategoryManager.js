"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, ChevronRight, X, FolderTree, Tag } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/actions/category"; 
import toast, { Toaster } from "react-hot-toast";

export default function CategoryManager({ categories = [], mode = "full", onClose }) {
  const [isAdding, setIsAdding] = useState(mode === "modal");
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  // 1. Filter for Top-Level Categories
  const parentCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(c => !c.parentId);
  }, [categories]);

  // 2. Helper to find children for the list view
  const getChildren = (pid) => categories.filter(c => c.parentId === pid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("parentId", parentId || ""); 

    const result = await saveCategoryAction(formData);
    if (result.success) {
      toast.success("Category added!");
      setName("");
      setParentId("");
      if (mode === "modal") onClose();
      else setIsAdding(false);
    } else {
      toast.error(result.message);
    }
    setIsPending(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This check protects your hierarchy.")) return;
    const res = await deleteCategoryAction(id);
    if (res.success) toast.success("Removed!");
    else toast.error(res.message);
  };

  const modalUI = (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#3E442B]/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-black text-[#3E442B] uppercase italic text-xl">Quick Add</h3>
            <p className="text-[9px] font-bold text-[#EA638C] uppercase tracking-widest">Expansion Mode</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Category Name"
            className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold"
          />
          <select 
            value={parentId} onChange={(e) => setParentId(e.target.value)}
            className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold text-[#3E442B] outline-none"
          >
            <option value="">None (Top-Level)</option>
            {parentCategories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <button 
            type="submit" disabled={isPending}
            className="w-full py-4 bg-[#EA638C] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:opacity-90 active:scale-95 transition-all"
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
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-50 rounded-2xl text-[#EA638C]"><FolderTree size={24}/></div>
          <div>
            <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">Architecture</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hierarchy Management</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-[#3E442B] text-white p-3 rounded-2xl hover:scale-105 transition-all shadow-xl"><Plus size={20}/></button>
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
                  <span className="font-black text-[#3E442B] uppercase text-xs">{parent.name}</span>
                </div>
                <button onClick={() => handleDelete(parent._id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={14}/></button>
              </div>
              
              {/* Nested Children */}
              <div className="ml-8 space-y-2 border-l-2 border-pink-100 pl-4">
                {children.map(child => (
                  <div key={child._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl group/child">
                    <span className="text-[11px] font-bold text-gray-500">{child.name}</span>
                    <button onClick={() => handleDelete(child._id)} className="opacity-0 group-child-hover:opacity-100 text-red-300 hover:text-red-500 transition-all"><X size={14}/></button>
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