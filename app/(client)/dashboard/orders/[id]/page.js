"use client";

import { useEffect, useState, use } from "react";
import { useParams } from "next/navigation";
import { getOrderById, updateOrderStatus } from "@/actions/order";
import {
  Truck,
  MapPin,
  Package,
  ArrowLeft,
  Clock,
  CheckCircle,
  Loader2,
  CalendarCheck,
  User,
  ReceiptText,
  ImageOff,
  Download, // Added for the invoice button
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

  // NEW: Print Function
  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await updateOrderStatus(order._id, "Cancelled");
      if (res.success) {
        setOrder((prev) => ({ ...prev, status: "Cancelled" }));
        toast.success("Order cancelled");
      }
    } catch (err) {
      toast.error("Failed to cancel order");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <Loader2 className="animate-spin text-[#EA638C]" size={40} />
        <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">
          Syncing Order Data...
        </p>
      </div>
    );

  if (error || !order)
    return (
      <div className="min-h-screen pt-40 text-center bg-white">
        <p className="font-bold text-gray-500">Order not found.</p>
        <Link href="/dashboard/orders" className="text-[#EA638C] text-sm font-black underline mt-4 inline-block">
          Return to List
        </Link>
      </div>
    );

  const steps = [
    { label: "Placed", status: "Pending", icon: CalendarCheck },
    { label: "Processing", status: "Processing", icon: Loader2 },
    { label: "Shipped", status: "Shipped", icon: Truck },
    { label: "Delivered", status: "Delivered", icon: CheckCircle },
  ];
  const activeIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl px-4 pt-20 pb-20 mx-auto">
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-2 mb-8 text-xs font-black tracking-widest text-gray-400 uppercase transition-all hover:text-black print:hidden"
        >
          <ArrowLeft size={14} /> Back to History
        </Link>

        {/* Added "order-card" class for the Print CSS hook */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 order-card">
          {/* Order Meta Data */}
          <div className="flex flex-col items-start justify-between gap-4 pb-8 mb-10 border-b md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-gray-900">
                Order Tracking
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-[10px] font-black uppercase text-gray-400">
                  Order ID: #{order._id?.slice(-12)}
                </p>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <p className="text-[10px] font-black uppercase text-[#EA638C]">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <span
              className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase shadow-sm ${order.status === "Cancelled" ? "bg-red-50 text-red-500 shadow-red-50" : "bg-pink-50 text-[#EA638C] shadow-pink-50"}`}
            >
              {order.status}
            </span>
          </div>

          {/* Tracking Bar - Hidden on Print for a cleaner invoice */}
          <div className="relative flex justify-between px-2 mb-20 print:hidden">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isDone = index <= activeIndex;
              return (
                <div key={index} className="z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDone ? "bg-[#EA638C] text-white shadow-lg shadow-pink-100" : "bg-gray-100 text-gray-300"}`}
                  >
                    <Icon size={20} className={step.status === "Processing" && order.status === "Processing" ? "animate-spin" : ""} />
                  </div>
                  <p className={`mt-3 text-[9px] font-black uppercase tracking-tighter ${isDone ? "text-gray-900" : "text-gray-200"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
            <div className="absolute top-5 md:top-6 left-0 w-full h-[3px] bg-gray-50 -z-0 rounded-full">
              <div
                className="h-full bg-[#EA638C] transition-all duration-1000 ease-in-out"
                style={{ width: `${order.status === "Cancelled" ? "0%" : (activeIndex / 3) * 100 + "%"}` }}
              />
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  <Package size={14} /> Items Purchased ({order.items?.length})
                </h3>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 transition-all bg-white border border-gray-100 rounded-2xl hover:border-pink-100">
                      <div className="relative flex items-center justify-center overflow-hidden w-14 h-14 bg-gray-50 rounded-xl shrink-0">
                        <img
                          src={item.variant?.image || (Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl) || "/placeholder.png"}
                          alt="product"
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="items-center justify-center hidden w-full h-full text-gray-300">
                          <Package size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-800 line-clamp-1">{item.variant?.name || item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-black text-gray-900">৳{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50/50 p-7 rounded-[2.5rem] border border-gray-100">
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-5 flex items-center gap-2">
                  <MapPin size={14} /> Delivery Address
                </h4>
                <div className="space-y-1">
                  <p className="text-lg font-black text-gray-900">{order.shippingAddress?.name}</p>
                  <p className="text-sm font-bold text-[#EA638C]">{order.shippingAddress?.phone}</p>
                  <p className="pt-2 text-sm font-medium leading-relaxed text-gray-500">{order.shippingAddress?.address}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200">
                <div className="flex items-center gap-3 mb-6 opacity-40">
                  <ReceiptText size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Billing Summary</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>৳{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <span>Delivery</span>
                    <span className="text-green-500">FREE</span>
                  </div>
                  <div className="flex items-end justify-between pt-4 mt-4 border-t border-white/10">
                    <div>
                      <p className="text-[10px] font-black text-[#EA638C] uppercase mb-1">Total Paid</p>
                      <p className="text-4xl font-black">৳{order.totalAmount}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1">
                        <CheckCircle size={10} /> {order.paymentStatus}
                      </p>
                      <p className="text-[8px] font-bold text-gray-500 uppercase">Paid Via Online</p>
                    </div>
                  </div>
                </div>

                {/* NEW: Print Button inside Summary */}
                <button
                  onClick={handlePrint}
                  className="mt-8 w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 print:hidden"
                >
                  <Download size={14} /> Download Invoice
                </button>
              </div>

              <div className="pt-4 space-y-3">
                {order.status === "Pending" && (
                  <button
                    onClick={handleCancelOrder}
                    className="w-full py-5 bg-red-50 text-red-500 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 transform active:scale-95 print:hidden"
                  >
                    Cancel Order Request
                  </button>
                )}
                <div className="p-4 border border-gray-200 border-dashed rounded-3xl print:hidden">
                  <p className="text-[9px] text-center text-gray-400 font-bold px-4 leading-relaxed uppercase">
                    Our support team is available 24/7. Mention ID #{order._id?.slice(-6)} for quick help.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}