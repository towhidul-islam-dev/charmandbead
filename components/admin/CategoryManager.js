"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, ChevronRight, Image as ImageIcon, X } from "lucide-react";
import { saveCategoryAction } from "@/actions/category"; 
import toast, { Toaster } from "react-hot-toast";

export default function CategoryManager({ categories }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  // Filter top-level categories for the main list and the dropdown
  const parentCategories = categories.filter(c => !c.parentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("parentId", parentId);

    const result = await saveCategoryAction(formData);

    if (result.success) {
      toast.success("Category added successfully!");
      setIsAdding(false);
      setName("");
      setParentId("");
    } else {
      toast.error(result.message || "Something went wrong");
    }
    setIsPending(false);
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm relative">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">Category Architecture</h2>
          <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-widest">Manage store hierarchy</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#3E442B] text-white px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-[#3E442B]/90 transition-all active:scale-95 shadow-lg shadow-[#3E442B]/20"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* ADD CATEGORY MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#3E442B]/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-[#3E442B] uppercase italic text-xl leading-none">New Category</h3>
                <p className="text-[9px] font-bold text-[#EA638C] uppercase tracking-widest mt-1">Expanding your catalog</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Category Name</label>
                <input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Resin Charms"
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-[#3E442B] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Parent Category</label>
                <div className="relative">
                  <select 
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C]/20 font-bold text-[#3E442B] appearance-none cursor-pointer transition-all"
                  >
                    <option value="">None (Top-Level)</option>
                    {parentCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
                </div>
                <p className="text-[8px] text-gray-400 italic ml-2">Select a parent to make this a sub-category.</p>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full py-4 bg-[#EA638C] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending ? "Syncing..." : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY LIST */}
      <div className="space-y-4">
        {parentCategories.map((parent) => (
          <div key={parent._id} className="group">
            {/* PARENT ROW */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent group-hover:border-[#FBB6E6] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#3E442B]">
                  {parent.image ? <img src={parent.image} className="w-full h-full object-cover rounded-xl" /> : <ImageIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-[#3E442B] uppercase text-sm">{parent.name}</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    {categories.filter(c => c.parentId === parent._id).length} Sub-categories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-[#3E442B] transition-colors"><Edit2 size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-[#EA638C] transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>

            {/* SUB-CATEGORIES (Indented) */}
            <div className="ml-12 mt-2 space-y-2 border-l-2 border-[#FBB6E6]/30 pl-4">
              {categories
                .filter(sub => sub.parentId === parent._id)
                .map(sub => (
                  <div key={sub._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-50 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <ChevronRight size={14} className="text-[#EA638C]" />
                      <span className="font-bold text-[#3E442B] text-xs">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-300 hover:text-[#3E442B] transition-colors"><Edit2 size={14} /></button>
                      <button className="text-gray-300 hover:text-[#EA638C] transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}