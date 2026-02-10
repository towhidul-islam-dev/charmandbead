"use client";

import { useEffect, useState } from "react";
import { getUserOrders } from "@/actions/order";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronRight, Clock, Package, CheckCircle, Truck, AlertCircle } from "lucide-react";

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
      case "Delivered": return "text-green-600 bg-green-50";
      case "Cancelled": return "text-red-500 bg-red-50";
      case "Shipped": return "text-blue-500 bg-blue-50";
      case "Processing": return "text-orange-500 bg-orange-50";
      default: return "text-[#EA638C] bg-[#EA638C]/10";
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#EA638C] border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-[#EA638C] uppercase text-[10px] tracking-[0.3em]">Syncing Orders</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-5xl px-4 py-10 mx-auto">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 bg-[#3E442B] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-[#3E442B]/20">
          <Package size={28} />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#3E442B] italic">Purchase History</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
            Real-time tracking & payment status
          </p>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <Package size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your shopping bag is waiting for its first story</p>
            <Link href="/products" className="inline-block mt-6 text-[10px] font-black uppercase bg-[#3E442B] text-white px-8 py-4 rounded-2xl">Start Shopping</Link>
          </div>
        ) : (
          orders.map(order => {
            const paymentProgress = (order.paidAmount / order.totalAmount) * 100;
            const isDue = order.dueAmount > 0;
            
            return (
              <div key={order._id} className="group bg-white p-6 rounded-[2.8rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-gray-50">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                  
                  {/* LEFT: Status & ID */}
                  <div className="flex items-center gap-6 min-w-[200px]">
                    <div className={`p-5 rounded-[1.8rem] transition-all group-hover:scale-110 duration-500 ${getStatusStyle(order.status)}`}>
                      {order.status === "Delivered" ? <CheckCircle size={24} /> : 
                       order.status === "Shipped" ? <Truck size={24} /> :
                       order.status === "Cancelled" ? <AlertCircle size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">ID: #{order._id.slice(-8).toUpperCase()}</p>
                      <h3 className="font-black text-[#3E442B] text-2xl uppercase italic tracking-tighter leading-none">{order.status}</h3>
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
                          <p className="text-[8px] font-bold text-[#EA638C] uppercase">
                             {/* 🟢 Using the correct variant name mapping */}
                             {item.variant?.name && item.variant.name !== "Default" ? `${item.variant.name} • ` : ""}
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
                      {isDue ? (
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
                      className="bg-[#3E442B] text-white w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-[#EA638C] transition-all transform group-hover:rotate-[15deg] shadow-xl shadow-gray-200"
                    >
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}