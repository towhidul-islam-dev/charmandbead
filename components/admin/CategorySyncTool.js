"use client";

import { useState, useEffect } from 'react';
import { seedCategories } from "@/actions/category";
import { RefreshCw, Database, Sparkles, Clock } from 'lucide-react';
import toast from "react-hot-toast";

export default function CategorySyncTool() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState(null);

    // 🟢 Load the last sync time from local storage on mount
    useEffect(() => {
        const savedTime = localStorage.getItem('last_category_sync');
        if (savedTime) setLastSynced(savedTime);
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        const loadingToast = toast.loading("Aligning inventory DNA...");
        
        try {
            const res = await seedCategories();
            if (res.success) {
                const now = new Date().toLocaleString([], { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });
                localStorage.setItem('last_category_sync', now);
                setLastSynced(now);
                toast.success(res.message, { id: loadingToast });
            } else {
                toast.error("Sync failed.", { id: loadingToast });
            }
        } catch (err) {
            toast.error("An error occurred.", { id: loadingToast });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="bg-white border border-[#FBB6E6]/30 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            {/* Subtle Brand Accent Line */}
            <div className="absolute top-0 left-0 w-1 h-full bg-[#EA638C]/20" />
            
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#3E442B]/5 flex items-center justify-center text-[#3E442B]">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#3E442B] uppercase tracking-tight">
                                Category Sync
                            </h3>
                            {lastSynced && (
                                <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-[#EA638C] uppercase tracking-wider">
                                    <Clock size={10} />
                                    <span>Last: {lastSynced}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`
                        relative group overflow-hidden w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all
                        ${isSyncing 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-[#3E442B] text-white hover:bg-black active:scale-[0.98] shadow-lg shadow-[#3E442B]/10'}
                    `}
                >
                    <div className="flex items-center justify-center gap-3">
                        <RefreshCw size={14} className={isSyncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
                        <span>{isSyncing ? "Syncing..." : "Update Architecture"}</span>
                    </div>
                </button>
            </div>

            <div className="mt-6 flex items-start gap-3 px-4 py-3 bg-[#FBB6E6]/5 rounded-xl border border-[#FBB6E6]/20">
                <Sparkles size={12} className="text-[#EA638C] mt-0.5 shrink-0" />
                <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
                    Updates slugs and parent-child links to match your <span className="text-[#3E442B]">constants.js</span>.
                </p>
            </div>
        </div>
    );
}