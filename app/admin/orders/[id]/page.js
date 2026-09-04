"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrderStatus } from "@/actions/order";
import { 
  ArrowLeft, Printer, Truck, Package, User, MapPin, 
  CheckCircle, Clock, 
  Phone, Mail, ChevronDown, FileText, ShoppingBag, Loader2, RefreshCw,
  CreditCard, Hash, ShieldCheck, Wallet, PhoneCall, ExternalLink
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Brand Colors: Green: #3E442B | Pink: #EA638C | lightPink: #FBB6E6

const statusSteps = ["Pending", "Processing", "Shipped", "Delivered"];

// 🟢 Pathao Live Status Component
const PathaoLiveIntelligence = ({ trackingId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPathaoStatus = async () => {
    if (!trackingId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consignmentId: trackingId }),
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error("Pathao Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPathaoStatus();
  }, [trackingId]);

  if (!trackingId) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-[#EA638C]/10 mb-8 overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#3E442B] text-white rounded-xl shadow-lg shadow-[#3E442B]/20">
            <Truck size={18} />
          </div>
          <h3 className="text-[10px] font-black uppercase text-[#3E442B] tracking-widest">Courier Intelligence</h3>
        </div>
        <button 
          onClick={fetchPathaoStatus} 
          disabled={loading}
          className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-100"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-2">
          <Loader2 size={14} className="animate-spin text-[#EA638C]" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Syncing with Pathao Servers...</span>
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 bg-gray-50 rounded-2xl">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1 tracking-widest">Current Status</p>
            <p className="text-[11px] font-black text-[#EA638C] uppercase">{data.order_status || "Unknown"}</p>
          </div>
          <div className="p-4 border border-gray-100 bg-gray-50 rounded-2xl">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1 tracking-widest">Last Update</p>
            <p className="text-[10px] font-bold text-[#3E442B]">{data.updated_at || "Waiting for scan..."}</p>
          </div>
        </div>
      ) : (
        <p className="text-[9px] font-bold text-gray-300 italic uppercase">Logistics data currently unavailable...</p>
      )}
    </div>
  );
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    try {
      const data = await getOrderById(id);
      if (!data) {
        toast.error("Order not found");
        return router.push("/admin/orders");
      }
      setOrder(data);
      setTrackingNumber(data.trackingNumber || "");
    } catch (error) {
      toast.error("Error fetching order");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    const res = await updateOrderStatus(id, newStatus);
    if (res.success) {
      toast.success(`Order status: ${newStatus}`);
      fetchOrder();
    }
  };

  const handleSaveTracking = async () => {
    const res = await updateOrderStatus(id, order.status, trackingNumber);
    if (res.success) {
      toast.success("Tracking number updated");
      fetchOrder();
    }
  };

  const getItemImage = (item) => {
    return (
      item.variant?.image ||
      item.variant?.img ||
      item.productImage ||
      item.product?.imageUrl ||
      "/placeholder.png"
    );
  };

  const getItemVariantName = (item) => {
    if (typeof item.variant === "string") return item.variant;
    return item.variant?.name || item.variant?.size || "Standard";
  };

  const downloadProductList = () => {
    if (!order) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(62, 68, 43); 
    doc.text("PRODUCT PACKING LIST", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Order ID: #${order._id.slice(-8)}`, 14, 30);
    doc.text(`Customer: ${customerName}`, 14, 35);
    doc.text(`Generation Date: ${new Date().toLocaleString()}`, 14, 40);

    const tableColumn = ["#", "Product Item", "Variant / Size", "Qty", "Unit Price", "Subtotal"];
    const tableRows = [];

    order.items?.forEach((item, index) => {
      tableRows.push([
        index + 1,
        item.productName || item.product?.name || "Product",
        getItemVariantName(item),
        item.quantity,
        `Tk ${(item.price || 0).toLocaleString()}`,
        `Tk ${((item.price || 0) * item.quantity).toLocaleString()}`,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 48,
      theme: 'grid',
      headStyles: { fillColor: [234, 99, 140], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });
const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Payable: Tk ${(order.totalAmount || 0).toLocaleString()}`, 140, finalY);

    doc.save(`Items_Order_${order._id.slice(-8)}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-12 h-12 border-4 border-[#EA638C] border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-[10px] font-black text-[#3E442B] uppercase tracking-[0.3em]">Establishing Connection...</h2>
    </div>
  );

  const currentStepIndex = statusSteps.indexOf(order.status);

  // Name Resolution (Check Shipping Address, User object, or top-level field)
  const customerName = 
    order.shippingAddress?.name || 
    order.shippingAddress?.fullName || 
    order.user?.name || 
    order.customerName || 
    "Guest Customer";

  // Financial calculations
  const paymentDetails = order.paymentDetails || {};
  const transactionId = paymentDetails.transactionId || order.tran_id || order.transactionId || "";
  const senderPhone = paymentDetails.sourcePhone || paymentDetails.source || "";
  
  const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const deliveryCharge = order.deliveryCharge || 0;
  const mfsFee = order.mobileBankingFee || 0;
  const grandTotal = order.totalAmount || (subtotal + deliveryCharge + mfsFee);
  const paidAmount = order.paidAmount || 0;
  const dueAmount = order.dueAmount !== undefined ? order.dueAmount : (grandTotal - paidAmount);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-4 md:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col justify-between gap-6 mb-12 md:flex-row md:items-end">
          <div>
            <Link href="/admin/orders" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#EA638C] transition-all mb-4">
              <ArrowLeft size={14} /> Back to Ledger
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#3E442B]">
                Order <span className="text-[#EA638C]">#{order._id.slice(-8)}</span>
              </h1>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-[#FBB6E6] text-[#EA638C] border-[#EA638C]/20'
              }`}>
                {order.status}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={downloadProductList} className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#EA638C] text-[#EA638C] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] hover:text-white transition-all">
              <FileText size={16} /> Product List
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
              <Printer size={16} /> Print
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#3E442B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] transition-all">
                Update <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 z-50 hidden w-48 mt-2 overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-2xl group-hover:block">
                {statusSteps.map((s) => (
                  <button key={s} onClick={() => handleStatusUpdate(s)} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase hover:bg-[#FBB6E6] transition-colors border-b border-gray-50 last:border-0">
                    Mark {s}
                  </button>
                ))}
                {order.status !== "Cancelled" && (
                  <button onClick={() => { if(confirm("Cancel order?")) handleStatusUpdate("Cancelled")}} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- TRACKER --- */}
        <div className="bg-[#3E442B] p-10 rounded-[3rem] shadow-2xl mb-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step} className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                      isCompleted ? 'bg-[#EA638C] border-[#EA638C] text-white shadow-lg shadow-[#EA638C]/40' : 'bg-white/5 border-white/10 text-white/20'
                    }`}>
                      {isCompleted ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-white/20'}`}>{step}</p>
                      <p className="text-[8px] font-bold text-white/40 uppercase">{isCurrent ? 'Current stage' : ''}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute -right-10 -bottom-10 text-white/5 opacity-10 rotate-12">
            <ShoppingBag size={220} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            
            {/* LIVE PATHAO INTELLIGENCE */}
            <PathaoLiveIntelligence trackingId={order.trackingNumber} />

            {/* LOGISTICS */}
            {(order.status === "Shipped" || order.status === "Delivered") && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-dashed border-[#EA638C]/30 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-[#FBB6E6] text-[#EA638C] rounded-2xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div className="flex-1 w-full">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Courier Tracking</p>
                  {order.trackingNumber ? (
                    <div className="flex items-center gap-4 mt-1">
                      <h4 className="text-xl font-black text-[#3E442B] tracking-tight">{order.trackingNumber}</h4>
                      <ExternalLink size={14} className="text-gray-300" />
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="ENTER ID..." className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-[10px] font-bold focus:ring-2 focus:ring-[#EA638C]/20" />
                      <button onClick={handleSaveTracking} className="bg-[#3E442B] text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-[#EA638C] transition-all">Save</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PACKAGE ITEMS */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/30">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#3E442B]">Bag Contents ({order.items?.length || 0})</h3>
                <Package size={18} className="text-[#EA638C]" />
              </div>
              <div className="divide-y divide-gray-50">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-8 px-10 py-8 group">
                    <div className="relative">
                      <img 
                        src={getItemImage(item)} 
                        className="w-24 h-24 object-cover rounded-[2rem] border-2 border-gray-100 shadow-sm transition-transform group-hover:scale-105" 
                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                        alt="Product Item"
                      />
                      <div className="absolute -top-2 -right-2 bg-[#EA638C] text-white text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black uppercase text-[#3E442B] tracking-tight">{item.productName || item.product?.name}</h4>
                      <p className="text-[9px] font-black text-gray-300 uppercase mt-1">
                        Variant / Size: <span className="text-[#EA638C]">{getItemVariantName(item)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 line-through">৳{(item.price || 0).toLocaleString()}</p>
                      <p className="text-sm font-black text-[#3E442B]">৳{((item.price || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* DETAILED FINANCIAL BREAKDOWN */}
              <div className="px-10 py-6 space-y-2 border-t border-gray-100 bg-gray-50/80">
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                  <span className="flex items-center gap-1"><Truck size={12} /> Shipping Charge</span>
                  <span>+ ৳{deliveryCharge.toLocaleString()}</span>
                </div>
                {mfsFee > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase text-[#EA638C]">
                    <span className="flex items-center gap-1"><CreditCard size={12} /> Mobile Banking Fee</span>
                    <span>+ ৳{mfsFee.toLocaleString()}</span>
                  </div>
                )}
                {paidAmount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase text-green-600">
                    <span className="flex items-center gap-1"><Wallet size={12} /> Amount Paid</span>
                    <span>- ৳{paidAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="px-10 py-8 bg-[#3E442B] text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 block">Grand Total</span>
                  {dueAmount > 0 && (
                    <span className="text-[9px] font-black uppercase text-[#FBB6E6] tracking-wider">
                      Balance Due (COD): ৳{dueAmount.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-2xl italic font-black">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* CUSTOMER INFO WITH PROMINENT NAME */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#FBB6E6] text-[#EA638C] flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-wider text-gray-400 uppercase">Customer</h3>
                    <p className="text-base font-black text-[#3E442B] uppercase tracking-tight">{customerName}</p>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <Mail size={14} className="text-[#EA638C]"/>
                      <span className="text-[10px] font-black text-[#3E442B] truncate">{order.shippingAddress?.email || order.user?.email || 'Guest User'}</span>
                   </div>
                   <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <Phone size={14} className="text-[#EA638C]"/>
                      <span className="text-[10px] font-black text-[#3E442B]">{order.shippingAddress?.phone || order.phone || 'N/A'}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* PAYMENT VERIFICATION & GATEWAY */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 text-green-600 rounded-2xl bg-green-50">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-[#3E442B]">Payment Info</h3>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">{order.paymentMethod || "N/A"}</p>
                </div>
              </div>

              <div className="p-4 space-y-2 border border-gray-100 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black text-gray-400 uppercase">Gateway Status</span>
                  <span className="text-[8px] font-black text-green-600 uppercase flex items-center gap-1">
                    <ShieldCheck size={10} /> {order.paymentStatus || "Verified"}
                  </span>
                </div>

                {transactionId && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-[8px] font-black text-gray-400 uppercase flex items-center gap-1"><Hash size={10} /> TXN ID</span>
                    <span className="text-[9px] font-mono font-black text-[#EA638C]">{transactionId}</span>
                  </div>
                )}

                {senderPhone && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[8px] font-black text-gray-400 uppercase flex items-center gap-1"><PhoneCall size={10} /> Sender</span>
                    <span className="text-[9px] font-bold text-[#3E442B]">{senderPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* DESTINATION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#3E442B] text-white flex items-center justify-center"><MapPin size={20} /></div>
                <h3 className="text-xs font-black uppercase text-[#3E442B]">Destination</h3>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-[11px] font-black uppercase leading-loose text-gray-500 italic">
                <span className="text-[#3E442B] not-italic text-sm block mb-1">{customerName}</span>
                {order.shippingAddress?.street || order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}{order.shippingAddress?.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );A
}