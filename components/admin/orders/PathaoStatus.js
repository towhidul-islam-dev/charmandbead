"use client";

import { useState } from "react";
import { Truck, Loader2 } from "lucide-react";

export default function PathaoStatus({ trackingId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    if (!trackingId || status) return;
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consignmentId: trackingId }),
      });
      const result = await res.json();
      if (result.success) setStatus(result.data.order_status);
    } catch (err) { 
      console.error("Pathao status fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <button
      onClick={fetchStatus}
      type="button"
      className="font-black text-[#EA638C] uppercase inline-flex items-center gap-1 bg-[#EA638C]/10 px-2 py-1 rounded-md text-[8px] hover:bg-[#EA638C]/20 transition-all cursor-pointer"
      title="Click to check courier status"
    >
      {loading ? <Loader2 size={8} className="animate-spin" /> : <Truck size={8} />}
      {status || (trackingId ? "Check Courier" : "No Tracking")}
    </button>
  );
}