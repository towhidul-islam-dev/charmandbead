"use client";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/Context/NotificationContext";
import { 
  BellIcon, 
  SparklesIcon, 
  CreditCardIcon, 
  CheckCheckIcon,
  ClockIcon
} from "lucide-react";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 transition-colors rounded-full group hover:bg-gray-50"
      >
        <BellIcon 
          className={`h-6 w-6 transition-colors ${
            isOpen ? "text-[#EA638C]" : "text-[#3E442B] group-hover:text-[#EA638C]"
          }`} 
        />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA638C] text-[9px] font-black text-white border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-2xl rounded-[2rem] overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3E442B]">
              Registry Updates
            </h3>
            {unreadCount > 0 && (
              <span className="text-[9px] font-bold text-[#EA638C] bg-[#EA638C]/10 px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`p-4 border-b border-gray-50 last:border-0 transition-all cursor-pointer hover:bg-gray-50 flex gap-3 relative ${!n.isRead ? 'bg-pink-50/30' : ''}`}
                >
                  {/* Icon Logic based on Type */}
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                    n.type === 'arrival' ? 'bg-[#FBB6E6] text-[#EA638C]' : 'bg-[#3E442B] text-white'
                  }`}>
                    {n.type === 'arrival' ? <SparklesIcon size={16} /> : <CreditCardIcon size={16} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-[11px] font-black leading-tight ${n.isRead ? 'text-gray-500' : 'text-[#3E442B]'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#EA638C]" />}
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed mb-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                      <ClockIcon size={10} />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                    
                    {n.link && (
                      <Link 
                        href={n.link}
                        className="mt-2 block text-[9px] font-black uppercase text-[#EA638C] hover:underline"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <CheckCheckIcon className="mx-auto mb-3 text-gray-200" size={32} />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  No notifications yet
                </p>
              </div>
            )}
          </div>

          <Link 
            href="/dashboard/notifications" 
            className="block py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#3E442B] transition-colors bg-gray-50/30"
          >
            See All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}