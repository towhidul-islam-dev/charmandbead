"use client";
import { useState, useMemo } from "react";
import { Plus, Trash2, X, FolderTree, Tag, ChevronDown, Star, Box } from "lucide-react";
import toast from "react-hot-toast";
import { CATEGORY_DNA } from "@/lib/categoryData";

export default function CategoryManager({ mode = "full", onClose }) {
  // Use local state initialized with hardcoded data
  const [localCategories, setLocalCategories] = useState(CATEGORY_DNA);
  const [isAdding, setIsAdding] = useState(mode === "modal");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [moq, setMoq] = useState(1);

  // Logic to separate Parents and Children
  const parentCategories = useMemo(() => 
    localCategories.filter(c => !c.parentId || c.parentId === "null"), 
  [localCategories]);

  const getChildren = (pid) => 
    localCategories.filter(c => c.parentId === pid);

  const handleAddCategory = () => {
    if (!name.trim()) return toast.error("Name is required");

    const newEntry = {
      _id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      slug: name.toLowerCase().replace(/ /g, '-'),
      parentId: parentId || null,
      isNewArrival,
      moq,
    };

    setLocalCategories([...localCategories, newEntry]);
    toast.success(`${name} added to DNA! ✨`);
    
    // Reset form
    setName("");
    setIsNewArrival(false);
    setMoq(1);
    
    if (mode === "modal") onClose?.(newEntry);
    else setIsAdding(false);
  };

  const modalUI = (
    <div className={mode === "modal" ? "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3E442B]/60 backdrop-blur-md" : "mb-8 animate-in zoom-in-95"}>
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative border border-[#FBB6E6]/20">
        <button onClick={() => mode === "modal" ? onClose?.() : setIsAdding(false)} className="absolute top-6 right-6 text-gray-400 hover:text-[#EA638C]">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#FBB6E6]/30 rounded-xl text-[#EA638C]"><Tag size={18} /></div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#3E442B]">Manual Entry</h3>
        </div>

        <div className="space-y-4">
          <input
            className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#EA638C] font-bold text-[#3E442B]"
            placeholder="Category Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-[#3E442B]"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">Top Level (Parent)</option>
            {parentCategories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => setIsNewArrival(!isNewArrival)}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl cursor-pointer transition-all border-2 ${isNewArrival ? 'bg-[#EA638C]/10 border-[#EA638C] text-[#EA638C]' : 'bg-gray-50 border-transparent text-gray-400'}`}
            >
              <Star size={14} fill={isNewArrival ? "#EA638C" : "none"} />
              <span className="text-[10px] font-black">New Arrival</span>
            </div>
            
            <div className="flex items-center p-1 bg-gray-50 rounded-2xl">
               <Box size={14} className="ml-3 text-gray-400" />
               <input 
                 type="number"
                 value={moq}
                 onChange={(e) => setMoq(e.target.value)}
                 className="w-full bg-transparent p-2 text-[11px] font-bold text-[#3E442B] outline-none"
                 placeholder="MOQ"
               />
            </div>
          </div>

          <button
            onClick={handleAddCategory}
            className="w-full py-4 bg-[#EA638C] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#EA638C]/30 hover:bg-[#3E442B] transition-all"
          >
            Inject into DNA
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "modal") return modalUI;

  return (
    <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FBB6E6]/20 rounded-2xl text-[#EA638C]"><FolderTree size={24} /></div>
          <h2 className="text-2xl font-black text-[#3E442B] uppercase italic">Architecture</h2>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-[#3E442B] text-white p-3 rounded-2xl"><Plus size={20} /></button>
      </div>

      {isAdding && modalUI}

      <div className="space-y-4">
        {parentCategories.map(parent => (
          <div key={parent._id} className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#FBB6E6]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#3E442B] uppercase text-[11px]">{parent.name}</span>
                {parent.isNewArrival && <Star size={10} className="text-[#EA638C]" fill="#EA638C" />}
              </div>
            </div>
            {/* Child Rendering */}
            <div className="ml-8 space-y-2 border-l-2 border-[#FBB6E6]/30 pl-4">
              {getChildren(parent._id).map(child => (
                <div key={child._id} className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-500 uppercase">
                  {child.name} (MOQ: {child.moq})
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}