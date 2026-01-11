"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllOrders, updateOrderStatus } from "@/actions/order";
import {
  User, Search, Eye, TrendingUp, Package, Calendar,
  ChevronDown, CheckSquare, Square, Truck, CheckCircle, XCircle, Clock, 
  RefreshCw, Ban, Filter
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const statusColors = {
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  Processing: "bg-purple-50 text-purple-700 border-purple-100",
  Shipped: "bg-blue-50 text-blue-700 border-blue-100",
  Delivered: "bg-green-50 text-green-700 border-green-100",
  Cancelled: "bg-red-50 text-red-700 border-red-100",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [lastSynced, setLastSynced] = useState(new Date());

  useEffect(() => {
    fetchOrders();
    // Auto-refresh data every 60 seconds
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    const data = await getAllOrders();
    setOrders(data || []);
    setLastSynced(new Date());
    setLoading(false);
  }

  const stats = useMemo(() => ({
    totalRevenue: orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0),
    delivered: orders.filter(o => o.status === "Delivered").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    processing: orders.filter(o => o.status === "Processing").length,
    pending: orders.filter(o => o.status === "Pending").length,
    cancelled: orders.filter(o => o.status === "Cancelled").length,
  }), [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      toast.success(`Updated to ${newStatus}`);
      fetchOrders();
    }
  };

  const handleBulkUpdate = async (newStatus) => {
    const loadingToast = toast.loading(`Updating ${selectedOrders.length} orders...`);
    try {
      await Promise.all(selectedOrders.map(id => updateOrderStatus(id, newStatus)));
      toast.success(`Bulk update: ${newStatus}`, { id: loadingToast });
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      toast.error("Failed", { id: loadingToast });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const gridLayout = "md:grid-cols-[50px_110px_1.5fr_100px_100px_180px_120px]";

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[#EA638C] animate-pulse">SYNCING SERVER...</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-4 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* --- DYNAMIC STATS --- */}
        <div className="grid grid-cols-2 gap-3 mb-8 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} icon={<TrendingUp size={18}/>} color="text-[#EA638C]" />
          <StatCard title="Delivered" value={stats.delivered} icon={<CheckCircle size={18}/>} color="text-green-500" />
          <StatCard title="Shipped" value={stats.shipped} icon={<Truck size={18}/>} color="text-blue-500" />
          <StatCard title="Processing" value={stats.processing} icon={<RefreshCw size={18}/>} color="text-purple-500" />
          <StatCard title="Pending" value={stats.pending} icon={<Clock size={18}/>} color="text-amber-500" />
          <StatCard title="Cancelled" value={stats.cancelled} icon={<Ban size={18}/>} color="text-red-500" />
        </div>

        {/* --- HEADER & FILTERS --- */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl italic font-black text-gray-900 uppercase">Orders</h1>
            <p className="text-[8px] font-black text-gray-400 tracking-widest mt-1 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> 
              Last Live Sync: {lastSynced.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Status Quick Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              <select 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white border-none shadow-sm rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none focus:ring-2 focus:ring-[#EA638C]/20"
              >
                <option value="All">All Status</option>
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="FIND ORDER..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-none shadow-sm text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#EA638C]/20"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="bg-white md:rounded-[2.5rem] md:shadow-sm md:border md:border-gray-50 overflow-hidden">
          <div className={`hidden px-8 py-5 border-b border-gray-100 md:grid ${gridLayout} items-center bg-gray-50/40`}>
            <button onClick={() => setSelectedOrders(selectedOrders.length === filteredOrders.length ? [] : filteredOrders.map(o => o._id))}>
              {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Details</span>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Customer</span>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Items</span>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Total</span>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">State</span>
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">Action</span>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredOrders.length > 0 ? filteredOrders.map((order) => (
              <div key={order._id} className={`flex flex-col md:grid ${gridLayout} p-6 md:px-8 md:py-6 items-start md:items-center transition-all ${selectedOrders.includes(order._id) ? 'bg-blue-50/40' : 'hover:bg-gray-50/50'}`}>
                <button onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(i => i !== order._id) : [...prev, order._id])} className="mb-4 md:mb-0">
                  {selectedOrders.includes(order._id) ? <CheckSquare size={20} className="text-[#3E442B]" /> : <Square size={20} className="text-gray-200" />}
                </button>
                <div className="mb-2 md:mb-0">
                  <p className="text-xs font-bold text-gray-900">#{order._id.slice(-8)}</p>
                  <p className="text-[9px] font-black uppercase text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 mb-2 md:mb-0 min-w-0 pr-4">
                  <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#EA638C] flex-shrink-0"><User size={14} /></div>
                  <p className="text-[10px] font-black uppercase text-gray-700 truncate">{order.shippingAddress?.name || "Guest"}</p>
                </div>
                <div className="flex -space-x-2 mb-2 md:mb-0">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.variant?.image || "/placeholder.png"} className="w-7 h-7 border-2 border-white rounded-lg shadow-sm" alt="p" />
                  ))}
                </div>
                <div className="mb-2 md:mb-0 font-black text-gray-900 text-sm">৳{order.totalAmount.toLocaleString()}</div>
                <div className="relative w-full md:w-[160px] mb-4 md:mb-0">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`w-full appearance-none text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border-2 transition-all pr-10 ${statusColors[order.status]}`}
                  >
                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                </div>
                <div className="w-full md:text-right">
                  <Link href={`/dashboard/orders/${order._id}`} className="flex md:inline-flex items-center justify-center gap-2 w-full md:w-auto text-[9px] font-black uppercase text-[#3E442B] border-2 border-gray-100 px-3 py-2.5 rounded-xl hover:bg-[#3E442B] hover:text-white transition-all">
                    <Eye size={12} /> View
                  </Link>
                </div>
              </div>
            )) : <div className="p-20 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No results for this filter</div>}
          </div>
        </div>

        {/* --- BULK ACTION BAR --- */}
        {selectedOrders.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#3E442B] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5">
             <span className="text-[10px] font-black uppercase">{selectedOrders.length} SELECTED</span>
             <div className="h-4 w-[1px] bg-white/20" />
             <div className="flex gap-4">
                <button onClick={() => handleBulkUpdate('Shipped')} className="text-[9px] font-black uppercase hover:text-blue-300">Ship</button>
                <button onClick={() => handleBulkUpdate('Delivered')} className="text-[9px] font-black uppercase hover:text-green-300">Deliver</button>
                <button onClick={() => setSelectedOrders([])} className="opacity-50 hover:opacity-100 transition-opacity"><XCircle size={16}/></button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 flex flex-col justify-between h-28 shadow-sm">
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">{title}</p>
        <h2 className="text-lg font-black text-gray-900 truncate">{value}</h2>
      </div>
    </div>
  );
}