"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/actions/order";
import {
  User, Search, Eye, CheckSquare, Square, 
  ChevronLeft, ChevronRight, X, Printer, Trash2
} from "lucide-react";
import toast from "react-hot-toast";

// Updated Status Colors to better complement the brand palette
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await getAllOrders(currentPage, 10, searchTerm, statusFilter);
    if (res.success) {
      setOrders(res.orders);
      setTotalPages(res.totalPages);
      setTotalOrders(res.totalOrders);
    }
    setLoading(false);
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      toast.success(`Order ${newStatus}`);
      fetchOrders();
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm("Delete this order?")) return;
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
            <h1 className="text-3xl italic font-black text-[#3E442B] uppercase tracking-tighter">
              Order <span className="text-[#EA638C]">Manager</span>
            </h1>
            <p className="text-[9px] font-black text-[#3E442B]/40 uppercase tracking-widest mt-1">
               Showing {orders.length} of {totalOrders} results
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 bg-white rounded-2xl text-[10px] font-black uppercase shadow-sm outline-none border-none cursor-pointer text-[#3E442B]"
            >
              <option value="All">All Status</option>
              {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="relative w-full md:w-64 text-[#3E442B]">
              <Search className="absolute text-[#3E442B]/30 -translate-y-1/2 left-4 top-1/2" size={16} />
              <input
                type="text"
                placeholder="ID, Name, or Phone..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-none shadow-sm text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-[#EA638C]/20"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
          <div className={`hidden px-8 py-5 border-b border-gray-100 md:grid ${gridLayout} items-center bg-[#3E442B]/5 text-[9px] font-black uppercase text-[#3E442B]/60 tracking-widest`}>
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
              <div key={order._id} className={`flex flex-col md:grid ${gridLayout} p-6 md:px-8 md:py-6 items-center hover:bg-[#EA638C]/5 transition-all`}>
                <button onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}>
                  {selectedOrders.includes(order._id) ? <CheckSquare size={18} className="text-[#EA638C]" /> : <Square size={18} className="text-gray-200" />}
                </button>
                
                <div>
                  <p className="text-xs font-bold text-[#3E442B]">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-[9px] font-black text-[#3E442B]/30 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EA638C]/10 flex items-center justify-center text-[#EA638C] flex-shrink-0"><User size={14} /></div>
                  <p className="text-[10px] font-black uppercase text-[#3E442B] truncate">{order.shippingAddress?.name || "Guest"}</p>
                </div>

                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="relative overflow-hidden bg-white border-2 border-white rounded-lg shadow-sm w-7 h-7">
                      <Image src={item.variant?.image || "/placeholder.png"} fill alt="p" className="object-cover" sizes="28px" />
                    </div>
                  ))}
                </div>

                <div className="text-sm font-black text-[#3E442B]">৳{order.totalAmount.toLocaleString()}</div>

                <div className="w-full pr-4 md:w-auto">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`w-full text-[9px] font-black uppercase px-3 py-2 rounded-xl border appearance-none text-center cursor-pointer transition-colors ${statusColors[order.status]}`}
                  >
                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex w-full gap-2 mt-4 md:justify-end md:mt-0">
                  <button onClick={() => setViewingOrder(order)} className="flex-1 md:flex-none p-2.5 bg-gray-50 text-[#3E442B] rounded-xl hover:bg-[#3E442B] hover:text-white transition-all"><Eye size={16}/></button>
                  <button onClick={() => handleDelete(order._id)} className="flex-1 md:flex-none p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center p-20 text-[#3E442B]">
                <Search size={40} className="mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Records Found</p>
              </div>
            )}
          </div>
        </div>

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button 
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 transition-transform bg-white shadow-sm rounded-2xl text-[#3E442B] disabled:opacity-20 hover:scale-105"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3E442B]/30">Page</span>
             <span className="text-sm italic font-black text-[#3E442B]">{currentPage} / {totalPages}</span>
          </div>

          <button 
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-3 transition-transform bg-white shadow-sm rounded-2xl text-[#3E442B] disabled:opacity-20 hover:scale-105"
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
      <div className="absolute inset-0 bg-[#3E442B]/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 print:shadow-none print:rounded-none">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50 print:hidden">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#EA638C] rounded-full animate-pulse" />
             <h2 className="text-xs font-black tracking-widest uppercase text-[#3E442B]">Order Details</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-[#3E442B]"><X size={18}/></button>
        </div>

        {/* Print Toggles */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-[#EA638C]/10 bg-[#EA638C]/5 print:hidden">
           <span className="text-[9px] font-black text-[#EA638C] uppercase">Document Mode:</span>
           <div className="flex p-1 bg-white border border-[#EA638C]/10 rounded-xl">
              <button onClick={() => setIncludePrice(true)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${includePrice ? 'bg-[#EA638C] text-white shadow-md' : 'text-[#3E442B]/40'}`}>Invoice</button>
              <button onClick={() => setIncludePrice(false)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!includePrice ? 'bg-[#EA638C] text-white shadow-md' : 'text-[#3E442B]/40'}`}>Packing Slip</button>
           </div>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto print:max-h-none">
           <div className="space-y-3">
             {order.items.map((item, i) => (
               <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 bg-gray-50 rounded-2xl">
                 <div className="relative overflow-hidden border-2 border-white shadow-sm w-14 h-14 rounded-xl">
                   <Image src={item.variant?.image} fill alt="product" className="object-cover" sizes="56px" unoptimized />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] font-black uppercase text-[#3E442B]">{item.productName}</p>
                   <p className="text-[9px] text-[#3E442B]/50 font-bold uppercase mt-0.5">Size: {item.variant?.size} | Qty: {item.quantity}</p>
                 </div>
                 {includePrice && <p className="text-sm font-black text-[#3E442B]">৳{item.price * item.quantity}</p>}
               </div>
             ))}
           </div>

           <div className="flex flex-col justify-between gap-6 pt-8 mt-8 border-t md:flex-row border-gray-100">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-[#3E442B]/30 uppercase">Shipping To</p>
                <p className="text-xs font-black text-[#3E442B] uppercase">{order.shippingAddress?.name}</p>
                <p className="text-[10px] font-medium text-[#3E442B]/60">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                <p className="text-[10px] font-bold text-[#3E442B]/80">{order.shippingAddress?.phone}</p>
              </div>
              
              {includePrice && (
                <div className="text-right p-6 bg-[#3E442B] text-white rounded-[2rem] min-w-[180px]">
                  <p className="text-[9px] font-black text-white/40 uppercase">Amount Due</p>
                  <p className="text-2xl italic font-black">৳{order.totalAmount.toLocaleString()}</p>
                </div>
              )}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 p-6 bg-white border-t border-gray-100 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-[#EA638C] text-white py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:opacity-90 shadow-xl transition-all">
            <Printer size={16} /> Generate PDF
          </button>
          <button onClick={onClose} className="flex-[0.4] bg-gray-100 text-[#3E442B]/40 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-gray-200 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
}