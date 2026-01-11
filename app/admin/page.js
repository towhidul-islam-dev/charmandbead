import { ShoppingBag, Users, DollarSign, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Revenue", value: "৳45,230", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Orders", value: "12", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Users", value: "1,240", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Conversion", value: "3.2%", icon: Activity, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#3E442B]">
          Dashboard Overview
        </h2>
        <p className="mt-2 text-xs font-black tracking-widest text-gray-400 uppercase">
          Welcome back, Administrator
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black mt-1 text-[#3E442B]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 p-8 bg-white rounded-[2.5rem] border border-gray-100 min-h-[400px]">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-[#3E442B]">Recent Sales</h3>
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <Activity size={48} className="mb-4 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sales data will appear here</p>
          </div>
        </div>
        
        {/* Dark Card using #3E442B */}
        <div className="p-8 bg-[#3E442B] rounded-[2.5rem] text-white">
          <h3 className="mb-6 text-sm font-black tracking-widest uppercase text-white/90">System Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Database</span>
              <span className="text-[10px] font-black uppercase text-green-400">Stable</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Inventory Sync</span>
              <span className="text-[10px] font-black uppercase text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}