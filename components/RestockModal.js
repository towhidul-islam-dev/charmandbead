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
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl border-2 border-[#FBB6E6]/30 animate-in fade-in zoom-in duration-200">
        
        {/* --- Header & Tabs --- */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("update")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "update" ? "bg-white text-[#3E442B] shadow-sm" : "text-gray-400"}`}
            >
              <Package size={14} /> Update
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "history" ? "bg-white text-[#3E442B] shadow-sm" : "text-gray-400"}`}
            >
              <History size={14} /> History
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-all rounded-full hover:bg-red-50 text-gray-400 hover:text-red-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Content Area --- */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* UPDATE TAB */}
          {activeTab === "update" && (
            <div className="space-y-4">
              {itemsToManage.map((v, idx) => {
                const uniqueKey = v._id || `std-${idx}`;
                return (
                  <div
                    key={uniqueKey}
                    className="group relative p-5 transition-all border-2 border-transparent bg-gray-50 rounded-[2rem] hover:border-[#EA638C]/20 hover:bg-white hover:shadow-xl hover:shadow-pink-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1">
                          {v.color} • {v.size}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-[#3E442B]">
                            Stock: {v.stock}
                          </span>
                          {/* 🟢 MOQ Badge using Brand Pink */}
                          <span className="flex items-center gap-1 text-[9px] bg-[#EA638C]/10 text-[#EA638C] px-2 py-0.5 rounded-full font-black uppercase border border-[#EA638C]/20">
                            <AlertCircle size={10} /> MOQ: {v.minOrderQuantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          id={`input-${uniqueKey}`}
                          defaultValue={v.stock < 0 ? 0 : v.stock}
                          className="w-20 p-3 text-center font-black text-[#3E442B] bg-white border-2 border-gray-100 rounded-2xl focus:border-[#EA638C] outline-none transition-all"
                        />
                        <button
                          onClick={() =>
                            handleUpdate(
                              v._id, 
                              document.getElementById(`input-${uniqueKey}`).value
                            )
                          }
                          disabled={loadingId === (v._id || "standard")}
                          className="bg-[#3E442B] text-white p-3 rounded-2xl hover:bg-[#EA638C] active:scale-90 transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
                        >
                          {loadingId === (v._id || "standard") ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Plus size={18} strokeWidth={3} />
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
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <Loader2 size={32} className="mb-4 animate-spin text-[#EA638C]" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">Syncing Logs...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-20 text-center text-gray-300 uppercase font-black text-[11px] tracking-widest">
                  No movement detected
                </div>
              ) : (
                history.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-5 rounded-[2rem] bg-gray-50 border border-gray-100"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase text-white shadow-sm ${log.reason === "Sale" ? "bg-[#EA638C]" : "bg-[#3E442B]"}`}
                        >
                          {log.reason}
                        </span>
                        <span className="text-[11px] font-black uppercase text-[#3E442B] italic">
                          {log.variantKey}
                        </span>
                      </div>
                      <p className="text-[9px] font-bold text-gray-400">
                        {new Date(log.createdAt).toLocaleString("en-US", {
                          month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                      <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-tighter">
                        Admin: {log.performedBy}
                      </p>
                    </div>
                    <div
                      className={`text-xl italic font-black ${log.change > 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}