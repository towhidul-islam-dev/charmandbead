export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-black">Payment Failed</h1>
      <p className="text-gray-500">Please try again or contact support.</p>
      <a href="/checkout" className="mt-4 text-blue-600 font-bold underline">Back to Checkout</a>
    </div>
  );
}import Link from "next/link";
import { XCircle, RefreshCcw, MessageCircle, AlertCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 p-8 md:p-12 text-center border border-gray-100">
        
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-red-50 p-6 rounded-full">
            <XCircle size={64} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          Payment Failed
        </h1>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          Something went wrong with your transaction. Don't worry, no money was deducted from your account.
        </p>

        {/* Troubleshooting Card */}
        <div className="bg-red-50/50 rounded-[2rem] p-6 mb-8 border border-red-100 text-left">
          <div className="flex gap-3 items-start">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1">Common Issues</p>
              <ul className="text-[11px] font-bold text-red-600/80 space-y-1 list-disc pl-3">
                <li>Insufficient account balance</li>
                <li>Incorrect OTP or PIN entered</li>
                <li>Payment gateway timeout</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/dashboard/checkout"
            className="w-full bg-[#EA638C] text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#d54d76] transition-all shadow-lg shadow-pink-100"
          >
            <RefreshCcw size={18} />
            Try Paying Again
          </Link>
          
          <Link
            href="https://wa.me/8801XXXXXXXXX" 
            target="_blank"
            className="w-full bg-white text-gray-400 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <MessageCircle size={18} />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}