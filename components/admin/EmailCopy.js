"use client";

import { Mail, Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function EmailCopy({ email }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!email) return;

    navigator.clipboard.writeText(email);
    setCopied(true);

    // 🟢 Your Branded Toast logic
    toast.success("Copied to clipboard!", {
      icon: <Check size={14} className="text-white" />,
      style: { 
        borderRadius: '12px', 
        background: '#3E442B', // Brand Green
        color: '#fff', 
        fontSize: '11px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        border: '1px solid #EA638C' // Brand Pink
      },
      duration: 2000,
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="group/email relative flex items-center gap-1 cursor-pointer"
      onClick={handleCopy}
      title="Click to copy email"
    >
      <div className="flex items-center gap-1 text-gray-400 group-hover/email:text-[#EA638C] transition-colors">
        {copied ? (
            <Check size={10} className="text-[#EA638C] animate-in zoom-in" />
        ) : (
            <Mail size={10} className="transition-transform group-hover/email:scale-110" />
        )}
        
        {/* Shows "Email" normally, "Copied!" when clicked */}
        <span className="text-[10px] font-black uppercase tracking-tighter block group-hover/email:hidden">
          {copied ? "Copied!" : "Email"}
        </span>
      </div>
      
      {/* 🟢 The "Toad" (Tooltip/Revealed Email) */}
      <div className="hidden group-hover/email:flex items-center gap-2 text-[10px] font-bold text-gray-500 lowercase tracking-tight bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm animate-in fade-in slide-in-from-left-1 group-hover/email:border-[#EA638C]/40">
        <span className="truncate max-w-[120px]">{email}</span>
        <Copy size={8} className="text-[#EA638C]/50" />
      </div>
    </div>
  );
}