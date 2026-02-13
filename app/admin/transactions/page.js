"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllOrders } from "@/actions/order"; 
import { 
  ArrowUpRight, Search, CreditCard, 
  Wallet, Landmark, ReceiptText, ExternalLink,
  Calendar, ChevronRight, Fingerprint
} from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ gross: 0, fees: 0, net: 0 });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const res = await getAllOrders(1, 50);
    if (res.success) {
      const orders = res.orders;
      setTransactions(orders);
      const gross = orders.reduce((acc, o) => acc + o.totalAmount, 0);
      const fees = orders.reduce((acc, o) => acc + (o.mobileBankingFee || 0), 0);
      setMetrics({ gross, fees, net: gross - fees });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-4 md:pt-8 pb-20 px-4 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        
        {/* --- METRICS (Responsive Grid) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <MetricTile label="Gross Volume" value={metrics.gross} color="#3E442B" icon={<ArrowUpRight size={18}/>} />
          <MetricTile label="Gateway Fees" value={metrics.fees} color="#EA638C" icon={<ReceiptText size={18}/>} />
          <MetricTile label="Net Payout" value={metrics.net} color="#3E442B" bgColor="#3E442B" isDark icon={<Landmark size={18}/>} />
        </div>

        {/* --- MAIN CONTENT CONTAINER --- */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-[#3E442B]/5 border border-gray-100 overflow-hidden">
          
          <div className="px-6 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <h2 className="text-lg font-black text-[#3E442B] uppercase italic tracking-tighter">
                Financial <span className="text-[#EA638C]">Ledger</span>
             </h2>
             <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                <input type="text" placeholder="Search Order..." className="pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-[#EA638C] w-full" />
             </div>
          </div>

          {/* 1. DESKTOP VIEW (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-50/50 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="px-8 py-5 w-[15%]">Timeline</th>
                    <th className="px-8 py-5 w-[12%]">Order</th>
                    <th className="px-8 py-5 w-[12%]">Method</th>
                    <th className="px-8 py-5 w-[20%]">Ref / TXN</th>
                    <th className="px-8 py-5 w-[26%] text-center">Breakdown (Gross/Fee/Net)</th>
                    <th className="px-8 py-5 w-[15%] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((item) => <DesktopRow key={item._id} item={item} />)}
                </tbody>
            </table>
          </div>

          {/* 2. MOBILE CARD VIEW (Hidden on Desktop) */}
          <div className="md:hidden divide-y divide-gray-100">
            {transactions.map((item) => <MobileCard key={item._id} item={item} />)}
          </div>

          {loading && <LoadingState />}
        </div>
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function MetricTile({ label, value, color, bgColor = "white", isDark = false, icon }) {
  return (
    <div style={{ backgroundColor: bgColor }} className={`p-6 rounded-[2rem] border ${isDark ? 'border-transparent' : 'border-gray-100'} shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-[#FBB6E6]' : 'bg-gray-50 text-' + color}`}>{icon}</div>
        <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{label}</span>
      </div>
      <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#3E442B]'}`}>৳{value.toLocaleString()}</p>
    </div>
  );
}

function ReferenceCell({ item }) {
  const [showId, setShowId] = useState(false);
  
  // Default to order ID if referenceNumber is missing
  const reference = item.referenceNumber || `#REF-${item._id.slice(-5).toUpperCase()}`;
  const transactionId = item.transactionId || "COD-PAYMENT";

  return (
    <div 
      className="cursor-help group inline-block"
      onMouseEnter={() => setShowId(true)}
      onMouseLeave={() => setShowId(false)}
    >
      <div className="flex items-center gap-2">
        <span className={`font-mono text-[9px] transition-all duration-300 truncate max-w-[120px] block ${showId ? 'text-[#EA638C] font-black scale-105' : 'text-gray-400 font-medium'}`}>
          {showId ? transactionId : reference}
        </span>
      </div>
      <p className="text-[7px] font-black text-gray-300 uppercase tracking-tighter mt-0.5">
        {showId ? "System TXN ID" : "Order Reference"}
      </p>
    </div>
  );
}

function DesktopRow({ item }) {
  const isCod = !item.transactionId;
  const net = item.totalAmount - (item.mobileBankingFee || 0);
  
  return (
    <tr className="hover:bg-[#FBB6E6]/5 transition-all group">
      <td className="px-8 py-5">
        <p className="text-[10px] font-black text-[#3E442B]">{new Date(item.createdAt).toLocaleDateString('en-GB')}</p>
        <p className="text-[8px] font-bold text-gray-300 uppercase">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </td>
      <td className="px-8 py-5">
        <Link href={`/admin/orders/${item._id}`} className="text-[10px] font-black text-[#3E442B] hover:text-[#EA638C] transition-colors underline decoration-gray-100 underline-offset-4">
            #{item._id.slice(-5).toUpperCase()}
        </Link>
      </td>
      <td className="px-8 py-5">
        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${isCod ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
            {isCod ? "COD" : "Digital"}
        </span>
      </td>
      
      {/* --- NEW TOGGLE COLUMN --- */}
      <td className="px-8 py-5">
        <ReferenceCell item={item} />
      </td>

      <td className="px-8 py-5">
        <div className="flex items-center justify-between bg-gray-50/50 rounded-xl px-4 py-2 border border-gray-100 text-[9px] font-bold">
          <span className="text-gray-400">৳{item.totalAmount}</span>
          <span className="text-gray-200">/</span>
          <span className="text-[#EA638C]">৳{item.mobileBankingFee || 0}</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600 font-black">৳{net}</span>
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <span className={`text-[8px] font-black px-3 py-1 rounded-full border ${item.dueAmount <= 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-pink-50 text-[#EA638C] border-pink-100'}`}>
          {item.dueAmount <= 0 ? "SETTLED" : "DUE"}
        </span>
      </td>
    </tr>
  );
}

function MobileCard({ item }) {
  const isCod = !item.transactionId;
  const net = item.totalAmount - (item.mobileBankingFee || 0);
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isCod ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
            {isCod ? <Wallet size={16} /> : <CreditCard size={16} />}
          </div>
          <div>
            <p className="text-[11px] font-black text-[#3E442B] uppercase tracking-tighter">Order #{item._id.slice(-6).toUpperCase()}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(item.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
        <span className={`text-[8px] font-black px-2 py-1 rounded-md ${item.dueAmount <= 0 ? 'bg-green-100 text-green-700' : 'bg-[#FBB6E6] text-[#EA638C]'}`}>
          {item.dueAmount <= 0 ? "PAID" : "DUE"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <div className="text-center border-r border-gray-200">
          <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Gross</p>
          <p className="text-[10px] font-black text-[#3E442B]">৳{item.totalAmount}</p>
        </div>
        <div className="text-center border-r border-gray-200">
          <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Fee</p>
          <p className="text-[10px] font-black text-[#EA638C]">৳{item.mobileBankingFee || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[7px] font-black text-gray-400 uppercase mb-1">Net</p>
          <p className="text-[11px] font-black text-green-600">৳{net}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
           <Fingerprint size={12} className="text-gray-300" />
           <span className="text-[9px] font-mono text-gray-400 truncate">{item.transactionId || "COD-PAYMENT"}</span>
        </div>
        <Link href={`/admin/orders/${item._id}`} className="text-[#EA638C] flex items-center gap-1 text-[10px] font-black uppercase">
          Details <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="py-24 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#EA638C] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[9px] font-black text-[#3E442B] uppercase tracking-widest">establishing secure link...</p>
    </div>
  );
}