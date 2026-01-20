"use client";
import { useEffect, useState } from "react";
import { getNotificationAnalytics } from "@/actions/adminNotify";
import { Bell, Users, Package, ArrowRight, Loader2 } from "lucide-react";

export default function AdminNotifications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await getNotificationAnalytics();
      if (res.success) setData(res.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-[#EA638C]" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gray-50/30">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">
          Restock <span className="text-[#EA638C]">Intelligence</span>
        </h1>
        <p className="text-gray-500 font-medium">Prioritize inventory based on customer demand.</p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Bell className="text-pink-600"/>} 
          label="Pending Alerts" 
          value={data.reduce((a,b) => a + b.count, 0)} 
          color="bg-pink-50"
        />
        <StatCard 
          icon={<Package className="text-blue-600"/>} 
          label="Out-of-Stock Variants" 
          value={data.length} 
          color="bg-blue-50"
        />
        <StatCard 
          icon={<Users className="text-orange-600"/>} 
          label="Unique Customers" 
          value={new Set(data.flatMap(d => d.emails)).size} 
          color="bg-orange-50"
        />
      </div>

      {/* TABLE VIEW */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[11px] uppercase font-black tracking-[0.2em] text-gray-400 border-b">
            <tr>
              <th className="px-8 py-6">Product Details</th>
              <th className="px-8 py-6">Variant</th>
              <th className="px-8 py-6 text-center">Waitlist Size</th>
              <th className="px-8 py-6 text-right">Target Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={item.productImage} className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm" />
                    <p className="font-black text-gray-800 uppercase text-sm">{item.productName}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase">
                    {item._id.variantKey}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="text-lg font-black text-[#EA638C]">
                    {item.count}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#EA638C] transition-all">
                    Send Manual Nudge <ArrowRight size={14}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
            No pending stock requests
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-5 ${color} rounded-[1.5rem]`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
}