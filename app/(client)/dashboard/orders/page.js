"use client";

import { useEffect, useState } from "react";
import { getUserOrders } from "@/actions/order";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronRight, Clock, Package, CheckCircle, Truck, AlertCircle, Wallet } from "lucide-react";

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
      case "Cancelled": return "text-red-600 bg-red-50";
      case "Shipped": return "text-blue-600 bg-blue-50";
      default: return "text-[#EA638C] bg-[#EA638C]/10";
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#EA638C] animate-pulse uppercase tracking-widest">
      Fetching your orders...
    </div>
  );

  return (
    <div className="max-w-4xl px-4 pt-32 pb-20 mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-[#3E442B] rounded-2xl flex items-center justify-center text-white">
          <Package size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#3E442B]">Purchase History</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manage your recent shopping</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No orders found yet</p>
          </div>
        ) : (
          orders.map(order => {
            // Calculate payment progress percentage
            const paymentProgress = (order.paidAmount / order.totalAmount) * 100;
            
            return (
              <div key={order._id} className="group bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all border border-transparent hover:border-[#EA638C]/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* LEFT: Status & ID */}
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-[1.5rem] transition-colors ${getStatusStyle(order.status)}`}>
                      {order.status === "Delivered" ? <CheckCircle size={22} /> : 
                       order.status === "Shipped" ? <Truck size={22} /> :
                       order.status === "Cancelled" ? <AlertCircle size={22} /> : <Clock size={22} />}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID: #{order._id.slice(-8)}</p>
                      <h3 className="font-black text-[#3E442B] text-lg uppercase italic tracking-tighter">{order.status}</h3>
                      <p className="text-[10px] font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* MIDDLE: Payment Progress (NEW) */}
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between mb-1.5">
                       <span className="text-[9px] font-black text-gray-400 uppercase">Payment Status</span>
                       <span className={`text-[9px] font-black uppercase ${order.dueAmount > 0 ? 'text-[#EA638C]' : 'text-green-600'}`}>
                        {order.dueAmount > 0 ? `${Math.round(paymentProgress)}% Paid` : 'Fully Paid'}
                       </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${order.dueAmount > 0 ? 'bg-[#EA638C]' : 'bg-green-500'}`}
                        style={{ width: `${paymentProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* RIGHT: Pricing & Link */}
                  <div className="flex items-center justify-between md:justify-end gap-8">
                    <div className="text-right">
                      {order.dueAmount > 0 ? (
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest">Due (COD)</p>
                          <p className="font-black text-[#EA638C] text-xl">৳{order.dueAmount.toLocaleString()}</p>
                          <p className="text-[8px] font-bold text-gray-400">Total: ৳{order.totalAmount.toLocaleString()}</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Settled</p>
                          <p className="font-black text-gray-900 text-xl">৳{order.totalAmount.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    <Link 
                      href={`/dashboard/orders/${order._id}`} 
                      className="bg-[#3E442B] text-white p-4 rounded-2xl group-hover:bg-[#EA638C] transition-all transform group-hover:rotate-12 shadow-lg shadow-gray-200"
                    >
                      <ChevronRight size={20} />
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