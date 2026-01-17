"use client";
import { useState } from "react";
import { 
  X, Mail, Phone, Calendar, MapPin, User as UserIcon, 
  ShoppingBag, CheckCircle2, Clock, MessageSquare, Copy, Package,
  Zap, TrendingUp, ShieldCheck
} from "lucide-react";

export default function UserDetailsModal({ user, orders = [], totalSpent = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // 🟢 LOGIC: Use the server-synced isVIP status or calculate based on threshold
  const VIP_THRESHOLD = 10000;
  const isVIP = user.isVIP || totalSpent >= VIP_THRESHOLD;
  const progressPercentage = Math.min((totalSpent / VIP_THRESHOLD) * 100, 100);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setActiveTab("profile");
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = user.addresses?.[0]?.phone;
    if (!phoneNumber) return alert("No phone number found.");
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const message = encodeURIComponent(`Hello ${user.name}, this is the Admin from the Wholesale Store regarding your account.`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  const handleCopy = (text) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    toast?.success("Copied to clipboard!") || alert("Copied!");
  };

  return (
    <>
      <button onClick={toggleModal} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100 hover:bg-black hover:text-white transition-all shadow-sm">
        View Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            
            {/* Header */}
            <div className="relative h-44 bg-[#1a1a1a] flex flex-col justify-end p-10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,#EA638C,transparent)]"></div>
              
              <div className="relative z-10 flex gap-8">
                <button onClick={() => setActiveTab("profile")} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 transition-all ${activeTab === 'profile' ? 'text-[#EA638C] border-b-2 border-[#EA638C]' : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'}`}>
                  Registry Detail
                </button>
                <button onClick={() => setActiveTab("orders")} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 transition-all ${activeTab === 'orders' ? 'text-[#EA638C] border-b-2 border-[#EA638C]' : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'}`}>
                  Transactions ({orders.length})
                </button>
              </div>
              <button onClick={toggleModal} className="absolute p-3 text-white transition-all rounded-full bg-white/10 hover:bg-red-500 top-6 right-6 hover:rotate-90"><X size={20} /></button>
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {activeTab === "profile" ? (
                <div className="space-y-8 duration-500 animate-in slide-in-from-bottom-4">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 group">
                        <div className={`absolute inset-0 transition-transform rounded-[2.5rem] rotate-6 group-hover:rotate-12 duration-300 ${isVIP ? 'bg-yellow-100' : 'bg-pink-100'}`}></div>
                        <div className="relative w-full h-full rounded-[2.5rem] border-4 border-white overflow-hidden bg-gray-100 flex items-center justify-center shadow-md">
                          {user.image ? <img src={user.image} className="object-cover w-full h-full" alt="" /> : <UserIcon size={40} className="text-gray-200" />}
                        </div>
                        {isVIP && <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full border-4 border-white shadow-sm"><Zap size={14} fill="black" /></div>}
                      </div>
                      <div>
                        <h3 className="mb-2 text-3xl italic font-black leading-none tracking-tighter text-gray-900 uppercase">{user.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-lg uppercase tracking-tighter">{user.role || 'Member'}</span>
                          {isVIP ? (
                            <span className="text-[10px] font-black bg-yellow-400 text-black px-2 py-1 rounded-lg uppercase tracking-tighter flex items-center gap-1">
                              <ShieldCheck size={10} /> PRO VIP
                            </span>
                          ) : (
                            <span className="text-[10px] font-black bg-pink-50 text-[#EA638C] px-2 py-1 rounded-lg uppercase tracking-tighter">REGULAR</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button onClick={() => handleCopy(user.addresses?.[0]?.phone || user.email)} className="flex flex-col items-center gap-2 group/copy">
                        <div className="p-4 text-gray-400 transition-all bg-gray-50 rounded-2xl group-hover/copy:bg-black group-hover/copy:text-white group-hover/copy:shadow-lg group-hover/copy:-translate-y-1">
                          <Copy size={20} />
                        </div>
                        <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Copy</span>
                      </button>

                      <button onClick={handleWhatsAppClick} className="relative flex flex-col items-center gap-2 group/wa">
                        <div className="absolute inset-0 transition-opacity bg-green-500 opacity-0 rounded-2xl blur-md group-hover/wa:opacity-40 group-hover/wa:animate-pulse"></div>
                        <div className="relative p-4 text-green-600 transition-all bg-green-50 rounded-2xl group-hover/wa:bg-green-600 group-hover/wa:text-white group-hover/wa:animate-bounce group-hover/wa:shadow-lg group-hover/wa:-translate-y-1">
                          <MessageSquare size={24} />
                        </div>
                        <span className="text-[8px] font-black uppercase text-green-600 tracking-widest">WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* 🟢 DYNAMIC VIP PROGRESS TRACKER */}
                  <div className={`p-6 border rounded-[2rem] ${isVIP ? 'bg-yellow-50/50 border-yellow-100' : 'bg-pink-50/30 border-pink-100'}`}>
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isVIP ? 'text-yellow-600' : 'text-[#EA638C]'}`}>
                          {isVIP ? <Zap size={14} fill="currentColor" /> : <TrendingUp size={14} />} 
                          {isVIP ? "VIP Status Active" : "VIP Progression"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-gray-500">
                          {isVIP 
                            ? "Enjoying lifetime 5% discount on all wholesale orders." 
                            : `৳${(VIP_THRESHOLD - totalSpent).toLocaleString()} more for lifetime 5% discount.`}
                        </p>
                      </div>
                      <p className="text-xs font-black text-gray-900">{isVIP ? "MAXED" : `${Math.round(progressPercentage)}%`}</p>
                    </div>
                    <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${isVIP ? 'bg-yellow-400' : 'bg-[#EA638C]'}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-5 transition-colors border border-transparent bg-gray-50 rounded-3xl hover:border-gray-100">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Registry</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                      </div>
                      <div className="p-5 transition-colors border border-transparent bg-gray-50 rounded-3xl hover:border-gray-100">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Direct Contact</p>
                        <p className="text-sm font-bold text-gray-800">{user.addresses?.[0]?.phone || "Not Set"}</p>
                      </div>
                    </div>
                    <div className="p-6 border border-gray-100 rounded-[2.5rem] bg-gray-50/30 flex flex-col justify-center">
                       <MapPin className="mb-2 text-gray-200" size={24} />
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipping Base</p>
                       {user.addresses?.[0] ? (
                         <p className="text-sm font-black leading-tight tracking-tighter text-gray-800 uppercase">
                            {user.addresses[0].street}<br/>
                            <span className="text-gray-400">{user.addresses[0].city}</span>
                         </p>
                       ) : <p className="text-xs italic font-bold text-gray-300">No Address Registry Found</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 duration-500 animate-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] text-center border border-gray-100 shadow-inner">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Lifetime Volume</p>
                      <p className="text-4xl italic font-black tracking-tighter text-gray-900">৳{totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="p-8 bg-black rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 transition-transform opacity-10 group-hover:rotate-12">
                        <Zap size={60} fill="white" />
                      </div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Member Tier</p>
                      <p className={`text-2xl italic font-black tracking-tighter ${isVIP ? 'text-yellow-400' : 'text-white'}`}>
                        {isVIP ? "PRO VIP STATUS" : "REGULAR MEMBER"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] pl-2">Recent Transactions</p>
                    {orders.length > 0 ? orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-6 border border-gray-100 rounded-[2rem] hover:border-[#EA638C] bg-white transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-[#EA638C] transition-colors">
                            {order.isVIPOrder ? <Zap size={20} className="text-yellow-500" fill="currentColor" /> : <ShoppingBag size={20} />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-900 uppercase">#{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">৳{order.totalAmount?.toLocaleString() || order.totalPrice?.toLocaleString()}</p>
                          <div className={`flex items-center justify-end gap-1 text-[8px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'text-green-500' : 'text-orange-400'}`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-16 text-center border-2 border-dashed border-gray-50 rounded-[3rem]">
                        <Package size={40} className="mx-auto mb-4 text-gray-100" />
                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No Transactions Registered</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Footer Controls */}
            <div className="flex items-center justify-between px-10 py-8 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authorization</span>
                <span className="text-[11px] font-black text-green-500 uppercase tracking-tighter flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Secure Admin Session
                </span>
              </div>
              <button onClick={toggleModal} className="px-12 py-4 bg-black text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#EA638C] transition-all">
                Terminate View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}