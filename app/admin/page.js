"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, Users, DollarSign, Activity, 
  Loader2, Wallet, Truck, Percent 
} from "lucide-react";
import { getDashboardStats } from "@/actions/order";
import AnalyticsBreakdown from "@/components/admin/AnalyticsBreakdown"; // 🟢 Added this

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Note: This fetches 'all' by default, the chart handles its own filtering
      const res = await getDashboardStats(); 
      if (res.success) {
        setData(res.stats);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  // Updated Stats to reflect Net Profit and Operational Costs
  const stats = [
    { 
      label: "Net Revenue", 
      value: `৳${data?.netRevenue?.toLocaleString() || 0}`, 
      icon: Wallet, 
      color: "text-[#3E442B]", 
      bg: "bg-[#3E442B]/10",
      description: "After Fees & Delivery"
    },
    { 
      label: "Gateway & Delivery", 
      value: `৳${((data?.gatewayCosts || 0) + (data?.deliveryCosts || 0)).toLocaleString()}`, 
      icon: Truck, 
      color: "text-[#EA638C]", 
      bg: "bg-[#EA638C]/10",
      description: "Operational Expenses"
    },
    { 
      label: "Total Orders", 
      value: data?.orderCount || 0, 
      icon: ShoppingBag, 
      color: "text-[#3E442B]", 
      bg: "bg-gray-100",
      description: "Successful Sales"
    },
    { 
      label: "Total Users", 
      value: data?.totalUsers || 0, 
      icon: Users, 
      color: "text-[#EA638C]", 
      bg: "bg-[#EA638C]/5",
      description: "Registered Customers" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#EA638C]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3E442B]">Initializing Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 duration-700 animate-in fade-in p-2 md:p-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#3E442B]">
            Dashboard <span className="text-[#EA638C]">Analytics</span>
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
              Financial Status: Healthy
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
           <Percent size={14} className="text-[#EA638C]" />
           <p className="text-[10px] font-black uppercase text-[#3E442B]">
             Conversion Rate: <span className="text-[#EA638C]">{data?.conversionRate || 3.2}%</span>
           </p>
        </div>
      </div>

      {/* PRIMARY STATS GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[#EA638C]/20 transition-all duration-500">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={26} />
            </div>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">{stat.label}</p>
            <p className="text-2xl font-black mt-1 text-[#3E442B] tracking-tighter">{stat.value}</p>
            <p className="text-[8px] font-bold text-gray-300 uppercase mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* MAIN ANALYSIS SECTION */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* ROUND GRAPH BREAKDOWN (Left 2 Columns) */}
        <div className="lg:col-span-2">
          <AnalyticsBreakdown />
        </div>
        
        {/* SYSTEM HEALTH CARD (Right 1 Column) */}
        <div className="p-8 bg-[#3E442B] rounded-[3rem] text-white shadow-2xl shadow-[#3E442B]/30 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#EA638C]/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          
          <div>
            <h3 className="mb-8 text-[10px] font-black tracking-[0.3em] uppercase text-white/50">Core Infrastructure</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Database</span>
                  <span className="text-[8px] text-white/40 font-bold uppercase mt-1">MongoDB Cluster</span>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[8px] font-black uppercase tracking-tighter border border-green-500/20">Stable</div>
              </div>
              
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Gateway</span>
                  <span className="text-[8px] text-white/40 font-bold uppercase mt-1">SSL / bKash API</span>
                </div>
                <span className="text-[8px] font-black uppercase text-[#EA638C]">Secured</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Sync Status</span>
                  <span className="text-[8px] text-white/40 font-bold uppercase mt-1">Inventory & Orders</span>
                </div>
                <span className="text-[8px] font-black uppercase text-green-400">Live</span>
              </div>
            </div>
          </div>

          <div className="p-6 mt-8 border bg-white/5 rounded-3xl border-white/5 backdrop-blur-sm">
            <p className="text-[8px] font-black uppercase text-[#EA638C] tracking-widest mb-2">Internal Note</p>
            <p className="text-[11px] italic leading-relaxed text-white/70">
              The Net Revenue reflects totals after 1.5% MFS fees and all delivery costs have been deducted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}