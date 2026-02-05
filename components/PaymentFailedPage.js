"use client";

import { X, MessageCircle, Phone, Mail, ChevronRight, Instagram, Wifi, Copy, Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SupportDrawer({ isOpen, onClose, orderId: rawOrderId }) {
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cooldown, setCooldown] = useState(0); // 🟢 Rate limiter state

  // 🟢 No. 4 Security: Sanitize Order ID immediately
  const orderId = rawOrderId?.replace(/[^a-z0-9_-]/gi, '').slice(0, 20) || "";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // 🟢 Handle Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("ID Copied", {
      style: { fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSupportClick = (e) => {
    if (cooldown > 0) {
      e.preventDefault();
      toast.error(`Please wait ${cooldown}s`, {
        style: { fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
      });
      return;
    }
    setCooldown(30); // 🟢 Set a 30-second cooldown after a click
  };

  const checkConnectivity = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        toast.success("Connection Stable", { 
          icon: '✅',
          style: { fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }
        });
      } else {
        toast.error("Offline Mode");
      }
      setIsChecking(false);
    }, 1200);
  };

  if (!isOpen) return null;

  const supportOptions = [
    {
      title: "WhatsApp",
      desc: "Instant payment help",
      icon: <MessageCircle className="text-[#EA638C]" size={18} />,
      link: `https://wa.me/8801XXXXXXXXX?text=Hi%20Charm%20%26%20Bead%2C%20payment%20failed%20for%20Order%20${orderId}`,
      color: "bg-pink-50"
    },
    {
      title: "Instagram",
      desc: "DM our Gallery",
      icon: <Instagram className="text-[#EA638C]" size={18} />,
      link: "https://www.instagram.com/charm.and.bead/",
      color: "bg-pink-50"
    },
    {
      title: "Direct Call",
      desc: "Available 10AM-8PM",
      icon: <Phone className="text-[#3E442B]" size={18} />,
      link: "tel:+8801XXXXXXXXX",
      color: "bg-[#3E442B]/5"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#3E442B]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-[340px] bg-white rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 z-10 border border-gray-100">
        
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-[#EA638C]">
          <X size={14} />
        </button>

        <div className="text-center mb-5">
          <h2 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter">
            Need <span className="text-[#EA638C]">Help?</span>
          </h2>
          {orderId && (
            <button 
              onClick={copyOrderId}
              className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 group active:bg-gray-100 transition-colors"
            >
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                ID: {orderId.slice(-6).toUpperCase()}
              </span>
              {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-300 group-hover:text-[#EA638C]" />}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {supportOptions.map((opt, i) => (
            <a 
              key={i} 
              href={opt.link} 
              onClick={handleSupportClick}
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-3 rounded-[1.5rem] ${opt.color} transition-all group ${cooldown > 0 ? 'opacity-50 grayscale-[0.5]' : 'active:scale-[0.98]'}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm">{opt.icon}</div>
                <div>
                  <p className="text-[9px] font-black text-[#3E442B] uppercase tracking-wider mb-0.5">{opt.title}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">{opt.desc}</p>
                </div>
              </div>
              {cooldown > 0 ? <Clock size={12} className="text-gray-300" /> : <ChevronRight size={14} className="text-gray-300 group-hover:text-[#EA638C]" />}
            </a>
          ))}
        </div>

        <button 
          onClick={checkConnectivity}
          disabled={isChecking}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <Wifi size={12} className={isChecking ? "animate-pulse text-[#EA638C]" : ""} />
          {isChecking ? "Verifying..." : "Check System Status"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-[7px] font-black text-gray-200 uppercase tracking-[0.4em]">Official Registry Support</p>
        </div>
      </div>
    </div>
  );
}