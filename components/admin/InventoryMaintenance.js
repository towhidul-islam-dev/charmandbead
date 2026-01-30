"use client";
import { useState } from "react";
import { cleanupDuplicateLogs } from "@/app/admin/inventory/action";
import toast from "react-hot-toast";
import { WrenchScrewdriverIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function InventoryMaintenance() {
  const [isPending, setIsPending] = useState(false);

  const handleCleanup = async () => {
    if (!confirm("This will remove duplicate inventory logs. Proceed?")) return;
    
    setIsPending(true);
    try {
      const res = await cleanupDuplicateLogs();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-[#3E442B] rounded-[2rem] p-6 text-white shadow-xl shadow-green-900/20">
      <div className="flex items-center gap-3 mb-4">
        <WrenchScrewdriverIcon className="w-5 h-5 text-[#EA638C]" />
        <h3 className="text-[10px] font-black uppercase tracking-widest">System Maintenance</h3>
      </div>
      
      <p className="text-[10px] text-gray-400 font-bold mb-6 leading-relaxed">
        Use these tools to repair data inconsistencies caused by duplicate requests or server glitches.
      </p>

      <button
        onClick={handleCleanup}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-xl transition-all group"
      >
        {isPending ? (
          <ArrowPathIcon className="w-4 h-4 animate-spin text-[#EA638C]" />
        ) : (
          <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#EA638C]">
            Repair Log Duplicates
          </span>
        )}
      </button>
    </div>
  );
}