"use client";

import { useEffect, useState, use } from "react";
import { getOrderById, updateOrderStatus } from "@/actions/order";
import {
  Truck,
  MapPin,
  Package,
  ArrowLeft,
  CheckCircle,
  Loader2,
  CalendarCheck,
  ReceiptText,
  Download,
  Bell,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function OrderDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined" || id === "[id]") return;

    let isMounted = true;
    async function fetchOrder() {
      try {
        const data = await getOrderById(id);
        if (isMounted) {
          if (!data) setError(true);
          else setOrder(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchOrder();
    return () => { isMounted = false; };
  }, [id]);

  // Math Logic
  const itemsSubtotal = order?.items?.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0) || 0;
  const isPartial = (order?.dueAmount ?? 0) > 0;

  // Status Configuration
  const steps = [
    { label: "Placed", status: "Pending", icon: CalendarCheck },
    { label: "Processing", status: "Processing", icon: Loader2 },
    { label: "Shipped", status: "Shipped", icon: Truck },
    { label: "Delivered", status: "Delivered", icon: CheckCircle },
  ];
  const activeIndex = steps.findIndex((s) => s.status === order?.status);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Syncing Order Data...</p>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen pt-40 text-center bg-white">
      <p className="font-bold text-gray-500">Order not found.</p>
      <Link href="/dashboard/orders" className="text-[#EA638C] text-sm font-black underline mt-4 inline-block">Return to List</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl px-4 pt-20 pb-20 mx-auto">
        <Link href="/dashboard/orders" className="flex items-center gap-2 mb-8 text-xs font-black tracking-widest text-gray-400 uppercase transition-all hover:text-black print:hidden">
          <ArrowLeft size={14} /> Back to History
        </Link>

        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-gray-100">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 pb-8 mb-10 border-b md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-gray-900">Order Status</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Order ID: #{order._id?.slice(-12).toUpperCase()}</p>
            </div>
            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase ${order.status === "Cancelled" ? "bg-red-50 text-red-500" : "bg-pink-50 text-[#EA638C]"}`}>
              {order.status}
            </span>
          </div>

          {/* Restored Progress Bar */}
          <div className="relative flex justify-between px-2 mb-20 print:hidden">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isDone = index <= activeIndex;
              return (
                <div key={index} className="z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${isDone ? "bg-[#EA638C] text-white shadow-lg shadow-pink-100" : "bg-gray-100 text-gray-300"}`}>
                    <Icon size={20} className={step.status === "Processing" && order.status === "Processing" ? "animate-spin" : ""} />
                  </div>
                  <p className={`mt-3 text-[9px] font-black uppercase tracking-tighter ${isDone ? "text-gray-900" : "text-gray-300"}`}>{step.label}</p>
                </div>
              );
            })}
            <div className="absolute top-5 md:top-7 left-0 w-full h-[3px] bg-gray-50 -z-0 rounded-full">
              <div 
                className="h-full bg-[#EA638C] transition-all duration-1000" 
                style={{ width: `${order.status === "Cancelled" ? "0%" : (activeIndex / (steps.length - 1)) * 100 + "%"}` }} 
              />
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Left Column: Items */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                <Package size={14} /> Purchased Items
              </h3>
              
              <div className="space-y-3">
                {order.items?.map((item, idx) => {
                  const safeImageUrl = item.imageUrl || item.image || item.variant?.image || "/placeholder.png";
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 border border-gray-50 bg-gray-50/30 rounded-[1.5rem]">
                      <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden bg-white border border-gray-100 rounded-2xl">
                        <img 
                          src={safeImageUrl} 
                          alt={item.name}
                          className="object-cover w-full h-full"
                          onError={(e) => { e.target.src = "/placeholder.png"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-gray-900 uppercase truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                          {item.variant?.size || item.size || "Standard"} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-black text-gray-900">
                        ৳{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Billing & Shipping */}
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                  <MapPin size={14} /> Delivery Address
                </h4>
                <p className="text-sm font-black text-gray-900">{order.shippingAddress?.name || order.name}</p>
                <p className="text-xs font-bold text-[#EA638C]">{order.shippingAddress?.phone || order.phone}</p>
                <p className="pt-2 text-[12px] font-medium text-gray-500 leading-relaxed">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}
                </p>
              </div>

              <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 opacity-40">
                  <ReceiptText size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Financial Summary</p>
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase">
                    <span>Subtotal</span>
                    <span>৳{itemsSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase">
                    <span>Delivery Fee</span>
                    <span>+ ৳{(order.deliveryCharge || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10 text-white text-[11px] font-black uppercase">
                    <span>Grand Total</span>
                    <span>৳{Number(order.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#EA638C] text-[11px] font-black uppercase">
                    <span>Paid Online</span>
                    <span>- ৳{Number(order.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-end justify-between pt-5 mt-4 border-t border-white/20">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-1">
                        {isPartial ? "Cash on Delivery" : "Final Balance"}
                      </p>
                      <p className="text-4xl font-black text-white">৳{Number(order.dueAmount || 0).toLocaleString()}</p>
                    </div>
                    {isPartial && (
                      <div className="p-3 bg-[#EA638C] rounded-2xl shadow-lg shadow-pink-900/20">
                        <Wallet size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => window.print()} className="mt-8 w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] hover:text-white transition-all flex items-center justify-center gap-2 print:hidden">
                  <Download size={14} /> Save Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}