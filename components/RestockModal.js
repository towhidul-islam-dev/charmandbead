"use client";
import { useState, useEffect } from "react";
import { X, Plus, Loader2, History, Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateInventoryStock,
  getInventoryHistory,
} from "@/actions/inventoryWatcher";

export default function RestockModal({ product, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState("update"); // "update" or "history"
  const [loadingId, setLoadingId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch history only when the user switches to the history tab
  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const res = await getInventoryHistory(product._id);
    if (res.success) {
      setHistory(res.logs);
    } else {
      toast.error("Could not load history");
    }
    setLoadingHistory(false);
  };

  const handleUpdate = async (variantId, newVal) => {
    const idToTrack = variantId || "standard";
    setLoadingId(idToTrack);
    
    const res = await updateInventoryStock(product._id, variantId, Number(newVal));

    if (res.success) {
      toast.success(`Stock Updated! ${res.notifiedCount || 0} customers notified.`);
      onRefresh();
    } else {
      toast.error(res.message || "Failed to update stock");
    }
    setLoadingId(null);
  };

  // 🟢 Logic: Normalize items so the UI works for both Variant and Standard products
  const itemsToManage = product.hasVariants && product.variants?.length > 0
    ? product.variants 
    : [{ 
        _id: null, 
        color: "Standard", 
        size: "Base", 
        stock: product.stock, 
        minOrderQuantity: product.minOrderQuantity || 1 
      }];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3E442B]/20 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-8 shadow-2xl border-2 border-[#FBB6E6]/30 animate-in fade-in zoom-in duration-200">
        
        {/* --- Header & Tabs --- */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("update")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === "update" ? "bg-white text-[#3E442B] shadow-sm" : "text-gray-400"}`}
            >
              <Package size={12} /> Update
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === "history" ? "bg-white text-[#3E442B] shadow-sm" : "text-gray-400"}`}
            >
              <History size={12} /> History
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 transition-all rounded-full hover:bg-red-50 text-gray-400 hover:text-red-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Content Area --- */}
        <div className="max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
          
          {/* UPDATE TAB */}
          {activeTab === "update" && (
            <div className="space-y-3">
              {itemsToManage.map((v, idx) => {
                const uniqueKey = v._id || `std-${idx}`;
                return (
                  <div
                    key={uniqueKey}
                    className="group relative p-4 transition-all border-2 border-transparent bg-gray-50 rounded-[1.8rem] hover:border-[#EA638C]/20 hover:bg-white hover:shadow-lg hover:shadow-pink-500/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter mb-0.5 truncate">
                          {v.color} • {v.size}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-black text-[#3E442B] whitespace-nowrap">
                            Stock: {v.stock}
                          </span>
                          {/* 🟢 Refined MOQ Badge - Smaller and cleaner */}
                          <span className="flex items-center gap-1 text-[8px] bg-[#EA638C]/10 text-[#EA638C] px-1.5 py-0.5 rounded-md font-black uppercase border border-[#EA638C]/10">
                            MOQ:{v.minOrderQuantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min="0"
                          id={`input-${uniqueKey}`}
                          defaultValue={v.stock < 0 ? 0 : v.stock}
                          className="w-14 p-2 text-sm text-center font-black text-[#3E442B] bg-white border-2 border-gray-100 rounded-xl focus:border-[#EA638C] outline-none transition-all"
                        />
                        <button
                          onClick={() =>
                            handleUpdate(
                              v._id, 
                              document.getElementById(`input-${uniqueKey}`).value
                            )
                          }
                          disabled={loadingId === (v._id || "standard")}
                          className="bg-[#3E442B] text-white p-2.5 rounded-xl hover:bg-[#EA638C] active:scale-90 transition-all disabled:opacity-50 shadow-md"
                        >
                          {loadingId === (v._id || "standard") ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Plus size={16} strokeWidth={4} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {/* ... (history mapping with slightly reduced padding/text) */}
              {history.map((log) => (
                <div key={log._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                   <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[7px] px-2 py-0.5 rounded-full font-black uppercase text-white ${log.reason === "Sale" ? "bg-[#EA638C]" : "bg-[#3E442B]"}`}>
                          {log.reason}
                        </span>
                        <span className="text-[10px] font-black uppercase text-[#3E442B] italic truncate max-w-[80px]">
                          {log.variantKey}
                        </span>
                      </div>
                      <p className="text-[8px] font-bold text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                   </div>
                   <div className={`text-base italic font-black ${log.change > 0 ? "text-green-500" : "text-red-500"}`}>
                      {log.change > 0 ? `+${log.change}` : log.change}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
