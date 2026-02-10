"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
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
  Download,
  Wallet,
  Zap,
  Star,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OrderDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params?.id;
  const router = useRouter();
  const { addToCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const getProductImage = (item) => {
    if (!item) return "/placeholder.png";
    if (item.variant?.image) return item.variant.image;
    if (item.product?.imageUrl) return item.product.imageUrl;
    return "/placeholder.png";
  };

  useEffect(() => {
    if (!id || id === "undefined" || id.length < 12) return;

    async function fetchOrder() {
      try {
        const data = await getOrderById(id);
        if (!data) setError(true);
        else setOrder(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    toast.success("Order ID Copied", {
      style: { background: "#3E442B", color: "#fff", fontSize: "12px", fontWeight: "bold", borderRadius: "12px" },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuyAgain = (item) => {
    try {
      const pId = item.product?._id || item.product;
      const displayImage = getProductImage(item);

      const productData = {
        _id: pId,
        name: item.productName || "Product",
        price: Number(item.price) || 0,
        imageUrl: displayImage,
        minOrderQuantity: item.product?.minOrderQuantity || 1,
      };

      const variantData = {
        _id: item.variant?.variantId || `std-${pId}`,
        price: Number(item.price) || 0,
        size: item.variant?.size || "Standard",
        color: item.variant?.name || "Default", // Mapping 'name' back to 'color' for Context
      };

      addToCart(productData, variantData, item.quantity || 1);
      toast.success(`${item.productName || "Item"} added!`, {
        style: { background: "#3E442B", color: "#fff" },
        iconTheme: { primary: "#EA638C", secondary: "#fff" },
      });
      router.push("/cart");
    } catch (err) {
      toast.error("Could not add to cart.");
    }
  };

  const itemsSubtotal = order?.items?.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0) || 0;
  const isDelivered = order?.status === "Delivered";

  const steps = [
    { label: "Placed", status: "Pending", icon: CalendarCheck },
    { label: "Processing", status: "Processing", icon: Loader2 },
    { label: "Shipped", status: "Shipped", icon: Truck },
    { label: "Delivered", status: "Delivered", icon: CheckCircle },
  ];

  const activeIndex = order?.status === "Cancelled" ? -1 : steps.findIndex((s) => s.status === order?.status);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px] mt-4">Loading your charms...</p>
    </div>
  );

  if (error || !order) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <p className="text-2xl italic font-black text-[#3E442B] uppercase">Order Missing</p>
      <Link href="/dashboard/orders" className="text-[#EA638C] text-sm font-black underline mt-4 uppercase">Back to History</Link>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="max-w-6xl px-4 pt-10 mx-auto">
        <Link href="/dashboard/orders" className="flex items-center gap-2 mb-8 text-[10px] font-black tracking-widest text-gray-400 uppercase hover:text-[#3E442B] transition-colors">
          <ArrowLeft size={14} /> Back to History
        </Link>

        <div className="bg-white p-6 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
          <div className="flex flex-col items-start justify-between gap-6 mb-16 md:flex-row md:items-center">
            <div>
              <h2 className="text-4xl italic font-black tracking-tighter text-[#3E442B] uppercase">Order Summary</h2>
              <div onClick={handleCopyId} className="flex items-center gap-2 mt-2 cursor-pointer group w-fit">
                <p className="text-[10px] font-black uppercase text-gray-400 group-hover:text-[#3E442B] transition-colors">
                  Order ID: <span className="text-gray-900">#{order._id.slice(-12).toUpperCase()}</span>
                </p>
                <div className="p-1 rounded-md bg-gray-50 group-hover:bg-[#FBB6E6] transition-colors">
                  {copied ? <Check size={10} className="text-green-600" /> : <Copy size={10} className="text-gray-400" />}
                </div>
              </div>
            </div>
            <div className={`px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] ${order.status === "Cancelled" ? "bg-red-50 text-red-500" : "bg-[#EA638C]/10 text-[#EA638C]"}`}>
              {order.status}
            </div>
          </div>

          {order.status !== "Cancelled" ? (
            <div className="relative flex justify-between max-w-3xl px-2 mx-auto mb-24">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isDone = index <= activeIndex;
                const isCurrent = index === activeIndex;
                return (
                  <div key={index} className="z-10 flex flex-col items-center">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 ${isDone ? "bg-[#EA638C] text-white shadow-xl shadow-[#EA638C]/30" : "bg-gray-100 text-gray-300"}`}>
                      <Icon size={22} className={isCurrent && step.status === "Processing" ? "animate-spin" : ""} />
                    </div>
                    <p className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-tighter ${isDone ? "text-[#3E442B]" : "text-gray-300"}`}>{step.label}</p>
                  </div>
                );
              })}
              <div className="absolute top-6 md:top-8 left-0 w-full h-[3px] bg-gray-50 -z-0 rounded-full">
                <div className="h-full bg-[#EA638C] transition-all duration-1000 ease-out" style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }} />
              </div>
            </div>
          ) : (
            <div className="p-6 mb-20 text-center border-2 border-dashed border-red-100 bg-red-50/50 rounded-[2rem]">
              <p className="text-xs font-black tracking-widest text-red-500 uppercase">Transaction Voided / Cancelled</p>
            </div>
          )}

          <div className="grid gap-16 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <h3 className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-4">
                <Package size={14} /> My Charms & Beads
              </h3>
              <div className="space-y-4">
                {order.items?.map((item, idx) => {
                  const pId = item.product?._id || item.product;
                  const displayImage = getProductImage(item);
                  
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-6 p-6 border border-gray-50 bg-gray-50/30 rounded-[2.5rem] transition-all hover:shadow-md">
                      <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden bg-white border border-gray-100 shadow-inner rounded-3xl">
                        <Image 
                          src={displayImage || "/placeholder.png"} 
                          alt={item.productName || "Ordered product"} 
                          fill 
                          className="object-cover" 
                          unoptimized 
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        {/* 🟢 FIXED: Now correctly displays item.productName */}
                        <p className="text-sm font-black text-[#3E442B] uppercase mb-1">
                          {item.productName || "Unnamed Product"}
                        </p>
                        
                        {/* 🟢 FIXED: Clean variant display (hides Default/NA) */}
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {item.variant?.name && item.variant.name !== "Default" ? `${item.variant.name} • ` : ""}
                          {item.variant?.size && item.variant.size !== "N/A" ? `${item.variant.size} • ` : ""}
                          Qty: {item.quantity || 1}
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-2 mt-4 sm:justify-start">
                          <button onClick={() => handleBuyAgain(item)} className="flex items-center gap-1.5 px-4 py-2 bg-[#3E442B] text-white rounded-xl text-[9px] font-black uppercase hover:bg-[#EA638C] transition-all active:scale-95">
                            <Zap size={12} fill="currentColor" /> Buy Again
                          </button>
                          {isDelivered && (
                            <Link href={`/dashboard/reviews/new?productId=${pId}&orderId=${order._id}`} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-[#3E442B] rounded-xl text-[9px] font-black uppercase hover:border-[#EA638C]">
                              <Star size={12} className="text-[#EA638C]" /> Review
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-black text-[#3E442B]">
                        ৳{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-6 flex items-center gap-2 tracking-widest">
                  <MapPin size={14} /> Shipping Destination
                </h4>
                <p className="text-md font-black text-[#3E442B] mb-1">{order.shippingAddress?.name || order.name}</p>
                <p className="text-xs font-bold text-[#EA638C] mb-4">{order.shippingAddress?.phone || order.phone}</p>
                <p className="text-[12px] font-medium text-gray-500 leading-relaxed italic border-t border-gray-50 pt-4">
                  {order.shippingAddress?.street},<br /> {order.shippingAddress?.city}
                </p>
              </div>

              <div className="bg-[#3E442B] text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="pb-8 mb-8 space-y-4 border-b border-white/10">
                    <div className="flex justify-between text-[11px] font-black uppercase text-gray-400">
                      <span>Subtotal</span>
                      <span>৳{itemsSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase text-gray-400">
                      <span>Shipping Fee</span>
                      <span>+ ৳{(order.deliveryCharge || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#FBB6E6] text-[11px] font-black uppercase tracking-tighter italic">
                      <span>Online Payment</span>
                      <span>- ৳{Number(order.paidAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Due</p>
                      <p className="text-5xl font-black tracking-tighter text-white">৳{Number(order.dueAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-[#EA638C] rounded-[1.5rem] shadow-xl shadow-[#EA638C]/20">
                      <Wallet size={28} />
                    </div>
                  </div>
                  <button onClick={() => window.print()} className="w-full mt-10 flex items-center justify-center gap-3 py-5 bg-[#EA638C] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#d54d76] shadow-xl shadow-[#EA638C]/40">
                    <Download size={16} /> Download Invoice
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EA638C]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}