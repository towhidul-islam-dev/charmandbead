"use client";
import { useState, useMemo, useTransition } from "react"; // 🟢 Added useTransition
import { Plus, Trash2, X, FolderTree, Tag, ChevronDown, Loader2 } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/actions/category";
import toast from "react-hot-toast";

export default function CategoryManager({
  categories = [],
  mode = "full",
  onClose,
}) {
  const [isAdding, setIsAdding] = useState(mode === "modal");
  const [isPending, startTransition] = useTransition(); // 🟢 Use this instead of manual state
  const [deletingId, setDeletingId] = useState(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  const parentCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(
      (c) => !c.parentId || ["null", "", "none"].includes(String(c.parentId))
    );
  }, [categories]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Please enter a name");

    // 🟢 Wrap in startTransition to force Next.js to track the server action
    startTransition(async () => {
      try {
        console.log("🚀 Pushing to server...");
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("parentId", parentId || "");

        const result = await saveCategoryAction(formData);

        if (result?.success) {
          toast.success("Architecture updated! ✨");
          setName("");
          setParentId("");
          
          if (mode === "modal") {
            onClose?.(result.data);
          } else {
            setIsAdding(false);
          }
        } else {
          toast.error(result?.error || "Server rejected the change.");
        }
      } catch (err) {
        console.error("Connection Error:", err);
        toast.error("Failed to reach the server.");
      }
    });
  };

  const modalUI = (
    <div className={mode === "modal" ? "fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#3E442B]/50 backdrop-blur-sm" : "mb-8"}>
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative border border-gray-100">
        <button 
          onClick={() => mode === "modal" ? onClose?.() : setIsAdding(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-[#EA638C]"
        >
          <X size={20} />
        </button>

        <h3 className="text-[#3E442B] font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
          <Tag size={16} className="text-[#EA638C]" /> New Category
        </h3>

        <div className="space-y-4">
          <input
            className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#FBB6E6] font-bold text-[#3E442B]"
            placeholder="Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="relative">
            <select
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none appearance-none font-bold text-[#3E442B]"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Top Level</option>
              {parentCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-4 bg-[#EA638C] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#EA638C]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : "Inject into DNA"}
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "modal") return modalUI;

  // Render the list view
  return (
    <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative">
       <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-[#FBB6E6]/20 rounded-2xl text-[#EA638C]"><FolderTree size={24} /></div>
             <h2 className="text-2xl font-black text-[#3E442B] uppercase italic">Architecture</h2>
          </div>
          <button onClick={() => setIsAdding(true)} className="bg-[#3E442B] text-white p-3 rounded-2xl">
            <Plus size={20} />
          </button>
       </div>

       {isAdding && modalUI}

       <div className="space-y-3">
          {parentCategories.map(parent => (
             <div key={parent._id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center group">
                <span className="font-bold text-[#3E442B]">{parent.name}</span>
                <button onClick={() => {
                   if(confirm("Delete?")) {
                      setDeletingId(parent._id);
                      deleteCategoryAction(parent._id).then(() => setDeletingId(null));
                   }
                }} className="text-red-400 opacity-0 group-hover:opacity-100">
                   {deletingId === parent._id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                </button>
             </div>
          ))}
       </div>
    </div>
  );
}