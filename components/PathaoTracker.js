"use client";
import { useState, useEffect } from "react";
import { Truck, Loader2, ExternalLink } from "lucide-react";

export default function PathaoTracker({ consignmentId, variant = "compact" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    if (!consignmentId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        body: JSON.stringify({ consignmentId }),
      });
      const result = await res.json();
      setData(result.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (variant === "full") fetchStatus(); }, [consignmentId]);

  if (!consignmentId) return null;

  return (
    <div className={`mt-6 p-5 rounded-[2rem] border transition-all ${variant === "full" ? "bg-gray-50 border-gray-100" : "bg-[#FBB6E6]/10 border-[#FBB6E6]/20"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3E442B] rounded-xl flex items-center justify-center text-white">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest">Pathao Logistics</p>
            <p className="text-[11px] font-bold text-[#3E442B]">ID: {consignmentId}</p>
          </div>
        </div>

        {data ? (
          <div className="text-right">
            <span className="px-3 py-1 bg-[#EA638C] text-white rounded-full text-[9px] font-black uppercase tracking-tighter">
              {data.order_status}
            </span>
            <p className="text-[8px] text-gray-400 mt-1 uppercase">{data.updated_at}</p>
          </div>
        ) : (
          <button onClick={fetchStatus} disabled={loading} className="text-[9px] font-black uppercase bg-[#3E442B] text-white px-4 py-2 rounded-xl hover:bg-[#EA638C] transition-all">
            {loading ? <Loader2 size={12} className="animate-spin" /> : "Track Live"}
          </button>
        )}
      </div>
    </div>
  );
}