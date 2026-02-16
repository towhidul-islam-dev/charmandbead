"use client";
import { useState, useMemo, useTransition } from "react";
import { Plus, Trash2, X, FolderTree, Tag, ChevronDown, Loader2, Star, Box } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/actions/category";
import toast from "react-hot-toast";

export default function CategoryManager({
  categories = [],
  mode = "full",
  onClose,
}) {
  const [isAdding, setIsAdding] = useState(mode === "modal");
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  
  // New functionality states
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [moq, setMoq] = useState(1);

  const parentCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(
      (c) => !c.parentId || ["null", "", "none"].includes(String(c.parentId))
    );
  }, [categories]);

  const handleSave = () => {
    if (!name.trim()) return toast.error("Category name is required");

    startTransition(async () => {
      console.log("Attempting Save..."); 
      
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("parentId", parentId || "");
      formData.append("isNewArrival", String(isNewArrival));
      formData.append("moq", String(moq));

      try {
        const result = await saveCategoryAction(formData);
        
        if (result?.success) {
          toast.success("Architecture updated! ✨");
          // Reset fields
          setName("");
          setParentId("");
          setIsNewArrival(false);
          setMoq(1);
          
          if (mode === "modal") {
            onClose?.(result.data);
          } else {
            setIsAdding(false);
          }
        } else {
          // 🔍 This will now catch the 'slug' required error if it happens
          toast.error(result?.error || "Save failed. Check terminal.");
        }
      } catch (err) {
        console.error("Action Crash:", err);
        toast.error("Critical Connection Error");
      }
    });
  };

  const modalUI = (
    <div className={mode === "modal" ? "fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#3E442B]/50 backdrop-blur-sm" : "mb-8 animate-in zoom-in-95"}>
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative border border-gray-100">
        <button 
          onClick={() => mode === "modal" ? onClose?.() : setIsAdding(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-[#EA638C] transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-[#3E442B] font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
          <Tag size={16} className="text-[#EA638C]" /> New Element
        </h3>

        <div className="space-y-4">
          {/* Category Name */}
          <input
            className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#FBB6E6] font-bold text-[#3E442B]"
            placeholder="Category Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Parent Selection */}
          <div className="relative">
            <select
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none appearance-none font-bold text-[#3E442B]"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Top Level (Parent)</option>
              {parentCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-4 top-1/2" size={16} />
          </div>

          {/* NEW ARRIVAL & MOQ TOGGLES */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => setIsNewArrival(!isNewArrival)}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl cursor-pointer transition-all border-2 ${isNewArrival ? 'bg-[#EA638C]/10 border-[#EA638C] text-[#EA638C]' : 'bg-gray-50 border-transparent text-gray-400'}`}
            >
              <Star size={14} fill={isNewArrival ? "#EA638C" : "none"} />
              <span className="text-[10px] font-black uppercase tracking-wider">New Arrival</span>
            </div>
            
            <div className="flex items-center bg-gray-50 p-1 rounded-2xl border-2 border-transparent focus-within:border-[#FBB6E6]">
               <Box size={14} className="ml-3 text-gray-400" />
               <input 
                 type="number"
                 min="1"
                 value={moq}
                 onChange={(e) => setMoq(Number(e.target.value))}
                 className="w-full bg-transparent p-2 text-[11px] font-bold text-[#3E442B] outline-none"
                 placeholder="MOQ"
               />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-4 bg-[#EA638C] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#EA638C]/20 hover:bg-[#3E442B] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : "Inject into DNA"}
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "modal") return modalUI;

  return (
    <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FBB6E6]/20 rounded-2xl text-[#EA638C]"><FolderTree size={24} /></div>
          <div>
            <h2 className="text-2xl font-black text-[#3E442B] uppercase italic tracking-tighter">Architecture</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DNA Structure</p>
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

      <div className="space-y-3">
        {parentCategories.map(parent => (
          <div key={parent._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-[#FBB6E6]/30">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#3E442B] uppercase text-[11px] tracking-wider">{parent.name}</span>
              {parent.isNewArrival && <Star size={10} className="text-[#EA638C]" fill="#EA638C" />}
            </div>
            <button 
               onClick={() => confirm("Delete this element?") && deleteCategoryAction(parent._id)} 
               className="text-red-300 transition-all opacity-0 group-hover:opacity-100 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}