"use client";
import { useState, useEffect } from "react";
import { X, Plus, Loader2, History, Package } from "lucide-react";
import toast from "react-hot-toast";
import { updateInventoryStock, getInventoryHistory } from "@/actions/inventoryWatcher";

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

  const handleUpdate = async (variantId, currentVal) => {
    setLoadingId(variantId);
    // Note: If you have admin auth, pass the email as the 4th argument here
    const res = await updateInventoryStock(product._id, variantId, currentVal);
    
    if (res.success) {
      toast.success(`Stock Updated! ${res.notifiedCount} customers notified.`);
      onRefresh(); 
    } else {
      toast.error("Failed to update stock");
    }
    setLoadingId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-pink-100 animate-in fade-in zoom-in duration-200">
        
        {/* --- Tab Header --- */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab("update")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'update' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              <Package size={14} /> Update
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              <History size={14} /> History
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- Content Area --- */}
        <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* UPDATE TAB */}
          {activeTab === "update" && (
            <div className="space-y-3">
              {product.variants.map((v) => (
                <div key={v._id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-pink-100 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">
                      {v.color} / {v.size}
                    </span>
                    <span className="text-sm font-bold text-gray-700">Stock: {v.stock}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      id={`input-${v._id}`}
                      defaultValue={v.stock}
                      className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-[#EA638C]/20 outline-none"
                    />
                    <button 
                      onClick={() => handleUpdate(v._id, document.getElementById(`input-${v._id}`).value)}
                      disabled={loadingId === v._id}
                      className="bg-black text-white p-2.5 rounded-xl hover:bg-[#EA638C] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loadingId === v._id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <Loader2 size={24} className="animate-spin mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Loading Logs...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-gray-400 uppercase font-black text-[10px] tracking-widest">
                  No movement detected yet
                </div>
              ) : (
                history.map((log) => (
                  <div key={log._id} className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase text-white ${log.reason === 'Sale' ? 'bg-red-400' : 'bg-green-400'}`}>
                          {log.reason}
                        </span>
                        <span className="text-[10px] font-black uppercase text-gray-900">{log.variantKey}</span>
                      </div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                        {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                      </p>
                      <p className="text-[8px] font-black text-[#EA638C] uppercase mt-1">By: {log.performedBy}</p>
                    </div>
                    <div className={`text-lg italic font-black ${log.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
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