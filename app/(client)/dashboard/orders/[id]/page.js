"use client";

import { useEffect, useState, use } from "react";
import { getOrderById } from "@/actions/order";
import { useCart } from "@/Context/CartContext";
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
  Wallet,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OrderDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params?.id;
  const router = useRouter();

  // Hooks
  const { addToCart } = useCart();

  // State
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined" || id === "[id]" || id.length < 12) return;

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

  // --- BRAND-ALIGNED ACTIONS ---
  const handleBuyAgain = (item) => {
    try {
      const productData = {
        _id: item.productId?._id || item.productId,
        name: item.name,
        price: Number(item.price),
        imageUrl: item.imageUrl || item.image || "/placeholder.png",
        minOrderQuantity: item.minOrderQuantity || 1,
      };

      const variantData = {
        _id: item.variantId || `std-${productData._id}`,
        price: Number(item.price),
        size: item.size || "Standard",
        color: item.color || "Default",
        imageUrl: item.imageUrl || item.image || "/placeholder.png",
        minOrderQuantity: item.minOrderQuantity || 1,
      };

      addToCart(productData, variantData, item.quantity);
      toast.success(`${item.name} added to cart!`, {
        style: { background: '#333', color: '#fff', fontWeight: 'bold' },
        iconTheme: { primary: '#EA638C', secondary: '#fff' }
      });
      router.push("/cart");
    } catch (err) {
      toast.error("Could not add to cart.");
    }
  };

  const handleReorderAll = () => {
    order.items.forEach((item) => handleBuyAgain(item));
  };

  // --- LOGIC ---
  const itemsSubtotal = order?.items?.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0) || 0;
  const isPartial = (order?.dueAmount ?? 0) > 0;
  const isDelivered = order?.status === "Delivered";

  const steps = [
    { label: "Placed", status: "Pending", icon: CalendarCheck },
    { label: "Processing", status: "Processing", icon: Loader2 },
    { label: "Shipped", status: "Shipped", icon: Truck },
    { label: "Delivered", status: "Delivered", icon: CheckCircle },
  ];
  
  const activeIndex = order?.status === "Cancelled" ? -1 : steps.findIndex((s) => s.status === order?.status);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px] mt-4">Syncing Order Data...</p>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center">
      <p className="font-black text-gray-900 text-2xl uppercase italic tracking-tighter">Order Missing</p>
      <Link href="/dashboard/orders" className="text-[#EA638C] text-sm font-black underline mt-4 uppercase">Back to History</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white rounded-3xl">
      <div className="max-w-4xl px-4 pt-20 pb-20 mx-auto">
        <Link href="/dashboard/orders" className="flex items-center gap-2 mb-8 text-xs font-black tracking-widest text-gray-400 uppercase hover:text-black print:hidden">
          <ArrowLeft size={14} /> Back to History
        </Link>

        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 print:shadow-none print:border-none">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-10 border-b">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic">Order Summary</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Ref: #{order._id?.slice(-12).toUpperCase()}</p>
            </div>
            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase ${order.status === "Cancelled" ? "bg-red-50 text-red-500" : "bg-[#EA638C]/10 text-[#EA638C]"}`}>
              {order.status}
            </span>
          </div>

          {/* Progress Timeline using Brand Color */}
          {order.status !== "Cancelled" ? (
            <div className="relative flex justify-between px-2 mb-20 print:hidden">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isDone = index <= activeIndex;
                return (
                  <div key={index} className="z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${isDone ? "bg-[#EA638C] text-white shadow-lg shadow-[#EA638C]/20" : "bg-gray-100 text-gray-300"}`}>
                      <Icon size={20} className={step.status === "Processing" && order.status === "Processing" ? "animate-spin" : ""} />
                    </div>
                    <p className={`mt-3 text-[9px] font-black uppercase tracking-tighter ${isDone ? "text-gray-900" : "text-gray-300"}`}>{step.label}</p>
                  </div>
                );
              })}
              <div className="absolute top-5 md:top-7 left-0 w-full h-[3px] bg-gray-50 -z-0 rounded-full">
                <div 
                  className="h-full bg-[#EA638C] transition-all duration-1000" 
                  style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }} 
                />
              </div>
            </div>
          ) : (
            <div className="mb-20 p-6 bg-red-50 rounded-3xl border border-red-100 text-center print:hidden">
              <p className="text-red-500 font-black uppercase text-xs tracking-widest">Transaction Cancelled</p>
            </div>
          )}

          <div className="grid gap-12 md:grid-cols-2">
            {/* Left Column: Product List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  <Package size={14} /> Item Details
                </h3>
                {isDelivered && (
                  <button onClick={handleReorderAll} className="text-[9px] font-black uppercase text-[#EA638C] hover:underline flex items-center gap-1 print:hidden">
                    Reorder All <ChevronRight size={10} />
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {order.items?.map((item, idx) => {
                  const safeImageUrl = item.imageUrl || item.image || item.variant?.image || "/placeholder.png";
                  return (
                    <div key={idx} className="flex flex-col gap-4 p-5 border border-gray-100 bg-white rounded-[2rem] break-inside-avoid shadow-sm group">
                      <div className="flex items-center gap-4">
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

                      {/* Brand-Styled Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-50 print:hidden">
                        <button
                          onClick={() => handleBuyAgain(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white rounded-xl text-[8px] font-black uppercase tracking-tighter hover:bg-[#EA638C] transition-all shadow-md active:scale-95"
                        >
                          <Zap size={10} fill="currentColor" /> Buy Again
                        </button>
                        
                        {isDelivered && (
                          <Link
                            href={`/dashboard/reviews/new?productId=${item.productId?._id || item.productId}&orderId=${order._id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-[8px] font-black uppercase tracking-tighter hover:border-[#EA638C] hover:text-[#EA638C] transition-all shadow-sm active:scale-95"
                          >
                            <Star size={10} className="text-[#EA638C]" /> Review
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Address & Payment */}
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100">
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                  <MapPin size={14} /> Shipping To
                </h4>
                <p className="text-sm font-black text-gray-900">{order.shippingAddress?.name || order.name}</p>
                <p className="text-xs font-bold text-[#EA638C]">{order.shippingAddress?.phone || order.phone}</p>
                <p className="pt-2 text-[12px] font-medium text-gray-500 leading-relaxed">
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}
                </p>
              </div>

              <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden print:bg-white print:text-black print:shadow-none print:border print:border-gray-200">
                <div className="flex items-center gap-3 mb-6 opacity-40 print:opacity-100">
                  <ReceiptText size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white print:text-black">Financial Details</p>
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between text-gray-400 print:text-gray-500 text-[10px] font-black uppercase">
                    <span>Subtotal</span>
                    <span>৳{itemsSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 print:text-gray-500 text-[10px] font-black uppercase">
                    <span>Delivery</span>
                    <span>+ ৳{(order.deliveryCharge || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10 print:border-gray-200 text-white print:text-black text-[11px] font-black uppercase">
                    <span>Grand Total</span>
                    <span>৳{Number(order.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#EA638C] text-[11px] font-black uppercase italic">
                    <span>Paid Online</span>
                    <span>- ৳{Number(order.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-end justify-between pt-5 mt-4 border-t border-white/20 print:border-gray-200">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-1">
                        {isPartial ? "Cash on Delivery" : "Final Balance"}
                      </p>
                      <p className="text-4xl font-black text-white print:text-black">৳{Number(order.dueAmount || 0).toLocaleString()}</p>
                    </div>
                    {isPartial && (
                      <div className="p-3 bg-[#EA638C] rounded-2xl shadow-lg shadow-[#EA638C]/30 print:hidden">
                        <Wallet size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <button 
  onClick={() => window.print()} 
  className="relative mt-8 w-full group overflow-hidden print:hidden"
>
  {/* The Button Body */}
  <div className="flex items-center justify-center gap-3 py-5 bg-[#EA638C] text-white rounded-[2rem] transition-all duration-500 group-hover:bg-[#d54d76] group-active:scale-95 shadow-[0_10px_30px_-10px_rgba(234,99,140,0.5)]">
    <Download size={16} className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" />
    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
      Download Invoice
    </span>
    
    {/* Subtle Shine Effect on Hover */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
  </div>

  {/* Background glow behind the button */}
  <div className="absolute -inset-1 bg-[#EA638C] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}