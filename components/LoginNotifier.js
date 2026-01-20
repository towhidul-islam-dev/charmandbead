"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Zap, Sparkles } from "lucide-react";

export default function LoginNotifier() {
  const { data: session, status } = useSession();
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasNotified) {
      const isVIP = session.user.role === "admin" || (session.user.totalSpent >= 10000);

      if (isVIP) {
        // 🟢 LUXURY VIP TOAST
        toast.custom((t) => (
          <div className="flex items-center gap-4 bg-[#3E442B] border-2 border-[#EA638C] p-4 rounded-[1.5rem] shadow-[0_0_20px_rgba(234,99,140,0.3)] min-w-[300px] animate-in slide-in-from-right duration-500">
            <div className="bg-[#EA638C] p-2 rounded-xl shadow-lg">
              <Zap className="text-white fill-white" size={20} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em] leading-none mb-1">
                VIP Access Active
              </p>
              <p className="text-sm font-bold text-white">
                Welcome back, {session.user.name.split(' ')[0]}!
              </p>
            </div>
          </div>
        ), { duration: 6000 });
        
      } else {
        // ⚪ STANDARD MEMBER TOAST
        toast.success(`Hello, ${session.user.name}!`, {
          description: "Great to see you again.",
          icon: <Sparkles className="text-[#EA638C]" size={16} />,
          style: {
            borderRadius: '1.2rem',
            padding: '16px',
            border: '1px solid #f3f4f6'
          }
        });
      }
      setHasNotified(true);
    }

    if (status === "unauthenticated") {
      setHasNotified(false);
    }
  }, [status, session, hasNotified]);

  return null;
}