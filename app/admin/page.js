"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Users, DollarSign, Activity, Loader2 } from "lucide-react";
import { getDashboardStats } from "@/actions/order"; // adjust path as needed

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const res = await getDashboardStats();
      if (res.success) {
        setData(res.stats);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const stats = [
    { 
      label: "Total Revenue", 
      value: `৳${data?.totalRevenue?.toLocaleString() || 0}`, 
      icon: DollarSign, 
      color: "text-[#3E442B]", 
      bg: "bg-[#3E442B]/10" 
    },
    { 
      label: "Active Orders", 
      value: data?.activeOrders || 0, 
      icon: ShoppingBag, 
      color: "text-[#EA638C]", 
      bg: "bg-[#EA638C]/10" 
    },
    { 
      label: "Total Users", 
      value: data?.totalUsers || 0, 
      icon: Users, 
      color: "text-[#3E442B]", 
      bg: "bg-gray-100" 
    },
    { 
      label: "Conversion", 
      value: `${data?.conversionRate || 0}%`, 
      icon: Activity, 
      color: "text-[#EA638C]", 
      bg: "bg-[#EA638C]/5" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#EA638C]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-10 duration-700 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#3E442B]">
          Dashboard <span className="text-[#EA638C]">Overview</span>
        </h2>
        <p className="mt-2 text-xs font-black tracking-widest text-gray-400 uppercase">
          Real-time System Performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#EA638C]/20 transition-all duration-300">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={28} />
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{stat.label}</p>
            <p className="text-3xl font-black mt-1 text-[#3E442B] tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 p-8 bg-white rounded-[2.5rem] border border-gray-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#3E442B]">Recent Sales Trend</h3>
            <span className="text-[10px] font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full uppercase">Live Updates</span>
          </div>
          <div className="flex flex-col items-center justify-center text-gray-300 h-72">
            <Activity size={48} className="mb-4 opacity-10 text-[#3E442B]" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Graph visualization connecting...</p>
          </div>
        </div>
        
        {/* Brand Dark Card */}
        <div className="p-8 bg-[#3E442B] rounded-[3rem] text-white shadow-2xl shadow-[#3E442B]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EA638C]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <h3 className="mb-8 text-sm font-black tracking-widest uppercase text-white/90">System Health</h3>
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-green-400">Stable</span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Media Server</span>
              <span className="text-[10px] font-black uppercase text-[#EA638C]">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Inventory Sync</span>
              <span className="text-[10px] font-black uppercase text-green-400">Live</span>
            </div>
          </div>

          <div className="p-6 mt-12 border bg-white/5 rounded-2xl border-white/5">
            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-2">Admin Note</p>
            <p className="text-xs italic leading-relaxed text-white/70">System performing at peak efficiency. No pending updates required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}