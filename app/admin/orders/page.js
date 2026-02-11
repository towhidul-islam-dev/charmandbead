"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/actions/order";
import {
  Search, Eye, CheckSquare, Square, 
  ChevronLeft, ChevronRight, Trash2, 
  Package, Banknote, CreditCard, Info, Trash,
  Wallet, Receipt
} from "lucide-react";
import toast from "react-hot-toast";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";

// 🎨 Brand Color Mapping
const statusColors = {
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  Processing: "bg-[#FBB6E6]/30 text-[#EA638C] border-[#FBB6E6]",
  Shipped: "bg-blue-50 text-blue-600 border-blue-100",
  Delivered: "bg-[#3E442B] text-white border-[#3E442B]", 
  Cancelled: "bg-red-50 text-red-500 border-red-100",
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

  // 🟢 IMAGE RESOLVER: Preserved logic
  const getProductImage = (item) => {
    if (item.product?.imageUrl) return item.product.imageUrl;
    if (item.variant?.image) return item.variant.image;
    return "/placeholder.png";
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(currentPage, 10, searchTerm, statusFilter);
      if (res.success) {
        setOrders(res.orders);
        setTotalPages(res.totalPages);
        setTotalOrders(res.totalOrders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
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
      toast.success(`Updated to ${newStatus}`);
      fetchOrders();
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm("Permanently delete this order?")) return;
    const res = await deleteOrder(orderId);
    if (res.success) {
      toast.success("Order deleted");
      fetchOrders();
    }
  };

  // 🟢 Layout preserved to prevent UI breakage
  const gridLayout = "md:grid-cols-[50px_110px_1.4fr_110px_180px_170px_120px]";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-32 px-4 md:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4 mb-10 md:flex-row md:items-end md:justify-between px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <Receipt className="text-[#EA638C] w-7 h-7 md:w-9 md:h-9" />
               <h1 className="text-3xl md:text-4xl italic font-black text-[#3E442B] uppercase tracking-tighter leading-none">
                Order <span className="text-[#EA638C]">Registry</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-[#3E442B]/30 uppercase tracking-[0.3em] mt-3 ml-12">
               {totalOrders} Records found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row w-full md:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-6 py-4 bg-white rounded-2xl text-[10px] font-black uppercase shadow-sm border-none outline-none text-[#3E442B] cursor-pointer ring-1 ring-gray-100"
            >
              <option value="All">All Statuses</option>
              {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="relative w-full md:w-80">
              <Search className="absolute text-[#3E442B]/20 -translate-y-1/2 left-5 top-1/2" size={18} />
              <input
                type="text"
                placeholder="Search Orders..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl border-none shadow-sm text-[10px] font-black uppercase outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#EA638C]/20"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#3E442B]/5 border border-gray-100 overflow-hidden">
          <div className={`hidden px-10 py-6 border-b border-gray-50 md:grid ${gridLayout} items-center bg-gray-50/30 text-[9px] font-black uppercase text-[#3E442B]/40 tracking-[0.2em]`}>
              <span>Sel.</span>
              <span>Identity</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Payment</span>
              <span>Status</span>
              <span className="text-right">Action</span>
          </div>

          <div className={`${loading ? 'opacity-40 pointer-events-none' : ''}`}>
            {orders.length > 0 ? (
              orders.map((order) => {
                const isPaid = (order.dueAmount ?? 0) <= 0;
                
                return (
                  <div key={order._id} className={`flex flex-col md:grid ${gridLayout} p-6 md:px-10 md:py-8 items-center border-b border-gray-50 hover:bg-[#FBB6E6]/5 transition-all group relative`}>
                    
                    <button onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}>
                      {selectedOrders.includes(order._id) ? <CheckSquare size={20} className="text-[#EA638C]" /> : <Square size={20} className="text-gray-200" />}
                    </button>
                    
                    <div className="mt-2 md:mt-0">
                      <p className="text-[11px] font-black text-[#3E442B]">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[8px] font-bold text-gray-300 uppercase mt-1 flex items-center gap-1">
                        <Wallet size={10} /> {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 py-4 md:py-0">
                      <div className="w-10 h-10 rounded-xl bg-[#3E442B] flex items-center justify-center text-white font-black text-xs">
                        {order.shippingAddress?.name?.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black uppercase text-[#3E442B] truncate">{order.shippingAddress?.name}</p>
                        <p className="text-[9px] font-bold text-gray-400">{order.shippingAddress?.phone}</p>
                      </div>
                    </div>

                    <div className="flex -space-x-3 py-2 md:py-0">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative w-9 h-9 overflow-hidden bg-white border-2 border-white rounded-xl shadow-md z-[1]">
                          <Image src={getProductImage(item)} fill alt="item" className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>

                    {/* 🟢 Refined Payment Column */}
                    <div className="py-4 md:py-0">
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-black text-[#3E442B]">৳{order.totalAmount.toLocaleString()}</p>
                         {order.mobileBankingFee > 0 && <Info size={12} className="text-[#EA638C]" />}
                      </div>
                      
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase mt-2 border ${
                        isPaid ? 'bg-green-50 text-green-600 border-green-100' : 'bg-pink-50 text-[#EA638C] border-[#FBB6E6]'
                      }`}>
                        {isPaid ? <CreditCard size={10}/> : <Banknote size={10}/>}
                        {isPaid ? 'Settled' : `Due: ৳${order.dueAmount.toLocaleString()}`}
                      </div>
                    </div>

                    <div className="w-full py-2 md:w-auto md:pr-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`w-full md:w-32 text-[9px] font-black uppercase px-4 py-2.5 rounded-xl border-none appearance-none text-center cursor-pointer shadow-sm ${statusColors[order.status]}`}
                      >
                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex w-full gap-2 mt-4 md:mt-0 md:justify-end">
                      <button onClick={() => setViewingOrder(order)} className="flex-1 md:flex-none p-3 bg-gray-50 text-[#3E442B] rounded-2xl hover:bg-[#3E442B] hover:text-white transition-all shadow-sm">
                        <Eye size={18}/>
                      </button>
                      <button onClick={() => handleDelete(order._id)} className="flex-1 md:flex-none p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-20 text-center text-gray-300 uppercase text-[10px] font-black tracking-widest">
                No orders found.
              </div>
            )}
          </div>
        </div>

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-center gap-6 mt-16">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-5 transition-all bg-white shadow-xl rounded-2xl disabled:opacity-20 hover:scale-105">
            <ChevronLeft size={24} className="text-[#3E442B]"/>
          </button>
          
          <div className="bg-[#3E442B] px-6 py-2.5 rounded-2xl shadow-lg">
            <span className="text-sm font-black text-white">{currentPage} / {totalPages}</span>
          </div>

          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-5 transition-all bg-white shadow-xl rounded-2xl disabled:opacity-20 hover:scale-105">
            <ChevronRight size={24} className="text-[#3E442B]"/>
          </button>
        </div>

        {/* 🟢 FLOATING ACTION BAR */}
        {selectedOrders.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#3E442B] text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-20 z-[100]">
            <div className="flex flex-col ml-4">
              <span className="text-[9px] font-black uppercase text-[#FBB6E6] tracking-widest">Selection</span>
              <span className="text-sm font-black">{selectedOrders.length} Records</span>
            </div>
            <button 
              onClick={() => { /* Bulk delete logic */ }}
              className="px-8 py-3.5 bg-[#EA638C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
            >
              <Trash size={14} /> Wipe Data
            </button>
          </div>
        )}

        {viewingOrder && (
          <OrderDetailsModal 
            key={viewingOrder._id}
            order={viewingOrder} 
            onClose={() => setViewingOrder(null)} 
          />
        )}
      </div>
    </div>
  );
}