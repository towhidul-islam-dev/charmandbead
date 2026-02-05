"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/actions/order";
import {
  Search, Eye, CheckSquare, Square, 
  ChevronLeft, ChevronRight, Trash2, 
  Package, Banknote, CreditCard, Info, Trash
} from "lucide-react";
import toast from "react-hot-toast";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";

// 🟢 Brand Colors applied to Status
const statusColors = {
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  Processing: "bg-[#FBB6E6]/30 text-[#EA638C] border-[#FBB6E6]",
  Shipped: "bg-blue-50 text-blue-600 border-blue-100",
  Delivered: "bg-[#3E442B] text-white border-[#3E442B]", // Brand Green High Contrast
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

  // 🟢 IMAGE RESOLVER: Matching your Product Page logic
  const getProductImage = (item) => {
  // 1. Check if the populated product has an imageUrl
  if (item.product?.imageUrl) return item.product.imageUrl;

  // 2. Check if a variant image exists (if you eventually add that to the schema)
  if (item.variant?.image) return item.variant.image;

  // 3. Fallback
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

  // 🟢 BULK DELETE LOGIC
  const handleBulkDelete = async () => {
    if (!confirm(`Permanently delete ${selectedOrders.length} orders?`)) return;
    try {
      // Logic assumes multiple calls; replace with a bulk action if your backend supports it
      await Promise.all(selectedOrders.map(id => deleteOrder(id)));
      toast.success(`${selectedOrders.length} Orders Deleted Successfully`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      toast.error("Bulk deletion failed");
    }
  };

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

  const gridLayout = "md:grid-cols-[50px_110px_1.4fr_110px_160px_170px_120px]";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-32 px-4 md:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl italic font-black text-[#3E442B] uppercase tracking-tighter leading-none">
              Order <span className="text-[#EA638C]">Registry</span>
            </h1>
            <div className="text-[10px] font-black text-[#3E442B]/30 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#EA638C] rounded-full animate-ping" />
                Live Admin Insights • {totalOrders} Records
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-6 py-4 bg-white rounded-2xl text-[10px] font-black uppercase shadow-sm border border-gray-100 outline-none text-[#3E442B] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="relative w-full md:w-80">
              <Search className="absolute text-[#3E442B]/20 -translate-y-1/2 left-5 top-1/2" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 shadow-sm text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-[#EA638C]/20 text-[#3E442B]"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#3E442B]/5 border border-gray-100 overflow-visible">
          <div className={`hidden px-10 py-5 border-b border-gray-50 md:grid ${gridLayout} items-center bg-[#3E442B]/[0.02] text-[9px] font-black uppercase text-[#3E442B]/40 tracking-[0.2em]`}>
              <span>Sel.</span>
              <span>Identity</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Financials</span>
              <span>Status</span>
              <span className="text-right">Action</span>
          </div>

          <div className={`${loading ? 'opacity-40 pointer-events-none' : ''}`}>
            {orders.length > 0 ? (
              orders.map((order) => {
                const isPaid = (order.dueAmount ?? 0) <= 0;
                return (
                  <div key={order._id} className={`flex flex-col md:grid ${gridLayout} p-6 md:px-10 md:py-6 items-center border-b border-gray-50 hover:bg-[#EA638C]/[0.02] transition-all group`}>
                    
                    <button onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}>
                      {selectedOrders.includes(order._id) ? <CheckSquare size={18} className="text-[#EA638C]" /> : <Square size={18} className="text-gray-200" />}
                    </button>
                    
                    <div className="mt-2 md:mt-0">
                      <p className="text-[10px] font-black text-[#3E442B]">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[8px] font-bold text-gray-300 uppercase leading-none mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 py-2 md:py-0">
                      <div className="w-8 h-8 rounded-lg bg-[#EA638C]/10 flex items-center justify-center text-[#EA638C] font-black text-[10px]">
                        {order.shippingAddress?.name?.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[9px] font-black uppercase text-[#3E442B] truncate">{order.shippingAddress?.name}</p>
                        <p className="text-[8px] font-bold text-gray-400">{order.shippingAddress?.phone}</p>
                      </div>
                    </div>

                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative w-8 h-8 overflow-hidden bg-white border-2 border-white rounded-lg shadow-sm">
                          {/* 🟢 Using your exact Image pattern from Product Page */}
                          <Image 
                            src={getProductImage(item)} 
                            fill 
                            alt="order item" 
                            className="object-cover" 
                            unoptimized 
                          />
                        </div>
                      ))}
                    </div>

                    <div className="py-2 md:py-0">
                      <div className="flex items-center gap-2">
                         <p className="text-xs font-black text-[#3E442B]">৳{order.totalAmount.toLocaleString()}</p>
                         {order.mobileBankingFee > 0 && <Info size={11} className="text-[#EA638C]" />}
                      </div>
                      <div className={`text-[7px] font-black uppercase mt-1.5 flex items-center gap-1 ${isPaid ? 'text-green-500' : 'text-[#EA638C]'}`}>
                        {isPaid ? <CreditCard size={9}/> : <Banknote size={9}/>}
                        {isPaid ? 'Fully Paid' : `Due: ৳${order.dueAmount.toLocaleString()}`}
                      </div>
                    </div>

                    <div className="w-full py-2 md:w-auto md:pr-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`w-full text-[8px] font-black uppercase px-3 py-2 rounded-xl border-none appearance-none text-center cursor-pointer shadow-sm ${statusColors[order.status]}`}
                      >
                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex w-full gap-2 md:justify-end">
                      <button 
                        onClick={() => setViewingOrder(order)} 
                        className="p-2.5 bg-gray-50 text-[#3E442B] rounded-xl hover:bg-[#EA638C] hover:text-white transition-all shadow-sm"
                      >
                        <Eye size={16}/>
                      </button>
                      <button onClick={() => handleDelete(order._id)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-24 text-[#3E442B]/20">
                <Package size={48} strokeWidth={1} className="mb-4 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Registry is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* --- PAGINATION --- */}
        <div className="flex items-center justify-center gap-8 mt-12">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-4 transition-transform bg-white shadow-lg rounded-2xl disabled:opacity-20 hover:scale-105">
            <ChevronLeft size={20} className="text-[#3E442B]"/>
          </button>
          <div className="px-6 py-2 bg-[#3E442B] rounded-full">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentPage} / {totalPages}</span>
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-4 transition-transform bg-white shadow-lg rounded-2xl disabled:opacity-20 hover:scale-105">
            <ChevronRight size={20} className="text-[#3E442B]"/>
          </button>
        </div>

        {/* 🟢 FLOATING ACTION BAR FOR BULK DELETE */}
        {selectedOrders.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#3E442B] text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-10 z-[100]">
            <div className="flex flex-col ml-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FBB6E6]">Selected</span>
              <span className="text-sm font-black">{selectedOrders.length} Order Records</span>
            </div>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-6 py-3 bg-[#EA638C] hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              <Trash size={14} /> Delete Records
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