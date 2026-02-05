"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Settings, ChevronDown, ChevronUp, Box, Truck, X, Inbox } from "lucide-react";
import { useNotifications } from "@/Context/NotificationContext";
import Image from "next/image";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("orders");
  const dropdownRef = useRef(null);

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

  // Logic: Grouping notifications by type
  const orderNotifications = notifications?.filter(n => n.type === 'order') || [];
  const shipmentNotifications = notifications?.filter(n => n.type === 'shipment' || n.type === 'delivery') || [];
  const otherNotifications = notifications?.filter(n => n.type !== 'order' && n.type !== 'shipment' && n.type !== 'delivery') || [];

  const hasAnyNotifications = notifications && notifications.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Brand Styled Bell */}
      <button onClick={handleToggle} className="relative p-2 transition-all active:scale-95 group">
        <Bell size={24} className={`transition-colors ${isOpen ? 'text-[#EA638C]' : 'text-[#3E442B] group-hover:text-[#EA638C]'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#EA638C] text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="font-black text-[#3E442B] uppercase italic tracking-tighter text-xl">Notifications</h3>
            <button className="text-gray-400 hover:text-[#3E442B] transition-colors">
              <Settings size={18} />
            </button>
          </div>

          <div className="max-h-[450px] overflow-y-auto no-scrollbar bg-white">
            {!hasAnyNotifications ? (
              <div className="flex flex-col items-center justify-center px-10 py-20 text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-50">
                    <Inbox className="text-gray-200" size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Your tray is empty</p>
              </div>
            ) : (
              <>
                {/* 📦 ORDERS SECTION (Only shows if there are orders) */}
                {orderNotifications.length > 0 && (
                  <div className="border-b border-gray-50">
                    <button 
                      onClick={() => setExpandedSection(expandedSection === 'orders' ? '' : 'orders')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#FBB6E6]/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative bg-[#3E442B] p-3 rounded-xl text-white shadow-lg shadow-[#3E442B]/20">
                          <Box size={22} />
                          <span className="absolute -top-1.5 -right-1.5 bg-[#EA638C] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                            {orderNotifications.length}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-[#3E442B] uppercase text-xs">Active Orders</p>
                          <p className="text-[10px] text-gray-400 font-medium">Tracking, processing & updates</p>
                        </div>
                      </div>
                      {expandedSection === 'orders' ? <ChevronUp size={18} className="text-[#EA638C]" /> : <ChevronDown size={18} className="text-gray-300" />}
                    </button>
                    {expandedSection === 'orders' && (
                      <div className="bg-gray-50/50">
                        {orderNotifications.map(notif => <NotificationItem key={notif._id} notif={notif} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* 🚚 SHIPMENT SECTION (Only shows if there are shipments) */}
                {shipmentNotifications.length > 0 && (
                  <div className="border-b border-gray-50">
                    <button 
                      onClick={() => setExpandedSection(expandedSection === 'shipment' ? '' : 'shipment')}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#FBB6E6]/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative bg-[#EA638C] p-3 rounded-xl text-white shadow-lg shadow-[#EA638C]/20">
                          <Truck size={22} />
                          <span className="absolute -top-1.5 -right-1.5 bg-[#3E442B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                            {shipmentNotifications.length}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-[#3E442B] uppercase text-xs">Shipments</p>
                          <p className="text-[10px] text-gray-400 font-medium">Out for delivery & dispatch</p>
                        </div>
                      </div>
                      {expandedSection === 'shipment' ? <ChevronUp size={18} className="text-[#EA638C]" /> : <ChevronDown size={18} className="text-gray-300" />}
                    </button>
                    {expandedSection === 'shipment' && (
                      <div className="bg-gray-50/50">
                        {shipmentNotifications.map(notif => <NotificationItem key={notif._id} notif={notif} />)}
                      </div>
                    )}
                  </div>
                )}

                {/* 🏷️ GENERAL SECTION (Promos, Gifts, etc) */}
                {otherNotifications.length > 0 && (
                   <div className="p-2">
                      <p className="px-3 py-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">Recent Activity</p>
                      {otherNotifications.map(notif => <NotificationItem key={notif._id} notif={notif} plain />)}
                   </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {hasAnyNotifications && (
            <button className="w-full py-4 text-center text-[#EA638C] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-50 transition-colors border-t border-gray-50">
              See All Activity
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notif, plain = false }) {
  return (
    <div className={`p-4 flex gap-4 transition-all ${plain ? 'hover:bg-gray-50 rounded-xl' : 'border-t border-gray-100/50'}`}>
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-white border border-gray-100 rounded-full shadow-sm">
        <Image 
          src={notif.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.title)}&background=FBB6E6&color=3E442B&bold=true`} 
          width={40} height={40} alt="thumb" className="object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-bold text-[#3E442B] leading-snug">{notif.message}</p>
        <div className="flex items-center justify-between mt-2">
            <button className="text-[10px] font-black text-[#EA638C] uppercase tracking-tighter hover:underline">
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