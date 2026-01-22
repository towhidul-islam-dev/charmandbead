"use client";

import { useState } from "react";
import Image from "next/image";
import { X, MessageSquare, MapPin, Printer, Wallet, Truck, Copy, Check, Info, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

// Brand Colors: Green: #3E442B | Pink: #EA638C | lightPink: #FBB6E6

export default function OrderDetailsModal({ order, onClose }) {
  const [includePrice, setIncludePrice] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  // 🟢 Logic synced with Schema & Success Page
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharge = order.deliveryCharge || 0;
  const mfsFee = order.mobileBankingFee || 0; // NEW FIELD
  
  // Total = Items + Delivery + Fee
  const totalAmount = order.totalAmount || (subtotal + deliveryCharge + mfsFee);
  const paidAmount = order.paidAmount || 0;
  const dueAmount = order.dueAmount || (totalAmount - paidAmount);
  const isPartial = dueAmount > 0;

  const handleCopyAddress = () => {
    const text = `${order.shippingAddress?.name}\n${order.shippingAddress?.phone}\n${order.shippingAddress?.street}, ${order.shippingAddress?.city}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Address copied for courier!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const num = order.shippingAddress?.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${num}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-[#3E442B]/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-white/20">
        
        {/* HEADER */}
        <div className="flex-shrink-0 h-14 bg-[#3E442B] flex items-center justify-between px-6">
          <h2 className="text-[10px] font-black text-white uppercase italic tracking-widest">
            Order <span className="text-[#EA638C]">Analytics</span>
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-[#EA638C] transition-all"><X size={18}/></button>
        </div>

        {/* CUSTOMER & TOGGLE BAR */}
        <div className="flex items-center justify-between flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
           <div className="leading-tight">
              <p className="text-[10px] font-black text-[#3E442B] uppercase truncate">{order.shippingAddress?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] font-bold text-gray-400">{order.shippingAddress?.phone}</span>
                <button onClick={handleWhatsApp} className="text-green-600 transition-transform hover:scale-110"><MessageSquare size={12} /></button>
              </div>
           </div>
           
           <div className="flex p-0.5 bg-white border border-gray-200 rounded-lg h-fit">
              <button 
                onClick={() => setIncludePrice(true)} 
                className={`px-3 py-1.5 rounded-md text-[7px] font-black uppercase transition-all ${includePrice ? 'bg-[#3E442B] text-white shadow-sm' : 'text-gray-400'}`}
              >
                Invoice
              </button>
              <button 
                onClick={() => setIncludePrice(false)} 
                className={`px-3 py-1.5 rounded-md text-[7px] font-black uppercase transition-all ${!includePrice ? 'bg-[#3E442B] text-white shadow-sm' : 'text-gray-400'}`}
              >
                Pack
              </button>
           </div>
        </div>

        {/* COURIER UTILITY BAR */}
        <div className="flex justify-end flex-shrink-0 px-6 py-2 bg-white">
          <button 
             onClick={handleCopyAddress}
             className="flex items-center gap-2 px-3 py-2 text-[8px] font-black uppercase hover:text-[#EA638C] transition-all text-[#3E442B]/50"
           >
             {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
             {copied ? "Copied" : "Copy for Courier"}
           </button>
        </div>

        {/* PRODUCT LIST */}
        <div className="flex-grow min-h-0 p-5 overflow-y-auto bg-white custom-scrollbar">
           <div className="space-y-1.5">
             {order.items.map((item, i) => (
               <div key={i} className="flex items-center gap-3 p-2 border border-gray-50 rounded-xl bg-gray-50/20">
                 <div className="relative flex-shrink-0 w-9 h-9">
                    <Image src={item.variant?.image || item.image || '/placeholder.png'} fill className="object-cover border border-white rounded-lg shadow-sm" alt="p" unoptimized />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-[9px] font-black uppercase text-[#3E442B] truncate">{item.productName || item.name}</p>
                   <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">{item.variant?.name || "Default"} • {item.variant?.size || "N/A"} × {item.quantity}</p>
                 </div>
                 {includePrice && <p className="text-[10px] font-black text-[#3E442B]">৳{(item.price * item.quantity).toLocaleString()}</p>}
               </div>
             ))}
           </div>
        </div>

        {/* FINANCIAL SUMMARY (Controlled by Toggle) */}
        {includePrice && (
          <div className="flex-shrink-0 px-8 py-4 border-t border-b border-gray-100 bg-gray-50">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold uppercase text-gray-400">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold uppercase text-gray-400">
                <span className="flex items-center gap-1"><Truck size={10}/> Delivery</span>
                <span>+ ৳{deliveryCharge.toLocaleString()}</span>
              </div>

              {/* 🟢 NEW: MFS FEE LINE */}
              {mfsFee > 0 && (
                <div className="flex justify-between text-[9px] font-bold uppercase text-[#EA638C]">
                  <span className="flex items-center gap-1"><CreditCard size={10}/> MFS Fee (1.5%)</span>
                  <span>+ ৳{mfsFee.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-[11px] font-black uppercase text-[#3E442B] pt-1 border-t border-dashed border-gray-300">
                <span>Grand Total</span>
                <span>৳{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold uppercase text-green-600">
                <span className="flex items-center gap-1"><Wallet size={10}/> Paid Amount</span>
                <span>- ৳{paidAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER & ACTUAL DUE */}
        <div className="flex-shrink-0 p-5 bg-white">
           <div className="flex items-center justify-between gap-4">
              <div className="max-w-[150px]">
                 <p className="text-[7px] font-black text-[#EA638C] uppercase mb-1 flex items-center gap-1"><MapPin size={8}/> Ship To</p>
                 <p className="text-[9px] font-bold text-[#3E442B] uppercase leading-tight">{order.shippingAddress?.street}</p>
                 <p className="text-[8px] font-bold text-gray-300 uppercase mt-0.5">{order.shippingAddress?.city}</p>
              </div>
              
              <div className={`p-3 px-5 rounded-2xl text-right min-w-[150px] shadow-lg border-b-4 ${isPartial ? 'bg-[#EA638C] border-[#3E442B]' : 'bg-[#3E442B] border-[#EA638C]'}`}>
                 <p className="text-[7px] font-black text-white/50 uppercase leading-none mb-1">
                   {isPartial ? "Balance Due (COD)" : "Fully Paid"}
                 </p>
                 <p className="text-2xl italic font-black leading-none tracking-tighter text-white">
                   ৳{dueAmount.toLocaleString()}
                 </p>
              </div>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-shrink-0 gap-2 p-5 border-t bg-gray-50 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-[#EA638C] text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#3E442B] transition-all active:scale-95 shadow-md">
            <Printer size={16} /> Print {includePrice ? "Invoice" : "Packing Slip"}
          </button>
          <button onClick={onClose} className="px-8 py-3.5 bg-white border border-gray-200 text-[#3E442B] rounded-2xl text-[10px] font-black uppercase hover:bg-gray-100 transition-all active:scale-95">Close</button>
        </div>
      </div>
    </div>
  );
}