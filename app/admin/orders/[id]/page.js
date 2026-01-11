"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrderStatus } from "@/actions/order";
import { 
  ArrowLeft, Printer, Truck, Package, User, MapPin, 
  CreditCard, Calendar, CheckCircle, Clock, ShieldCheck, 
  Phone, Mail, ChevronDown, Hash, Save, ExternalLink, XCircle, FileText
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

  // --- PDF GENERATOR (Product List Only) ---
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
      headStyles: { fillColor: [234, 99, 140], textColor: [255, 255, 255], fontStyle: 'bold' }, // #EA638C
      styles: { fontSize: 9 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Payable: Tk ${order.totalAmount.toLocaleString()}`, 140, finalY);

    doc.save(`Items_Order_${order._id.slice(-8)}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#EA638C] animate-pulse uppercase tracking-widest">
      Establishing Connection...
    </div>
  );

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-4 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-all border border-gray-100">
              <ArrowLeft size={20} className="text-[#3E442B]" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black uppercase italic tracking-tighter text-[#3E442B]">Order #{order._id.slice(-8)}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-[#EA638C]/10 text-[#EA638C] border-[#EA638C]/20'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Placed {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Download PDF Button */}
            <button 
              onClick={downloadProductList}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-[#EA638C] text-[#EA638C] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] hover:text-white transition-all shadow-sm"
            >
              <FileText size={16} /> Product List (PDF)
            </button>

            {/* Print Invoice */}
            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#EA638C] transition-all">
              <Printer size={16} /> Print
            </button>

            {/* Update Status Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#3E442B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] transition-all">
                Update Status <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 hidden group-hover:block z-50 overflow-hidden">
                {statusSteps.map((s) => (
                  <button key={s} onClick={() => handleStatusUpdate(s)} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase hover:bg-[#EA638C]/10 hover:text-[#EA638C] transition-colors border-b border-gray-50 last:border-0">
                    Mark as {s}
                  </button>
                ))}
                {order.status !== "Cancelled" && (
                   <button 
                    onClick={() => { if(confirm("Cancel order? Stock will be returned.")) handleStatusUpdate("Cancelled")}}
                    className="w-full text-left px-5 py-3 text-[10px] font-black uppercase bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                   >
                     Cancel Order
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- TRACKER --- */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              return (
                <div key={step} className="flex flex-1 items-center w-full relative">
                  <div className="flex flex-col items-center z-10 mx-auto">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${
                      isCompleted ? 'bg-[#3E442B] border-[#3E442B] text-white' : 'bg-white border-gray-100 text-gray-300'
                    }`}>
                      {isCompleted ? <CheckCircle size={18} /> : <Clock size={18} />}
                    </div>
                    <p className={`mt-3 text-[9px] font-black uppercase tracking-tighter ${isCompleted ? 'text-[#3E442B]' : 'text-gray-300'}`}>
                      {step}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`hidden md:block absolute left-[60%] right-[-40%] top-5 h-[2px] ${
                      index < currentStepIndex ? 'bg-[#3E442B]' : 'bg-gray-100'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- SHIPPING LOGISTICS --- */}
            {(order.status === "Shipped" || order.status === "Delivered") && (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-dashed border-[#EA638C]/30 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-[#EA638C] text-white rounded-2xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div className="flex-1 w-full">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Logistic Tracking</p>
                  {order.trackingNumber ? (
                    <div className="flex items-center gap-4 mt-1">
                      <h4 className="text-[14px] font-black uppercase text-[#3E442B] tracking-widest">{order.trackingNumber}</h4>
                      <button className="text-[#EA638C] hover:underline text-[9px] font-black uppercase flex items-center gap-1">
                        Track URL <ExternalLink size={10}/>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <input 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="ENTER TRACKING ID..."
                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-[10px] font-bold focus:ring-2 focus:ring-[#EA638C]/20"
                      />
                      <button onClick={handleSaveTracking} className="bg-[#3E442B] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-[#EA638C] transition-all">
                        <Save size={14}/> Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-[#3E442B]">Bag Items ({order.items.length})</h3>
                <Package size={18} className="text-[#EA638C]" />
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div key={i} className="px-8 py-6 flex items-center gap-6">
                    <img src={item.variant?.image || "/placeholder.png"} className="w-20 h-20 rounded-2xl object-cover border border-gray-100" />
                    <div className="flex-1">
                      <h4 className="text-[11px] font-black uppercase text-gray-900 truncate">{item.productName}</h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-1">Size: {item.variant?.size} | Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-gray-900">৳{item.price.toLocaleString()}</p>
                      <p className="text-[11px] font-black text-[#EA638C]">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50/50 px-8 py-8">
                <div className="flex justify-between text-[12px] font-black uppercase italic pt-4 border-t border-gray-200">
                  <span className="text-[#3E442B]">Grand Total</span>
                  <span className="text-[18px] text-[#EA638C]">৳{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 border-t-8 border-t-[#3E442B]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#EA638C]/10 flex items-center justify-center text-[#EA638C]">
                  <User size={20} />
                </div>
                <h3 className="text-[12px] font-black uppercase text-[#3E442B]">Customer</h3>
              </div>
              <div className="space-y-4 text-[10px] font-bold text-gray-700">
                <div className="flex items-center gap-3"><Mail size={14} className="text-[#EA638C]"/> {order.shippingAddress?.email || 'N/A'}</div>
                <div className="flex items-center gap-3"><Phone size={14} className="text-[#EA638C]"/> {order.shippingAddress?.phone}</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
              <div className="flex items-center gap-4 mb-6 text-[#3E442B]">
                <MapPin size={20} />
                <h3 className="text-[12px] font-black uppercase">Shipping Destination</h3>
              </div>
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 text-[10px] font-black uppercase leading-relaxed text-gray-900">
                {order.shippingAddress?.name}<br />
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