"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Settings, ChevronDown, ChevronUp, Box, Truck, X, Inbox } from "lucide-react";
import { useNotifications } from "@/Context/NotificationContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { markAsReadAction } from "@/actions/inAppNotifications";

export default function NotificationBell() {
  const { notifications, unreadCount, setNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("orders");
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push("/dashboard/settings"); 
  };

  const orderNotifications = notifications?.filter(n => n.type === 'order' || n.type === 'payment') || [];
  const shipmentNotifications = notifications?.filter(n => n.type === 'shipment' || n.type === 'delivery') || [];
  const otherNotifications = notifications?.filter(n => n.type !== 'order' && n.type !== 'payment' && n.type !== 'shipment' && n.type !== 'delivery') || [];

  const hasAnyNotifications = notifications && notifications.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- BELL ICON --- */}
      <button onClick={handleToggle} className="relative p-2 transition-all active:scale-95 group z-[101]">
        <Bell size={24} className={`transition-colors ${isOpen ? 'text-[#EA638C]' : 'text-[#3E442B] group-hover:text-[#EA638C]'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#EA638C] text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* BACKDROP */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] md:hidden" onClick={() => setIsOpen(false)} />

          {/* MAIN MODAL - Position Fix Applied Here */}
          <div className={`
            fixed top-[80px] left-3 right-3 z-[100]
            md:absolute md:top-full md:left-auto md:right-0 md:mt-3 md:w-[400px] md:translate-x-0
            bg-white rounded-[2.5rem] md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden 
            animate-in fade-in slide-in-from-top-4 duration-300
          `}>
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-white/50 backdrop-blur-md">
              <div>
                <h3 className="font-black text-[#3E442B] uppercase italic tracking-tighter text-2xl leading-none">Notifications</h3>
                {unreadCount > 0 && <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-widest mt-1">{unreadCount} New updates</p>}
              </div>
              <div className="flex items-center gap-1">
                 <button onClick={handleSettingsClick} className="text-gray-400 hover:text-[#3E442B] p-2 transition-colors">
                   <Settings size={20} />
                 </button>
                 <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-300 hover:text-[#EA638C] p-2 transition-colors">
                   <X size={24} />
                 </button>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="max-h-[60vh] md:max-h-[480px] overflow-y-auto no-scrollbar bg-white">
              {!hasAnyNotifications ? (
                  <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
                      <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-[#FBB6E6]/20">
                          <Inbox className="text-[#EA638C]/30" size={40} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Your tray is empty</p>
                  </div>
              ) : (
                <div className="flex flex-col">
                  {orderNotifications.length > 0 && (
                    <div className="border-b border-gray-50">
                      <button onClick={() => setExpandedSection(expandedSection === 'orders' ? '' : 'orders')} className="flex items-center justify-between w-full p-5 transition-colors hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="relative bg-[#3E442B] p-3 rounded-xl text-white shadow-lg shadow-[#3E442B]/20"><Box size={20} /></div>
                          <p className="font-black text-[#3E442B] uppercase text-xs tracking-tight">Active Orders</p>
                        </div>
                        {expandedSection === 'orders' ? <ChevronUp size={18} className="text-[#EA638C]" /> : <ChevronDown size={18} className="text-gray-300" />}
                      </button>
                      {expandedSection === 'orders' && orderNotifications.map(n => <NotificationItem key={n._id} notif={n} setIsOpen={setIsOpen} setNotifications={setNotifications}/>)}
                    </div>
                  )}

                  {shipmentNotifications.length > 0 && (
                    <div className="border-b border-gray-50">
                      <button onClick={() => setExpandedSection(expandedSection === 'shipment' ? '' : 'shipment')} className="flex items-center justify-between w-full p-5 transition-colors hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="relative bg-[#EA638C] p-3 rounded-xl text-white shadow-lg shadow-[#EA638C]/20"><Truck size={20} /></div>
                          <p className="font-black text-[#3E442B] uppercase text-xs tracking-tight">Shipments</p>
                        </div>
                        {expandedSection === 'shipment' ? <ChevronUp size={18} className="text-[#EA638C]" /> : <ChevronDown size={18} className="text-gray-300" />}
                      </button>
                      {expandedSection === 'shipment' && shipmentNotifications.map(n => <NotificationItem key={n._id} notif={n} setIsOpen={setIsOpen} setNotifications={setNotifications}/>)}
                    </div>
                  )}

                  {otherNotifications.length > 0 && (
                     <div className="p-3">
                        <p className="px-4 py-3 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Recent Activity</p>
                        {otherNotifications.map(n => <NotificationItem key={n._id} notif={n} plain setIsOpen={setIsOpen} setNotifications={setNotifications}/>)}
                     </div>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER */}
            {hasAnyNotifications && (
              <div className="p-4 bg-white border-t border-gray-50">
                <button 
                  onClick={() => { setIsOpen(false); router.push("/dashboard/notifications"); }}
                  className="w-full py-4 rounded-2xl bg-gray-50 text-[#EA638C] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#FBB6E6]/20 transition-all"
                >
                  See All Activity
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({ notif, plain = false, setIsOpen, setNotifications }) {
  const router = useRouter();

  const handleAction = async () => {
    if (!notif.isRead) {
      const result = await markAsReadAction(notif._id);
      if (result.success) {
        setNotifications(prev => 
          prev.map(item => item._id === notif._id ? { ...item, isRead: true } : item)
        );
      }
    }

    setIsOpen(false);

    if (notif.link) {
        router.push(notif.link);
    } else if (notif.type === 'order' || notif.type === 'payment') {
        router.push(`/dashboard/orders`);
    } else {
        router.push('/dashboard');
    }
  };

  return (
    <div 
      onClick={handleAction}
      className={`p-4 flex gap-4 transition-all cursor-pointer relative ${notif.isRead ? 'opacity-60' : 'bg-[#FBB6E6]/5'} ${plain ? 'hover:bg-gray-50 rounded-2xl mx-1 my-0.5' : 'border-t border-gray-100/50'}`}
    >
      {!notif.isRead && (
        <span className="absolute top-5 right-5 h-2 w-2 rounded-full bg-[#EA638C] shadow-[0_0_10px_#EA638C]" />
      )}

      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        <Image 
          src={notif.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.title || 'N')}&background=FBB6E6&color=3E442B&bold=true`} 
          width={48} height={48} alt="thumb" className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-[#3E442B] leading-snug line-clamp-2">{notif.message}</p>
        <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-tighter">
              View Details
            </span>
            <span className="text-[8px] font-bold text-gray-300 uppercase italic">
              {new Date(notif.createdAt).toLocaleDateString()}
            </span>
        </div>
      </div>
    </div>
  );
}