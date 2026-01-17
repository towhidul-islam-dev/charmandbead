import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Icon Section */}
        <div className="relative flex justify-center">
          <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center animate-pulse">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <div className="absolute top-0 right-1/3 w-4 h-4 bg-[#EA638C] rounded-full" />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
            Access Denied
          </h1>
          <p className="font-medium leading-relaxed text-gray-500">
            Oops! It looks like you don't have the administrative permissions 
            required to view this page. 
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#EA638C] transition-all flex items-center justify-center gap-2"
          >
            <Home size={14} /> Back to Homepage
          </Link>
          
          <Link 
            href="/login" 
            className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-black transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Switch Account
          </Link>
        </div>

        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest pt-8">
          Error Code: 403_FORBIDDEN
        </p>
      </div>
    </div>
  );
}