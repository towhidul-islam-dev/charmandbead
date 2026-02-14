"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Settings, ChevronDown, ChevronUp, Box, Truck, X, Inbox } from "lucide-react";
import { useNotifications } from "@/Context/NotificationContext";
import { useRouter } from "next/navigation"; // 🟢 Added for navigation
import Image from "next/image";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("orders");
  const dropdownRef = useRef(null);
  const router = useRouter(); // 🟢 Initialize router

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
    if (!isOpen) markAllAsRead();
    setIsOpen(!isOpen);
  };

  // 🟢 Settings Redirect
  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push("/dashboard/settings"); // Or your specific user dashboard path
  };

  const orderNotifications = notifications?.filter(n => n.type === 'order') || [];
  const shipmentNotifications = notifications?.filter(n => n.type === 'shipment' || n.type === 'delivery') || [];
  const otherNotifications = notifications?.filter(n => n.type !== 'order' && n.type !== 'shipment' && n.type !== 'delivery') || [];

  const hasAnyNotifications = notifications && notifications.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggle} className="relative p-2 transition-all active:scale-95 group">
        <Bell size={24} className={`transition-colors ${isOpen ? 'text-[#EA638C]' : 'text-[#3E442B] group-hover:text-[#EA638C]'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#EA638C] text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] md:hidden" onClick={() => setIsOpen(false)} />

          <div className={`
            fixed left-1/2 -translate-x-1/2 bottom-4 w-[calc(100vw-24px)] max-w-[450px] z-[100]
            md:absolute md:left-auto md:right-0 md:bottom-auto md:top-full md:mt-3 md:translate-x-0 md:w-[400px]
            bg-white rounded-[2rem] md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden 
            animate-in fade-in slide-in-from-bottom-6 md:zoom-in-95 duration-300
          `}>
            
            <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-white/50 backdrop-blur-md">
              <div>
                <h3 className="font-black text-[#3E442B] uppercase italic tracking-tighter text-2xl leading-none">Notifications</h3>
                {unreadCount > 0 && <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-widest mt-1">{unreadCount} New updates</p>}
              </div>
              <div className="flex items-center gap-1">
                 {/* 🟢 Settings Icon Functional */}
                 <button 
                   onClick={handleSettingsClick}
                   className="text-gray-400 hover:text-[#3E442B] p-2 transition-colors"
                 >
                   <Settings size={20} />
                 </button>
                 <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-300 hover:text-[#EA638C] p-2 transition-colors">
                   <X size={24} />
                 </button>
              </div>
            </div>

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
                      <button onClick={() => setExpandedSection(expandedSection === 'orders' ? '' : 'orders')} className="w-full flex items-center justify-between p-5 hover:bg-[#FBB6E6]/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="relative bg-[#3E442B] p-3.5 rounded-2xl text-white shadow-lg shadow-[#3E442B]/20"><Box size={22} /></div>
                          <div className="text-left">
                            <p className="font-black text-[#3E442B] uppercase text-xs tracking-tight">Active Orders</p>
                          </div>
                        </div>
                        {expandedSection === 'orders' ? <ChevronUp size={18} className="text-[#EA638C]" /> : <ChevronDown size={18} className="text-gray-300" />}
                      </button>
                      {expandedSection === 'orders' && orderNotifications.map(notif => <NotificationItem key={notif._id} notif={notif} setIsOpen={setIsOpen} />)}
                    </div>
                  )}

                  {shipmentNotifications.length > 0 && (
                    <div className="border-b border-gray-50">
                      <button onClick={() => setExpandedSection(expandedSection === 'shipment' ? '' : 'shipment')} className="w-full flex items-center justify-between p-5 hover:bg-[#FBB6E6]/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="relative bg-[#EA638C] p-3.5 rounded-2xl text-white shadow-lg shadow-[#EA638C]/20"><Truck size={22} /></div>
                          <div className="text-left">
                            <p className="font-black text-[#3E442B] uppercase text-xs tracking-tight">Shipments</p>
                          </div>
                        </div>
                        {expandedSection === 'shipment' ? <ChevronUp size={18} className="text-[#EA638C]" /> : <ChevronDown size={18} className="text-gray-300" />}
                      </button>
                      {expandedSection === 'shipment' && shipmentNotifications.map(notif => <NotificationItem key={notif._id} notif={notif} setIsOpen={setIsOpen} />)}
                    </div>
                  )}

                  {otherNotifications.length > 0 && (
                     <div className="p-3">
                        <p className="px-4 py-3 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Recent Activity</p>
                        {otherNotifications.map(notif => <NotificationItem key={notif._id} notif={notif} plain setIsOpen={setIsOpen} />)}
                     </div>
                  )}
                </div>
              )}
            </div>

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

function NotificationItem({ notif, plain = false, setIsOpen }) {
  const router = useRouter();

  // 🟢 Details Button Functional Redirect
  const handleViewDetails = () => {
    setIsOpen(false);
    // Logic to determine where to go:
    if (notif.link) {
        router.push(notif.link);
    } else if (notif.type === 'order') {
        router.push(`/dashboard/orders/${notif.orderId || ''}`);
    } else {
        router.push('/dashboard');
    }
  };

  return (
    <div className={`p-4 flex gap-4 transition-all ${plain ? 'hover:bg-gray-50 rounded-xl' : 'border-t border-gray-100/50'}`}>
      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm">
        <Image 
          src={notif.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.title || 'N')}&background=FBB6E6&color=3E442B&bold=true`} 
          width={48} height={48} alt="thumb" className="object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-bold text-[#3E442B] leading-snug">{notif.message}</p>
        <div className="flex items-center justify-between mt-2">
            <button 
              onClick={handleViewDetails}
              className="text-[10px] font-black text-[#EA638C] uppercase tracking-tighter hover:underline"
            >
              View Details
            </button>
            <span className="text-[8px] font-bold text-gray-300 uppercase italic">
              {new Date(notif.createdAt).toLocaleDateString()}
            </span>
        </div>
      </div>
    </div>
  );
}