"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image"; // Optimization: Modern Image Handling
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/actions/order";
import {
  User, Search, Eye, TrendingUp, CheckSquare, Square, 
  ChevronLeft, ChevronRight, X, Printer, Trash2
} from "lucide-react";
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
  const [viewingOrder, setViewingOrder] = useState(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // --- OPTIMIZED FETCHING ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    // Calling the new server action with pagination and search params
    const res = await getAllOrders(currentPage, 10, searchTerm, statusFilter);
    if (res.success) {
      setOrders(res.orders);
      setTotalPages(res.totalPages);
      setTotalOrders(res.totalOrders);
    }
    setLoading(false);
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    // Optimization: Debounce search to reduce DB load
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchOrders]);

  // --- HANDLERS ---
  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      toast.success(`Order ${newStatus}`);
      fetchOrders(); // Refresh only the current page
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm("Delete this order? This will update VIP spending records.")) return;
    const res = await deleteOrder(orderId);
    if (res.success) {
      toast.success("Order deleted");
      fetchOrders();
    }
  };

  const gridLayout = "md:grid-cols-[50px_110px_1.5fr_100px_100px_180px_140px]";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-10 pb-20 px-4 md:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl italic font-black text-gray-900 uppercase">Order Manager</h1>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
               Showing {orders.length} of {totalOrders} results
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 bg-white rounded-2xl text-[10px] font-black uppercase shadow-sm outline-none border-none cursor-pointer"
            >
              <option value="All">All Status</option>
              {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="relative w-full md:w-64">
              <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={16} />
              <input
                type="text"
                placeholder="ID, Name, or Phone..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-none shadow-sm text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-[#EA638C]/10"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden min-h-[500px]">
          <div className={`hidden px-8 py-5 border-b border-gray-100 md:grid ${gridLayout} items-center bg-gray-50/40 text-[9px] font-black uppercase text-gray-400 tracking-widest`}>
             <span>Select</span>
             <span>Ref / Date</span>
             <span>Customer</span>
             <span>Items</span>
             <span>Total</span>
             <span>Status</span>
             <span className="text-right">Action</span>
          </div>

          <div className={`divide-y divide-gray-100 ${loading ? 'opacity-40 animate-pulse' : ''}`}>
            {orders.length > 0 ? orders.map((order) => (
              <div key={order._id} className={`flex flex-col md:grid ${gridLayout} p-6 md:px-8 md:py-6 items-center hover:bg-gray-50/50 transition-all`}>
                <button onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}>
                  {selectedOrders.includes(order._id) ? <CheckSquare size={18} className="text-[#EA638C]" /> : <Square size={18} className="text-gray-200" />}
                </button>
                
                <div>
                  <p className="text-xs font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#EA638C] flex-shrink-0"><User size={14} /></div>
                  <p className="text-[10px] font-black uppercase text-gray-700 truncate">{order.shippingAddress?.name || "Guest"}</p>
                </div>

                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="relative w-7 h-7 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
                      <Image src={item.variant?.image || "/placeholder.png"} fill alt="p" className="object-cover" sizes="28px" />
                    </div>
                  ))}
                </div>

                <div className="text-sm font-black text-gray-900">৳{order.totalAmount.toLocaleString()}</div>

                <div className="pr-4 w-full md:w-auto">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`w-full text-[9px] font-black uppercase px-3 py-2 rounded-xl border appearance-none text-center cursor-pointer transition-colors ${statusColors[order.status]}`}
                  >
                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex gap-2 w-full md:justify-end mt-4 md:mt-0">
                  <button onClick={() => setViewingOrder(order)} className="flex-1 md:flex-none p-2.5 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all"><Eye size={16}/></button>
                  <button onClick={() => handleDelete(order._id)} className="flex-1 md:flex-none p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                <Search size={40} className="mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Records Found</p>
              </div>
            )}
          </div>
        </div>

        {/* --- PAGINATION --- */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button 
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 bg-white rounded-2xl shadow-sm disabled:opacity-20 hover:scale-105 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Page</span>
             <span className="text-sm font-black italic">{currentPage} / {totalPages}</span>
          </div>

          <button 
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-3 bg-white rounded-2xl shadow-sm disabled:opacity-20 hover:scale-105 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* --- MODAL --- */}
        {viewingOrder && (
          <OrderDetailsModal 
            order={viewingOrder} 
            onClose={() => setViewingOrder(null)} 
          />
        )}
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  const [includePrice, setIncludePrice] = useState(true);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 print:shadow-none print:rounded-none">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50/50 print:hidden">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500" />
             <h2 className="text-xs font-black uppercase tracking-widest">Order Details</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"><X size={18}/></button>
        </div>

        {/* Print Toggles */}
        <div className="px-8 py-4 bg-indigo-50/50 flex items-center justify-between print:hidden border-b border-indigo-100">
           <span className="text-[9px] font-black text-indigo-600 uppercase">Document Mode:</span>
           <div className="bg-white p-1 rounded-xl flex border border-indigo-100">
              <button onClick={() => setIncludePrice(true)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${includePrice ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>Invoice</button>
              <button onClick={() => setIncludePrice(false)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${!includePrice ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>Packing Slip</button>
           </div>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto print:max-h-none">
           {/* Items List */}
           <div className="space-y-3">
             {order.items.map((item, i) => (
               <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                   <Image src={item.variant?.image} fill alt="product" className="object-cover" sizes="56px" unoptimized />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] font-black uppercase text-gray-900">{item.productName}</p>
                   <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Size: {item.variant?.size} | Qty: {item.quantity}</p>
                 </div>
                 {includePrice && <p className="font-black text-sm">৳{item.price * item.quantity}</p>}
               </div>
             ))}
           </div>

           {/* Summary Section */}
           <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase">Shipping To</p>
                <p className="text-xs font-black uppercase text-gray-900">{order.shippingAddress?.name}</p>
                <p className="text-[10px] font-medium text-gray-500">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                <p className="text-[10px] font-bold text-gray-700">{order.shippingAddress?.phone}</p>
              </div>
              
              {includePrice && (
                <div className="text-right p-6 bg-gray-900 text-white rounded-[2rem] min-w-[180px]">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Amount Due</p>
                  <p className="text-2xl italic font-black">৳{order.totalAmount.toLocaleString()}</p>
                </div>
              )}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-white border-t flex gap-4 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:opacity-90 shadow-xl transition-all">
            <Printer size={16} /> Generate PDF
          </button>
          <button onClick={onClose} className="flex-[0.4] bg-gray-100 text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}