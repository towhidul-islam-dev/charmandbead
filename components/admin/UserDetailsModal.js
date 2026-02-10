"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, Mail, Phone, MapPin, ShoppingBag, Clock, MessageSquare, Copy, Package,
  Zap, TrendingUp, ShieldCheck, Gift, Check, Eye 
} from "lucide-react";

export default function UserDetailsModal({ 
  user, orders = [], totalSpent = 0, lastGiftAt, lastGiftTitle, lastGiftValue 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [copiedPhone, setCopiedPhone] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const VIP_THRESHOLD = 10000;
  const isVIP = user.isVIP || totalSpent >= VIP_THRESHOLD;
  const progressPercentage = Math.min((totalSpent / VIP_THRESHOLD) * 100, 100);

  const userPhoneNumber = user.phone || user.addresses?.[0]?.phone || "No Phone Found";

  const displayImg = user.image 
    ? (user.image.startsWith('http') ? user.image : `https://res.cloudinary.com/diabqgzyo/image/upload/${user.image}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EA638C&color=fff&bold=true`;

  const toggleModal = () => { setIsOpen(!isOpen); setActiveTab("profile"); };

  const handleCopyPhone = () => {
    if (userPhoneNumber === "No Phone Found") return;
    navigator.clipboard.writeText(userPhoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleWhatsAppClick = () => {
    if (userPhoneNumber === "No Phone Found") return alert("No phone number found.");
    const cleanNumber = userPhoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Hello ${user.name}, this is the Admin.`)}`, "_blank");
  };

  // 🟢 YOUR EXACT ORIGINAL UI LOGIC
  const modalUI = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#3E442B]/20 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200 border border-white/20">
        
        {/* Compact Header */}
        <div className="relative h-28 bg-[#3E442B] flex flex-col justify-end p-5 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,#EA638C,transparent)]"></div>
          <div className="relative z-10 flex gap-5">
            <button onClick={() => setActiveTab("profile")} className={`text-[8px] font-black uppercase tracking-widest pb-2 transition-all ${activeTab === 'profile' ? 'text-[#EA638C] border-b-2 border-[#EA638C]' : 'text-white/40 border-b-2 border-transparent'}`}>Profile</button>
            <button onClick={() => setActiveTab("orders")} className={`text-[8px] font-black uppercase tracking-widest pb-2 transition-all ${activeTab === 'orders' ? 'text-[#EA638C] border-b-2 border-[#EA638C]' : 'text-white/40 border-b-2 border-transparent'}`}>History ({orders.length})</button>
          </div>
          <button onClick={toggleModal} className="absolute p-2 text-white transition-all rounded-full bg-white/10 hover:bg-[#EA638C] top-4 right-4"><X size={14} /></button>
        </div>

        <div className="p-5 max-h-[55vh] overflow-y-auto no-scrollbar">
          {activeTab === "profile" ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14">
                    <div className={`absolute inset-0 rounded-xl rotate-6 ${isVIP ? 'bg-yellow-100' : 'bg-[#EA638C]/10'}`}></div>
                    <img src={displayImg} className="relative object-cover w-full h-full bg-white border-2 border-white shadow-sm rounded-xl" alt={user.name} />
                    {isVIP && <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full border border-white z-20"><Zap size={8} fill="black" /></div>}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg italic font-black text-[#3E442B] uppercase leading-none">{user.name}</h3>
                    <p className="text-[7px] font-black text-[#EA638C] uppercase tracking-widest mt-1">{isVIP ? 'Pro VIP Member' : 'Regular Member'}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => {navigator.clipboard.writeText(user.email); alert("Email Copied!");}} className="p-2.5 text-gray-400 bg-gray-50 rounded-lg hover:bg-[#3E442B] hover:text-white transition-all" title="Copy Email"><Mail size={14} /></button>
                  <button onClick={handleWhatsAppClick} className="p-2.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-600 hover:text-white transition-all" title="WhatsApp Support"><MessageSquare size={14} /></button>
                </div>
              </div>

              {/* VIP Progress Bar */}
              <div className={`p-3 border rounded-2xl ${isVIP ? 'bg-yellow-50/50 border-yellow-100' : 'bg-[#EA638C]/5 border-[#EA638C]/10'}`}>
                <div className="flex items-end justify-between mb-1.5 text-[8px] font-black uppercase">
                  <p className={isVIP ? 'text-yellow-600' : 'text-[#EA638C]'}>{isVIP ? "VIP Active" : "VIP Progress"}</p>
                  <p className="text-[#3E442B]">{isVIP ? "MAX" : `${Math.round(progressPercentage)}%`}</p>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-1000 ${isVIP ? 'bg-yellow-400' : 'bg-[#EA638C]'}`} style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleCopyPhone}
                    className="relative p-3 overflow-hidden text-left transition-all bg-gray-50 rounded-xl hover:bg-gray-100 group"
                >
                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center justify-between">
                    Contact {copiedPhone ? <Check size={8} className="text-green-500" /> : <Copy size={8} className="opacity-0 group-hover:opacity-100" />}
                  </p>
                  <p className={`text-[10px] font-bold truncate ${userPhoneNumber === "No Phone Found" ? "text-gray-300 italic" : "text-[#3E442B]"}`}>
                    {userPhoneNumber}
                  </p>
                </button>
                <div className="p-3 border border-[#FBB6E6]/50 bg-[#FBB6E6]/10 rounded-xl relative overflow-hidden text-left">
                  <Gift className="absolute -right-1 -top-1 text-[#EA638C]/10 rotate-12" size={32} />
                  <p className="text-[7px] font-black text-[#EA638C] uppercase tracking-widest mb-0.5">Reward</p>
                  <p className="text-[10px] font-black text-[#3E442B] uppercase italic truncate">{lastGiftTitle || "None"}</p>
                  {lastGiftValue && <p className="text-[8px] font-bold text-[#EA638C] leading-none">{lastGiftValue}</p>}
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/30 text-left">
                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><MapPin size={8}/> Shipping Address</p>
                <p className="text-[10px] font-black text-[#3E442B] uppercase">
                    {user.addresses?.[0] 
                        ? `${user.addresses[0].street}, ${user.addresses[0].city}` 
                        : user.shippingAddress 
                            ? `${user.shippingAddress.street}, ${user.shippingAddress.city}` 
                            : "No address found"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 border border-gray-100 bg-gray-50 rounded-xl">
                  <p className="text-[7px] font-black text-gray-400 uppercase mb-0.5">Total Spent</p>
                  <p className="text-sm font-black text-[#3E442B]">৳{totalSpent.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-[#3E442B] rounded-xl text-white">
                  <p className="text-[7px] font-black text-white/40 uppercase mb-0.5">Orders</p>
                  <p className="text-sm font-black">{orders.length}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {orders.length === 0 ? (
                    <p className="text-[9px] text-center text-gray-400 uppercase py-10 font-black">No orders yet</p>
                ) : (
                    orders.slice(0, 10).map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl bg-white hover:border-[#EA638C] transition-colors">
                          <div className="flex items-center gap-2 text-left">
                            <ShoppingBag size={12} className="text-gray-300" />
                            <p className="text-[9px] font-black text-[#3E442B]">#{order._id.slice(-6).toUpperCase()}</p>
                          </div>
                          <p className="text-[9px] font-black text-[#3E442B]">৳{order.totalAmount?.toLocaleString()}</p>
                        </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <span className="text-[8px] font-black text-[#3E442B] uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#EA638C] rounded-full animate-pulse"></div> Session Profile</span>
          <button onClick={toggleModal} className="px-5 py-2.5 bg-[#3E442B] text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-[#EA638C] transition-all">Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 🟢 EYE ICON TRIGGER */}
      <button 
        onClick={toggleModal} 
        className="p-2.5 bg-gray-50 text-[#3E442B] hover:bg-[#FBB6E6] hover:text-[#EA638C] rounded-xl border border-gray-100 transition-all shadow-sm group"
      >
        <Eye size={16} className="transition-transform group-hover:scale-110" />
      </button>

      {/* 🟢 PORTAL FIX: Renders the UI at body level to prevent squashing */}
      {isOpen && mounted && createPortal(modalUI, document.body)}
    </>
  );
}