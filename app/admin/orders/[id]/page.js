"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrderStatus } from "@/actions/order";
import { 
  ArrowLeft, Printer, Truck, Package, User, MapPin, 
  Calendar, CheckCircle, Clock, 
  Phone, Mail, ChevronDown, Save, ExternalLink, FileText, ShoppingBag
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const statusSteps = ["Pending", "Processing", "Shipped", "Delivered"];

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

  const downloadProductList = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(62, 68, 43); // #3E442B
    doc.text("PRODUCT PACKING LIST", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Order ID: #${order._id.slice(-8)}`, 14, 30);
    doc.text(`Generation Date: ${new Date().toLocaleString()}`, 14, 35);

    const tableColumn = ["#", "Product Item", "Variant / Size", "Qty", "Unit Price", "Subtotal"];
    const tableRows = [];

    order.items.forEach((item, index) => {
      tableRows.push([
        index + 1,
        item.productName,
        item.variant?.name || "Standard",
        item.quantity,
        `Tk ${item.price.toLocaleString()}`,
        `Tk ${(item.price * item.quantity).toLocaleString()}`,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [234, 99, 140], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Payable: Tk ${order.totalAmount.toLocaleString()}`, 140, finalY);

    doc.save(`Items_Order_${order._id.slice(-8)}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-12 h-12 border-4 border-[#EA638C] border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-[10px] font-black text-[#3E442B] uppercase tracking-[0.3em]">Establishing Connection...</h2>
    </div>
  );

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-4 md:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
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
                <h3 className="text-xs font-black uppercase tracking-widest text-[#3E442B]">Bag Contents ({order.items.length})</h3>
                <Package size={18} className="text-[#EA638C]" />
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-8 px-10 py-8 group">
                    <div className="relative">
                      <img 
                        src={item.variant?.image || item.productImage || "/placeholder.png"} 
                        className="w-24 h-24 object-cover rounded-[2rem] border-2 border-gray-100 shadow-sm transition-transform group-hover:scale-105" 
                        onError={(e) => e.target.src = "/placeholder.png"}
                      />
                      <div className="absolute -top-2 -right-2 bg-[#EA638C] text-white text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black uppercase text-[#3E442B] tracking-tight">{item.productName}</h4>
                      <p className="text-[9px] font-black text-gray-300 uppercase mt-1">
                        Size: <span className="text-[#EA638C]">{item.variant?.size || "STD"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 line-through">৳{item.price.toLocaleString()}</p>
                      <p className="text-sm font-black text-[#3E442B]">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-10 py-8 bg-[#3E442B] text-white flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Grand Total</span>
                <span className="text-2xl font-black italic">৳{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#FBB6E6] text-[#EA638C] flex items-center justify-center"><User size={20} /></div>
                  <h3 className="text-xs font-black uppercase text-[#3E442B]">Customer</h3>
                </div>
                <div className="space-y-4">
                   <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                      <Mail size={14} className="text-[#EA638C]"/>
                      <span className="text-[10px] font-black text-[#3E442B] truncate">{order.shippingAddress?.email || 'Guest User'}</span>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                      <Phone size={14} className="text-[#EA638C]"/>
                      <span className="text-[10px] font-black text-[#3E442B]">{order.shippingAddress?.phone}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#3E442B] text-white flex items-center justify-center"><MapPin size={20} /></div>
                <h3 className="text-xs font-black uppercase text-[#3E442B]">Destination</h3>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-[11px] font-black uppercase leading-loose text-gray-500 italic">
                <span className="text-[#3E442B] not-italic text-sm block mb-1">{order.shippingAddress?.name}</span>
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}