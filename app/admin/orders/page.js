"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/actions/order";
import {
  Search, Eye, CheckSquare, Square, 
  ChevronLeft, ChevronRight, Trash2, 
  CreditCard, Banknote, Info, Trash,
  Wallet, Receipt, Truck, Loader2, PhoneCall, Hash
} from "lucide-react";
import toast from "react-hot-toast";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";

// Brand Colors: Green: #3E442B | Pink: #EA638C | LightPink: #FBB6E6

// 🟢 Helper for Pathao Status (Internal)
const PathaoStatus = ({ trackingId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trackingId) return;
    const fetchStatus = async () => {
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
    fetchStatus();
  }, [trackingId]);

  if (!trackingId) return null;
  return (
    <span className="text-[9px] font-black text-[#EA638C] uppercase inline-flex items-center gap-1 bg-[#EA638C]/10 px-1.5 py-0.5 rounded-md">
      {loading ? <Loader2 size={8} className="animate-spin" /> : <Truck size={8} />}
      {status || "Syncing..."}
    </span>
  );
};

// 🟢 Status styling dictionary
const statusColors = {
  Verifying: "bg-purple-50 text-purple-600 border-purple-100",
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

  const getProductImage = (item) => {
    return (
      item.variant?.image || 
      item.variant?.img || 
      item.product?.imageUrl || 
      "/placeholder.png"
    );
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(currentPage, 10, searchTerm, statusFilter);
      if (res.success) {
        setOrders(res.orders);
        setTotalPages(res.totalPages);
        setTotalOrders(res.totalOrders);

        // Keep viewing modal data in sync if open
        setViewingOrder(prev => prev ? res.orders.find(o => o._id === prev._id) || prev : null);
      }
    } catch (error) { 
      toast.error("Failed to load orders"); 
    } finally { 
      setLoading(false); 
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchOrders(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      toast.success(`Updated to ${newStatus}`);
      fetchOrders();
    } else {
      toast.error(res.message || "Failed to update status");
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm("Permanently delete this order?")) return;
    const res = await deleteOrder(orderId);
    if (res.success) {
      toast.success("Order deleted");
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
      fetchOrders();
    } else {
      toast.error(res.message || "Failed to delete order");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const range = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const gridLayout = "md:grid-cols-[50px_110px_1.4fr_110px_200px_170px_120px]";

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-32 px-4 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-4 mb-6 md:mb-10 md:flex-row md:items-end md:justify-between px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <Receipt className="text-[#EA638C] w-7 h-7 md:w-9 md:h-9" />
               <h1 className="text-2xl md:text-4xl italic font-black text-[#3E442B] uppercase tracking-tighter leading-none">
                 Order <span className="text-[#EA638C]">Registry</span>
               </h1>
            </div>
            <p className="text-[10px] font-black text-[#3E442B]/30 uppercase tracking-[0.3em] mt-2 md:mt-3 ml-10 md:ml-12">
                {totalOrders} Records found
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row w-full md:w-auto">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
              className="px-4 py-3 md:px-6 md:py-4 bg-white rounded-2xl text-[10px] font-black uppercase shadow-sm border-none outline-none text-[#3E442B] cursor-pointer ring-1 ring-gray-100"
            >
              <option value="All">All Statuses</option>
              {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="relative w-full md:w-80">
              <Search className="absolute text-[#3E442B]/20 -translate-y-1/2 left-4 md:left-5 top-1/2" size={16} />
              <input 
                type="text" 
                placeholder="Search Orders..." 
                className="w-full pl-11 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 rounded-2xl border-none shadow-sm text-[10px] font-black uppercase outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#EA638C]/20" 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              />
            </div>
          </div>
        </div>

        {/* ORDER CONTAINER */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-[#3E442B]/5 border border-gray-100 overflow-hidden">
          
          {/* DESKTOP TABLE HEADER */}
          <div className={`hidden px-10 py-6 border-b border-gray-50 md:grid ${gridLayout} items-center bg-gray-50/30 text-[9px] font-black uppercase text-[#3E442B]/40 tracking-[0.2em]`}>
              <span>Sel.</span>
              <span>Identity</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Payment Details</span>
              <span>Status</span>
              <span className="text-right">Action</span>
          </div>

          <div className={`${loading ? 'opacity-40 pointer-events-none' : ''}`}>
            {orders.length > 0 ? (
              orders.map((order) => {
                const isPaid = (order.dueAmount ?? 0) <= 0;
                
                // 🟢 Robust extraction of sender phone & txn ID
                const qrSender = order.paymentDetails?.sourcePhone || order.paymentDetails?.source;
                const qrTxnId = order.paymentDetails?.transactionId || order.tran_id || order.transactionId;

                return (
                  <div key={order._id} className="border-b border-gray-100/60 transition-all hover:bg-[#FBB6E6]/5">
                    
                    {/* =========================================================
                        📱 MOBILE COMPACT CARD VIEW (< md)
                       ========================================================= */}
                    <div className="p-4 space-y-3 md:hidden">
                      {/* Top Row: Checkbox, ID, Date, Pathao Status, Status Dropdown */}
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}>
                            {selectedOrders.includes(order._id) ? <CheckSquare size={18} className="text-[#EA638C]" /> : <Square size={18} className="text-gray-300" />}
                          </button>
                          <div>
                            <span className="text-[11px] font-black text-[#3E442B] font-mono tracking-wide">
                              #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <p className="text-[9px] font-bold text-gray-400 font-mono">
                              {new Date(order.createdAt).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <PathaoStatus trackingId={order.trackingNumber} />
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-xl border-none appearance-none text-center cursor-pointer shadow-xs ${statusColors[order.status] || "bg-gray-50 text-gray-600"}`}
                          >
                            {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Middle Row: Customer Info & Price / Settlement */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#3E442B] flex items-center justify-center text-white font-black text-[10px] shrink-0">
                            {order.shippingAddress?.name?.charAt(0) || "C"}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black uppercase text-[#3E442B] truncate leading-tight">
                              {order.shippingAddress?.name || "N/A"}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 font-mono">
                              {order.shippingAddress?.phone || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-[#3E442B]">
                            ৳{order.totalAmount?.toLocaleString()}
                          </p>
                          <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-md border mt-0.5 ${isPaid ? 'bg-green-50 text-green-600 border-green-100' : 'bg-pink-50 text-[#EA638C] border-[#FBB6E6]'}`}>
                            {isPaid ? <CreditCard size={8}/> : <Banknote size={8}/>}
                            {isPaid ? 'Settled' : `Due: ৳${order.dueAmount?.toLocaleString()}`}
                          </span>
                        </div>
                      </div>

                      {/* Payment/Trx Badge (Mobile) */}
                      {(qrSender || qrTxnId) && (
                        <div className="bg-gray-50 p-2 rounded-xl text-[9px] font-mono flex items-center justify-between border border-gray-100 text-gray-600">
                          {qrSender && (
                            <span className="font-bold text-[#3E442B] flex items-center gap-1">
                              <PhoneCall size={9} className="text-[#EA638C]" /> {qrSender}
                            </span>
                          )}
                          {qrTxnId && (
                            <span className="font-black text-[#EA638C] flex items-center gap-1 truncate max-w-[140px]">
                              <Hash size={9} className="text-[#3E442B]" /> {qrTxnId}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bottom Row: Item Thumbnails & Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex -space-x-2 overflow-hidden py-1">
                          {order.items?.slice(0, 4).map((item, i) => (
                            <div key={i} className="relative w-8 h-8 overflow-hidden bg-white border-2 border-white rounded-lg shadow-xs shrink-0">
                              <Image src={getProductImage(item)} fill alt="item" className="object-cover" unoptimized />
                            </div>
                          ))}
                          {order.items?.length > 4 && (
                            <div className="relative w-8 h-8 bg-[#3E442B] text-white text-[9px] font-black rounded-lg flex items-center justify-center border-2 border-white shrink-0">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => setViewingOrder(order)} 
                            className="p-2 bg-gray-100 text-[#3E442B] rounded-xl hover:bg-[#3E442B] hover:text-white transition-all"
                            title="View Details"
                          >
                            <Eye size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(order._id)} 
                            className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Delete Order"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                    </div>


                    {/* =========================================================
                        💻 DESKTOP GRID VIEW (>= md)
                       ========================================================= */}
                    <div className={`hidden md:grid ${gridLayout} px-10 py-8 items-center`}>
                      <button onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}>
                        {selectedOrders.includes(order._id) ? <CheckSquare size={20} className="text-[#EA638C]" /> : <Square size={20} className="text-gray-200" />}
                      </button>
                      
                      <div>
                        <p className="text-[11px] font-black text-[#3E442B]">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-[8px] font-bold text-gray-300 uppercase mt-1 flex items-center gap-1">
                          <Wallet size={10} /> {new Date(order.createdAt).toLocaleDateString('en-GB')}
                        </p>
                        <PathaoStatus trackingId={order.trackingNumber} />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#3E442B] flex items-center justify-center text-white font-black text-xs">
                          {order.shippingAddress?.name?.charAt(0) || "C"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black uppercase text-[#3E442B] truncate">{order.shippingAddress?.name || "N/A"}</p>
                          <p className="text-[9px] font-bold text-gray-400">{order.shippingAddress?.phone || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex -space-x-3">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <div key={i} className="relative w-9 h-9 overflow-hidden bg-white border-2 border-white rounded-xl shadow-md z-[1]">
                            <Image src={getProductImage(item)} fill alt="item" className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>

                      {/* PAYMENT COLUMN */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-[#3E442B]">৳{order.totalAmount?.toLocaleString()}</p>
                          {order.mobileBankingFee > 0 && <Info size={12} className="text-[#EA638C]" />}
                        </div>

                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase mt-1.5 border ${isPaid ? 'bg-green-50 text-green-600 border-green-100' : 'bg-pink-50 text-[#EA638C] border-[#FBB6E6]'}`}>
                          {isPaid ? <CreditCard size={10}/> : <Banknote size={10}/>}
                          {isPaid ? 'Settled' : `Due: ৳${order.dueAmount?.toLocaleString()}`}
                        </div>

                        {(qrSender || qrTxnId) && (
                          <div className="mt-2 p-2 bg-[#FBB6E6]/10 border border-[#FBB6E6]/40 rounded-xl space-y-0.5">
                            {qrSender && (
                              <p className="text-[9px] font-bold text-[#3E442B] flex items-center gap-1">
                                <PhoneCall size={9} className="text-[#EA638C]" /> {qrSender}
                              </p>
                            )}
                            {qrTxnId && (
                              <p className="text-[9px] font-mono font-black text-[#EA638C] flex items-center gap-1">
                                <Hash size={9} className="text-[#3E442B]" /> {qrTxnId}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="w-32 pr-4">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                          className={`w-full text-[9px] font-black uppercase px-4 py-2.5 rounded-xl border-none appearance-none text-center cursor-pointer shadow-sm ${statusColors[order.status] || "bg-gray-50 text-gray-600"}`}
                        >
                          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setViewingOrder(order)} 
                          className="p-3 bg-gray-50 text-[#3E442B] rounded-2xl hover:bg-[#3E442B] hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={18}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(order._id)} 
                          className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
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

        {/* BRAND-ALIGNED PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center gap-6 mt-12 md:mt-16">
            <div className="flex items-center gap-2 p-1.5 bg-white shadow-xl rounded-full border border-gray-50">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${currentPage === 1 ? 'opacity-20 pointer-events-none' : 'bg-gray-50 text-[#3E442B] hover:text-[#EA638C]'}`}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1 px-1">
                {getPageNumbers().map((p, i) => (
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-300 font-bold text-xs">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-11 h-11 flex flex-col items-center justify-center rounded-full text-[10px] font-black transition-all ${
                        currentPage === p ? 'bg-[#3E442B] text-white shadow-lg' : 'text-gray-400 hover:text-[#EA638C]'
                      }`}
                    >
                      {currentPage === p && <span className="text-[5px] uppercase tracking-tighter opacity-60 leading-none">Pg</span>}
                      {p}
                    </button>
                  )
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${currentPage === totalPages ? 'opacity-20 pointer-events-none' : 'bg-[#3E442B] text-white hover:bg-[#EA638C] shadow-lg'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">
              Registry Navigation <span className="mx-2 opacity-30">•</span> {totalOrders} Total Records
            </p>
          </div>
        )}

        {/* BULK ACTION BAR */}
        {selectedOrders.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#3E442B] text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between z-[100]">
            <div className="flex flex-col ml-4">
              <span className="text-[9px] font-black uppercase text-[#FBB6E6] tracking-widest">Selection</span>
              <span className="text-sm font-black">{selectedOrders.length} Records</span>
            </div>
            <button className="px-8 py-3.5 bg-[#EA638C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2">
              <Trash size={14} /> Wipe Data
            </button>
          </div>
        )}

        {/* ORDER DETAILS MODAL */}
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