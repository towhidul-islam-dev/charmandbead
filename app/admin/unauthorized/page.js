import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Icon Section */}
        <div className="relative flex justify-center">
          {/* Changed red-50 to your light pink #FBB6E6 (with opacity) */}
          <div className="w-24 h-24 bg-[#FBB6E6]/30 rounded-[2.5rem] flex items-center justify-center animate-pulse">
            {/* Changed red-500 to your brand green #3E442B */}
            <ShieldAlert size={48} className="text-[#3E442B]" />
          </div>
          {/* Accent dot in your brand pink */}
          <div className="absolute top-0 right-1/3 w-4 h-4 bg-[#EA638C] rounded-full border-4 border-white" />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-[#3E442B] uppercase italic">
            Access Denied
          </h1>
          <p className="text-sm italic font-medium leading-relaxed text-gray-500">
            Oops! It looks like you don't have the administrative permissions 
            required to view this page. 
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="w-full py-4 bg-[#3E442B] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#3E442B]/10"
          >
            <Home size={14} /> Back to Homepage
          </Link>
          
          <Link 
            href="/login" 
            className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#3E442B] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Switch Account
          </Link>
        </div>

        {/* Brand Footer */}
        <div className="pt-8">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
             Error Code: 403_FORBIDDEN
           </p>
           <p className="text-[9px] font-bold text-[#EA638C] uppercase mt-2">
             Charm & Bead Security
           </p>
        </div>
      </div>
    </div>
  );
}