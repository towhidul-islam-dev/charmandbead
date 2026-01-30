"use client";
import { useState } from "react";
import { auditStockConsistency } from "@/actions/inventory"; // Path to the script we just wrote
import { ShieldCheck, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function StockAuditCard() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAudit = async (fix = false) => {
    setLoading(true);
    const res = await auditStockConsistency(fix);
    if (res.success) {
      setReport(res.report);
      if (fix) toast.success(`Fixed ${res.report.fixed} products!`);
      else toast.success("Audit complete!");
    } else {
      toast.error("Audit failed");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#3E442B] p-6 text-white flex justify-between items-center">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black tracking-widest uppercase">
            <ShieldCheck size={18} /> Inventory Health Scanner
          </h3>
          <p className="text-[10px] opacity-70 mt-1 uppercase font-bold">Sync total stock with variant sums</p>
        </div>
        <button 
          onClick={() => handleAudit(false)}
          disabled={loading}
          className="p-2 transition-all rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
        </button>
      </div>

      <div className="p-6">
        {!report ? (
          <div className="py-10 text-center">
            <p className="text-xs font-bold tracking-tighter text-gray-400 uppercase">No recent scan data available</p>
            <button 
              onClick={() => handleAudit(false)}
              className="mt-4 text-[#3E442B] border-2 border-[#3E442B] px-6 py-2 rounded-full font-black text-[10px] uppercase hover:bg-[#3E442B] hover:text-white transition-all"
            >
              Start Full Scan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 text-center border border-gray-100 bg-gray-50 rounded-2xl">
                <p className="text-[9px] text-gray-400 font-black uppercase">Scanned</p>
                <p className="text-2xl font-black text-[#3E442B]">{report.scanned}</p>
              </div>
              <div className={`p-4 rounded-2xl border text-center ${report.issuesFound > 0 ? 'bg-pink-50 border-pink-100' : 'bg-green-50 border-green-100'}`}>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Issues Found</p>
                <p className={`text-2xl font-black ${report.issuesFound > 0 ? 'text-[#EA638C]' : 'text-[#3E442B]'}`}>
                  {report.issuesFound}
                </p>
              </div>
            </div>

            {/* Issues List */}
            {report.issuesFound > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase text-gray-400">Drift Details</span>
                  <button 
                    onClick={() => handleAudit(true)}
                    className="bg-[#EA638C] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase hover:scale-105 transition-transform"
                  >
                    Fix All Issues
                  </button>
                </div>
                <div className="pr-2 space-y-2 overflow-y-auto max-h-40 custom-scrollbar">
                  {report.details.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-[11px] font-black text-gray-800">{item.name}</p>
                        <p className="text-[9px] text-gray-400">Stated: {item.stated} | Actual: {item.actual}</p>
                      </div>
                      <span className="text-[10px] font-black text-[#EA638C]">
                        {item.diff > 0 ? `+${item.diff}` : item.diff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.issuesFound === 0 && (
              <div className="flex flex-col items-center gap-2 py-6">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#3E442B]">
                  <ShieldCheck size={28} />
                </div>
                <p className="text-[#3E442B] font-black uppercase text-[10px]">All inventory is perfectly synced</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}