"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, 
  MessageSquare, 
  MapPin, 
  Printer, 
  Wallet, 
  Truck, 
  Copy, 
  Check, 
  Info, 
  CreditCard, 
  Hash, 
  ShieldCheck, 
  Loader2, 
  RefreshCw,
  PhoneCall,
  User,
  ZoomIn
} from "lucide-react";
import toast from "react-hot-toast";

// Brand Colors: Green: #3E442B | Pink: #EA638C | lightPink: #FBB6E6

export default function OrderDetailsModal({ order, onClose }) {
  const [includePrice, setIncludePrice] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedPopupAddress, setCopiedPopupAddress] = useState(false);
  const [showShipToTooltip, setShowShipToTooltip] = useState(false);
  
  // State for Image Popup
  const [selectedImage, setSelectedImage] = useState(null);

  // Audio Context Ref for playing sound effects without external files
  const audioCtxRef = useRef(null);

  // Pathao Tracking State
  const [pathaoData, setPathaoData] = useState(null);
  const [loadingPathao, setLoadingPathao] = useState(false);

  // Sound generator function (UI Pop effect)
  const playPopSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.error("Audio play error:", e);
    }
  };

  const handleShipToHover = (isHovered) => {
    setShowShipToTooltip(isHovered);
    if (isHovered) {
      playPopSound();
    }
  };

  const fetchPathaoStatus = async () => {
    if (!order?.trackingNumber) return;
    setLoadingPathao(true);
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consignmentId: order.trackingNumber }),
      });
      const result = await res.json();
      if (result.success) setPathaoData(result.data);
    } catch (err) {
      console.error("Pathao Modal Sync Error:", err);
    } finally {
      setLoadingPathao(false);
    }
  };

  useEffect(() => {
    fetchPathaoStatus();
  }, [order?.trackingNumber]);

  if (!order) return null;

  const getItemImage = (item) => {
    return (
      item.variant?.image ||
      item.variant?.img ||
      item.variant?.thumbnail ||
      item.variantImage ||
      item.selectedVariant?.image ||
      item.image ||
      item.productImage ||
      item.thumbnail ||
      item.product?.imageUrl ||
      item.product?.image ||
      "/placeholder.png"
    );
  };

  const getItemVariantName = (item) => {
    if (typeof item.variant === "string") return item.variant;
    return item.variant?.name || item.variant?.size || item.color || "Standard";
  };

  const paymentDetails = order.paymentDetails || {};

  const transactionId = paymentDetails.transactionId || order.tran_id || order.transactionId || "";
  const senderPhone = paymentDetails.sourcePhone || paymentDetails.source || "";

  const subtotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const deliveryCharge = order.deliveryCharge || 0;
  const mfsFee = order.mobileBankingFee || 0; 
  
  const totalAmount = order.totalAmount || (subtotal + deliveryCharge + mfsFee);
  const paidAmount = order.paidAmount || 0;
  const dueAmount = order.dueAmount !== undefined ? order.dueAmount : (totalAmount - paidAmount);
  const isPartial = dueAmount > 0;

  const netRevenue = totalAmount - mfsFee;

  const handleCopyAddress = (e) => {
    if (e) e.stopPropagation();
    const name = order.shippingAddress?.name || "";
    const phone = order.shippingAddress?.phone || "";
    const street = order.shippingAddress?.street || order.shippingAddress?.address || "";
    const city = order.shippingAddress?.city || "";
    
    const text = `${name}\n${phone}\n${street}${city ? `, ${city}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedPopupAddress(true);
    toast.success("Customer address copied!");
    setTimeout(() => {
      setCopied(false);
      setCopiedPopupAddress(false);
    }, 2000);
  };

  const handleCopyTxn = () => {
    if (!transactionId) return;
    navigator.clipboard.writeText(transactionId);
    setCopiedTxn(true);
    toast.success("Transaction ID copied!");
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handleCopyPhone = () => {
    if (!senderPhone) return;
    navigator.clipboard.writeText(senderPhone);
    setCopiedPhone(true);
    toast.success("Sender phone copied!");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleWhatsApp = () => {
    const num = order.shippingAddress?.phone?.replace(/\D/g, "");
    if (num) window.open(`https://wa.me/${num}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-[#3E442B]/40 backdrop-blur-md" onClick={onClose} />
      
      {/* MODAL MAIN CONTAINER */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-white/20 my-auto z-10 overflow-hidden">
        
        {/* HEADER */}
        <div className="flex-shrink-0 h-12 sm:h-14 bg-[#3E442B] flex items-center justify-between px-4 sm:px-6">
          <h2 className="text-[9px] sm:text-[10px] font-black text-white uppercase italic tracking-widest">
            Order <span className="text-[#EA638C]">Analytics</span>
          </h2>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 sm:px-3 py-1 rounded-full">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${!isPartial ? 'bg-green-400' : 'bg-[#FBB6E6]'}`}></span>
              <span className="text-[7px] font-black text-white uppercase tracking-tighter">
                {order.paymentStatus || (!isPartial ? "Paid" : "Pending")}
              </span>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-[#EA638C] transition-all p-1">
              <X size={18}/>
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* CUSTOMER & TOGGLE BAR */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 bg-gray-50/50 gap-2">
             <div className="leading-tight min-w-0 flex-1">
                <p className="text-[10px] font-black text-[#3E442B] uppercase truncate">{order.shippingAddress?.name || "Customer"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] font-bold text-gray-400 truncate">{order.shippingAddress?.phone || "N/A"}</span>
                  {order.shippingAddress?.phone && (
                    <button onClick={handleWhatsApp} className="text-green-600 transition-transform hover:scale-110 shrink-0">
                      <MessageSquare size={12} />
                    </button>
                  )}
                </div>
             </div>
             
             <div className="flex p-0.5 bg-white border border-gray-200 rounded-lg h-fit shrink-0">
                <button 
                  onClick={() => setIncludePrice(true)} 
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[7px] font-black uppercase transition-all ${includePrice ? 'bg-[#3E442B] text-white shadow-sm' : 'text-gray-400'}`}
                >
                  Invoice
                </button>
                <button 
                  onClick={() => setIncludePrice(false)} 
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[7px] font-black uppercase transition-all ${!includePrice ? 'bg-[#3E442B] text-white shadow-sm' : 'text-gray-400'}`}
                >
                  Pack
                </button>
             </div>
          </div>

          {/* BANGLA QR & PAYMENT INFO BAR */}
          <div className="flex flex-col gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-[#F3FDF5] border-b border-green-100">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CreditCard size={12} className="text-[#3E442B] shrink-0" />
                <span className="text-[8px] sm:text-[9px] font-black text-[#3E442B] uppercase">
                  Method: {order.paymentMethod || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck size={11} className="text-green-600 shrink-0" />
                <span className="text-[7px] sm:text-[8px] font-black text-green-700 uppercase">
                  {paymentDetails.gatewayStatus || order.paymentStatus || "Verified Gateway"}
                </span>
              </div>
            </div>

            {(transactionId || senderPhone) && (
              <div className="flex items-center justify-between text-[8px] font-bold text-[#3E442B]/80 pt-1 border-t border-green-200/50 flex-wrap gap-1">
                {transactionId ? (
                  <div 
                    onClick={handleCopyTxn}
                    title="Click to copy Transaction ID"
                    className="flex items-center gap-1 font-mono font-black text-[#EA638C] px-2 py-0.5 sm:py-1 rounded-lg cursor-pointer bg-white/40 border border-transparent hover:border-[#EA638C]/30 hover:bg-white hover:shadow-md hover:scale-105 origin-left transition-all duration-200 ease-out"
                  >
                    <Hash size={10} className="text-[#3E442B]/50 shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">TXN: {transactionId}</span>
                    {copiedTxn ? <Check size={10} className="text-green-500 ml-0.5 shrink-0" /> : <Copy size={9} className="text-gray-300 ml-0.5 shrink-0" />}
                  </div>
                ) : <span />}

                {senderPhone ? (
                  <div 
                    onClick={handleCopyPhone}
                    title="Click to copy Sender Phone"
                    className="flex items-center gap-1 text-gray-600 font-semibold ml-auto px-2 py-0.5 sm:py-1 rounded-lg cursor-pointer bg-white/40 border border-transparent hover:border-[#3E442B]/20 hover:bg-white hover:shadow-md hover:scale-105 origin-right transition-all duration-200 ease-out"
                  >
                    <PhoneCall size={10} className="text-[#EA638C] shrink-0" />
                    <span>Sender: {senderPhone}</span>
                    {copiedPhone ? <Check size={10} className="text-green-500 ml-0.5 shrink-0" /> : <Copy size={9} className="text-gray-300 ml-0.5 shrink-0" />}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* LOGISTICS INTELLIGENCE (Pathao Integration) */}
          {order.trackingNumber && (
            <div className="px-4 sm:px-6 py-2 bg-white border-b border-gray-50">
              <div className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#EA638C]/10 text-[#EA638C] rounded-lg shrink-0">
                    <Truck size={12} />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Live Courier Status</p>
                    <p className="text-[8px] sm:text-[9px] font-black text-[#3E442B] uppercase flex items-center gap-2">
                      {loadingPathao ? <Loader2 size={10} className="animate-spin" /> : (pathaoData?.order_status || "Checking...")}
                    </p>
                  </div>
                </div>
                <button onClick={fetchPathaoStatus} className="p-1.5 text-gray-300 hover:text-[#3E442B] transition-colors shrink-0">
                  <RefreshCw size={12} className={loadingPathao ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          )}

          {/* COURIER UTILITY BAR */}
          <div className="flex justify-end px-4 sm:px-6 py-1 bg-white border-b border-gray-50">
            <button 
              onClick={handleCopyAddress}
              className="flex items-center gap-1.5 text-[8px] font-black uppercase hover:text-[#EA638C] transition-all text-[#3E442B]/60 py-0.5"
            >
              {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
              {copied ? "Copied" : "Copy for Courier"}
            </button>
          </div>

          {/* PRODUCT LIST */}
          <div className="p-3 sm:p-4 bg-white">
             <div className="space-y-2">
               {order.items?.map((item, i) => {
                 const variantImg = getItemImage(item);
                 const variantName = getItemVariantName(item);

                 return (
                   <div key={i} className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 border border-gray-100 rounded-xl sm:rounded-2xl bg-gray-50/40 hover:border-[#EA638C]/30 transition-all">
                      
                      {/* CLICKABLE VARIANT IMAGE */}
                      <div 
                        onClick={() => setSelectedImage(variantImg)}
                        className="relative flex-shrink-0 w-12 sm:w-14 h-12 sm:h-14 border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center cursor-pointer group/img"
                      >
                        <img 
                          src={variantImg} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110" 
                          alt={item.productName || item.product?.name || "product"} 
                          onError={(e) => { e.target.src = "/placeholder.png"; }}
                        />
                        <div className="absolute inset-0 bg-[#3E442B]/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn size={14} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase text-[#3E442B] truncate leading-tight">
                          {item.productName || item.product?.name || item.name}
                        </p>
                        
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 flex-wrap">
                          <span className="px-1.5 sm:px-2 py-0.5 bg-[#FBB6E6]/30 text-[#EA638C] border border-[#FBB6E6] text-[6.5px] sm:text-[7px] font-black uppercase rounded-md">
                            Variant: {variantName}
                          </span>
                          <span className="text-[7.5px] sm:text-[8px] font-bold text-gray-400 uppercase">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      {includePrice && (
                        <p className="text-[10px] sm:text-[11px] font-black text-[#3E442B] shrink-0">
                          ৳{((item.price || 0) * item.quantity).toLocaleString()}
                        </p>
                      )}
                   </div>
                 );
               })}
             </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          {includePrice && (
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-b border-gray-100 bg-gray-50/80">
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] sm:text-[9px] font-bold uppercase text-gray-400">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[8px] sm:text-[9px] font-bold uppercase text-gray-400">
                  <span className="flex items-center gap-1"><Truck size={10}/> Delivery</span>
                  <span>+ ৳{deliveryCharge.toLocaleString()}</span>
                </div>

                {mfsFee > 0 && (
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-bold uppercase text-[#EA638C]">
                    <span className="flex items-center gap-1 font-black underline decoration-dotted underline-offset-2">
                      <CreditCard size={10}/> MFS Fee
                    </span>
                    <span>+ ৳{mfsFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-[7.5px] sm:text-[8px] font-bold uppercase text-gray-300 italic">
                  <span className="flex items-center gap-1"><Info size={9}/> Estimated Net</span>
                  <span>৳{netRevenue.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase text-[#3E442B] pt-1 border-t border-dashed border-gray-300">
                  <span>Grand Total</span>
                  <span>৳{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[8px] sm:text-[9px] font-bold uppercase text-green-600">
                  <span className="flex items-center gap-1"><Wallet size={10}/> Paid Amount</span>
                  <span>- ৳{paidAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER & ACTUAL DUE */}
          <div className="p-3 sm:p-4 bg-white">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                 {/* SHIP TO SECTION WITH COPY FEATURE */}
                 <div 
                   className="relative max-w-[130px] sm:max-w-[170px] cursor-pointer group"
                   onMouseEnter={() => handleShipToHover(true)}
                   onMouseLeave={() => handleShipToHover(false)}
                   onTouchStart={() => handleShipToHover(!showShipToTooltip)}
                 >
                    {/* CUSTOMER POPUP CARD WITH DEDICATED COPY BUTTON */}
                    <div 
                      className={`absolute bottom-full left-0 mb-2 sm:mb-3 w-56 sm:w-64 p-3 sm:p-3.5 bg-[#3E442B] text-white rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 origin-bottom-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[200] ${
                        showShipToTooltip 
                          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                          : "opacity-0 scale-90 translate-y-3 pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                        <span className="text-[7.5px] sm:text-[8px] font-black text-[#EA638C] uppercase tracking-wider flex items-center gap-1">
                          <User size={10} /> Full Delivery Profile
                        </span>
                        <button 
                          onClick={handleCopyAddress}
                          className="flex items-center gap-1 px-2 py-0.5 bg-[#EA638C] hover:bg-[#EA638C]/80 text-white text-[7px] font-black uppercase rounded-md transition-all active:scale-95 shadow-sm"
                        >
                          {copiedPopupAddress ? <Check size={8} /> : <Copy size={8} />}
                          <span>{copiedPopupAddress ? "Copied" : "Copy Addr"}</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 text-[8.5px] sm:text-[9px]">
                        <div>
                          <p className="text-[6.5px] sm:text-[7px] text-gray-300 uppercase font-extrabold">Name</p>
                          <p className="font-black text-white truncate">{order.shippingAddress?.name || "Customer"}</p>
                        </div>

                        <div>
                          <p className="text-[6.5px] sm:text-[7px] text-gray-300 uppercase font-extrabold">Phone</p>
                          <p className="font-bold text-[#FBB6E6]">{order.shippingAddress?.phone || "N/A"}</p>
                        </div>

                        <div>
                          <p className="text-[6.5px] sm:text-[7px] text-gray-300 uppercase font-extrabold">Address</p>
                          <p className="font-medium text-white/90 leading-tight">
                            {order.shippingAddress?.street || order.shippingAddress?.address || "N/A"}
                          </p>
                        </div>

                        {order.shippingAddress?.city && (
                          <div>
                            <p className="text-[6.5px] sm:text-[7px] text-gray-300 uppercase font-extrabold">City / Region</p>
                            <p className="font-semibold text-white/80">{order.shippingAddress?.city}</p>
                          </div>
                        )}
                      </div>

                      {/* Popup Arrow Tail */}
                      <div className="absolute top-full left-4 sm:left-5 border-8 border-transparent border-t-[#3E442B]" />
                    </div>

                    {/* SHIP TO DISPLAY WITH CLICK TO COPY ICON */}
                    <div className="flex items-center justify-between">
                      <p className="text-[6.5px] sm:text-[7px] font-black text-[#EA638C] uppercase mb-0.5 flex items-center gap-1 group-hover:text-[#3E442B] transition-colors">
                        <MapPin size={8}/> Ship To <span className="text-[5.5px] sm:text-[6px] text-gray-400 font-normal ml-0.5">(hover)</span>
                      </p>
                      <button 
                        onClick={handleCopyAddress} 
                        title="Copy Address"
                        className="text-gray-400 hover:text-[#EA638C] transition-colors p-0.5"
                      >
                        {copied ? <Check size={10} className="text-green-500" /> : <Copy size={9} />}
                      </button>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black text-[#3E442B] uppercase leading-tight truncate">
                      {order.shippingAddress?.name || "Customer"}
                    </p>
                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase leading-tight truncate mt-0.5">
                      {order.shippingAddress?.street || order.shippingAddress?.address || "N/A"}
                    </p>
                    <p className="text-[7.5px] sm:text-[8px] font-bold text-gray-300 uppercase mt-0.5">
                      {order.shippingAddress?.city || ""}
                    </p>
                 </div>
                 
                 <div className={`p-2 sm:p-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl text-right min-w-[120px] sm:min-w-[140px] shadow-lg border-b-4 ${isPartial ? 'bg-[#EA638C] border-[#3E442B]' : 'bg-[#3E442B] border-[#EA638C]'}`}>
                    <p className="text-[6.5px] sm:text-[7px] font-black text-white/70 uppercase leading-none mb-1">
                       {isPartial ? "Balance Due (COD)" : "Fully Paid"}
                    </p>
                    <p className="text-lg sm:text-xl italic font-black leading-none tracking-tighter text-white">
                       ৳{dueAmount.toLocaleString()}
                    </p>
                 </div>
              </div>
          </div>
        </div>

        {/* PINNED BOTTOM ACTIONS BAR */}
        <div className="sticky bottom-0 z-20 flex flex-row shrink-0 gap-2 p-3 sm:p-4 border-t bg-gray-50 print:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button onClick={() => window.print()} className="flex-1 bg-[#EA638C] text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#3E442B] transition-all active:scale-95 shadow-md">
            <Printer size={14} /> Print {includePrice ? "Invoice" : "Packing Slip"}
          </button>
          <button onClick={onClose} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-200 text-[#3E442B] rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase hover:bg-gray-100 transition-all active:scale-95">Close</button>
        </div>

      </div>

      {/* 🖼️ IMAGE PREVIEW POPUP MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-white rounded-3xl p-2 shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-[#3E442B]/80 hover:bg-[#EA638C] text-white rounded-full transition-all active:scale-90 shadow-md backdrop-blur-md"
            >
              <X size={18} />
            </button>

            {/* HIGH RES IMAGE */}
            <div className="relative w-full h-auto max-h-[75vh] flex items-center justify-center bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Variant Preview" 
                className="w-full h-full object-contain max-h-[75vh]"
                onError={(e) => { e.target.src = "/placeholder.png"; }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}