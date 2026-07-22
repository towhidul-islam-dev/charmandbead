"use client";

import { useEffect, useState } from "react";
import { getUserOrders } from "@/actions/order";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  ChevronRight, Clock, Package, CheckCircle, Truck, AlertCircle, Loader2, XCircle, ArrowLeft 
} from "lucide-react";

// Isolated Tracking Section with Pulse Animation
const PathaoTracker = ({ consignmentId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async (e) => {
    e.preventDefault(); 
    if (!consignmentId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consignmentId }),
      });
      const result = await res.json();
      setTrackingData(result.data);
    } catch (err) {
      console.error("Tracking Error:", err);
    } finally {
      loading(false);
    }
  };

  if (!consignmentId) return null;

  return (
    <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
      <div className="flex items-center justify-between bg-[#FBB6E6]/10 p-4 rounded-[2rem] border border-[#FBB6E6]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Truck size={18} className="text-[#EA638C]" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest">Courier Tracking</p>
            <p className="text-[11px] font-bold text-[#3E442B]">Pathao ID: {consignmentId}</p>
          </div>
        </div>

        {trackingData ? (
          <div className="text-right">
            <p className="text-[10px] font-black text-[#3E442B] uppercase">{trackingData.order_status}</p>
            <p className="text-[8px] text-gray-400 uppercase">{trackingData.updated_at}</p>
          </div>
        ) : (
          <button 
            onClick={fetchTracking}
            disabled={loading}
            className="bg-[#3E442B] text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-[#EA638C] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#3E442B]/10 animate-pulse hover:animate-none"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : "Live Status"}
          </button>
        )}
      </div>
    </div>
  );
};

export default function OrdersListPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      getUserOrders(session.user.id)
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered": return "text-green-600 bg-green-50 border-green-100";
      case "Cancelled": return "text-red-500 bg-red-50 border-red-100";
      case "Shipped": return "text-blue-500 bg-blue-50 border-blue-100";
      case "Processing": return "text-orange-500 bg-orange-50 border-orange-100";
      default: return "text-[#EA638C] bg-[#EA638C]/10 border-[#EA638C]/20";
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#EA638C] animate-spin" />
            <p className="font-black text-[#EA638C] uppercase text-[10px] tracking-[0.3em]">Syncing History</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-5xl px-4 py-10 mx-auto pb-24">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#3E442B] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-[#3E442B]/20">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#3E442B] italic leading-none">Purchase History</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              Real-time tracking & payment status
            </p>
          </div>
        </div>
        
        <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#EA638C] hover:text-[#3E442B] transition-colors group"
        >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Insights
        </Link>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <Package size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your shopping bag is waiting for its first story</p>
            <Link href="/products" className="inline-block mt-6 text-[10px] font-black uppercase bg-[#3E442B] text-white px-8 py-4 rounded-2xl transition-all hover:bg-[#EA638C]">Start Shopping</Link>
          </div>
        ) : (
          orders.map(order => {
            const isCancelled = order.status === "Cancelled";
            const isDue = order.dueAmount > 0 && !isCancelled;
            
            // 🟢 Dynamic validation flag for Bulk/Wholesale indicators
            const isWholesale = order.items?.some(item => item.quantity > 1);

            return (
              <div 
                key={order._id} 
                className={`group bg-white p-6 rounded-[2.8rem] shadow-sm hover:shadow-2xl transition-all duration-500 border ${
                  isCancelled ? 'border-red-50 bg-red-50/10 opacity-75' : 'border-gray-50'
                }`}
              >
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                  
                  {/* LEFT: Status & ID */}
                  <div className="flex items-center gap-6 min-w-[200px]">
                    <div className={`p-5 rounded-[1.8rem] border transition-all group-hover:scale-110 duration-500 ${getStatusStyle(order.status)}`}>
                      {order.status === "Delivered" ? <CheckCircle size={24} /> : 
                       order.status === "Shipped" ? <Truck size={24} /> :
                       order.status === "Cancelled" ? <XCircle size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">#{order._id.slice(-8).toUpperCase()}</p>
                        {isWholesale && (
                          <span className="bg-[#3E442B] text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Bulk Order
                          </span>
                        )}
                      </div>
                      <h3 className={`font-black text-2xl uppercase italic tracking-tighter leading-none ${isCancelled ? 'text-red-400' : 'text-[#3E442B]'}`}>
                        {order.status}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-1.5">{new Date(order.createdAt).toDateString()}</p>
                    </div>
                  </div>

                  {/* MIDDLE: Quick Items Preview */}
                  <div className="flex-1 px-4 border-l border-gray-100 hidden md:block">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Package Contents</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-black text-[#3E442B] uppercase truncate max-w-[120px]">
                            {item.productName || "Product"}
                          </p>
                          {/* 🟢 Fixed data parsing access path matching OrderSchema embedded variant data block */}
                          <p className="text-[8px] font-bold text-[#EA638C] uppercase">
                             {item.variant?.name ? `${item.variant.name} • ` : ""}
                             {item.quantity} units
                          </p>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="bg-[#FBB6E6]/20 px-3 py-1.5 rounded-xl flex items-center">
                          <p className="text-[10px] font-black text-[#EA638C]">+{order.items.length - 3} MORE</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Financials & Action */}
                  <div className="flex items-center justify-between gap-10 lg:justify-end">
                    <div className="text-right">
                      {isCancelled ? (
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-red-300 uppercase tracking-widest">Transaction Void</p>
                          <p className="font-black text-gray-300 text-2xl line-through">৳{order.totalAmount.toLocaleString()}</p>
                        </div>
                      ) : isDue ? (
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest">Due at Delivery</p>
                          <p className="font-black text-[#EA638C] text-2xl">৳{order.dueAmount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-300 line-through">৳{order.totalAmount.toLocaleString()}</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Payment Cleared</p>
                          <p className="text-2xl font-black text-gray-900">৳{order.totalAmount.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    <Link 
                      href={`/dashboard/orders/${order._id}`} 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all transform group-hover:rotate-[15deg] shadow-xl ${
                        isCancelled 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-[#3E442B] text-white group-hover:bg-[#EA638C] shadow-[#3E442B]/10'
                      }`}
                    >
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                </div>

                {!isCancelled && <PathaoTracker consignmentId={order.consignmentId} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}