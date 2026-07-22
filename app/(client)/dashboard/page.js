"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag, Heart, MapPin, ArrowRight, Wallet, PackageCheck, Zap, ChevronRight, Loader2,
  XCircle, BarChart3, Calendar
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/Context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [range, setRange] = useState("lifetime"); // 🟢 Range State
  const [summary, setSummary] = useState({ 
    lifetimeSpend: 0, 
    totalOrdersCount: 0, 
    cancelledOrdersCount: 0 
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchDashboardData = async (selectedRange) => {
    if (!session?.user?.id) return;
    setStatsLoading(true);
    try {
      // 🟢 Fetching with range parameter
      const res = await fetch(`/api/users/dashboard-stats?range=${selectedRange}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setSummary(data.summary || { lifetimeSpend: 0, totalOrdersCount: 0, cancelledOrdersCount: 0 });
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(range);
  }, [session, range]);

  const timeframes = [
    { id: "lifetime", label: "Lifetime" },
    { id: "today", label: "Today" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
  ];

  const analytics = [
    {
      label: "Total Orders",
      value: summary.totalOrdersCount.toString().padStart(2, "0"),
      subText: range === "lifetime" ? "Successful Acquisitions" : `Orders in ${range}`,
      borderColor: "border-[#3E442B]", 
      icon: <ShoppingBag size={18} className="text-[#3E442B]" />
    },
    {
      label: "Total Spent",
      value: `৳${summary.lifetimeSpend.toLocaleString()}`,
      subText: "Verified Investment",
      borderColor: "border-[#EA638C]", 
      icon: <Wallet size={18} className="text-[#EA638C]" />
    },
    {
      label: "Cancelled",
      value: (summary.cancelledOrdersCount || 0).toString().padStart(2, "0"),
      subText: "Revoked Orders",
      borderColor: "border-red-400",
      icon: <XCircle size={18} className="text-red-400" />
    }
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#EA638C]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading Sanctuary</p>
      </div>
    </div>
  );

  return (
    <div className="pb-20 mx-auto space-y-10 max-w-7xl">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden bg-[#3E442B] rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FBB6E6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FBB6E6]"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#FBB6E6]">Collector Profile Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
              Welcome, <br />
              <span className="text-[#FBB6E6] drop-shadow-sm">
                {session?.user?.name?.split(" ")[0] || "Collector"}
              </span>
            </h1>
          </div>
          <Link href="/products" className="group w-fit bg-[#EA638C] text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center gap-4 hover:bg-white hover:text-[#3E442B] transition-all duration-500 shadow-2xl shadow-black/20">
            Explore New Charms <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA638C]/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
      </div>

      {/* 🟢 2. ANALYTICS INSIGHTS with Date Filter */}
      <section className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EA638C]/10 rounded-2xl text-[#EA638C]">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="font-black text-[#3E442B] text-2xl italic uppercase tracking-tighter">Collector Insights</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Your journey at a glance</p>
            </div>
          </div>

          {/* 🟢 Date Filter Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-[1.5rem] w-fit border border-gray-100">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setRange(tf.id)}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  range === tf.id 
                    ? "bg-[#EA638C] text-white shadow-lg shadow-[#EA638C]/20" 
                    : "text-gray-400 hover:text-[#3E442B]"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className={`grid grid-cols-1 gap-10 md:grid-cols-3 transition-opacity duration-300 ${statsLoading ? 'opacity-40' : 'opacity-100'}`}>
          {analytics.map((item, idx) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`pl-8 border-l-[6px] ${item.borderColor} flex flex-col justify-center relative`}
            >
              <div className="flex items-center gap-2 mb-3">
                {item.icon}
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black italic text-[#3E442B] tracking-tighter">
                  {item.value}
                </span>
              </div>
              <p className="text-[9px] font-bold text-gray-300 uppercase mt-2 tracking-widest">{item.subText}</p>
            </motion.div>
          ))}
        </div>

        <Link href="/dashboard/wishlist" className="absolute top-10 right-10 hidden lg:flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl hover:bg-[#FBB6E6]/20 transition-colors group/wish">
          <Heart size={16} className="text-[#EA638C] group-hover/wish:fill-[#EA638C]" />
          <span className="text-[10px] font-black text-[#3E442B] uppercase tracking-widest">
            {wishlist.length} Items Saved
          </span>
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* 3. RECENT ORDERS */}
        <div className="lg:col-span-3 bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-[#3E442B] text-2xl italic uppercase tracking-tighter flex items-center gap-3">
                <PackageCheck className="text-[#EA638C]" size={28} /> Recent History
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Your latest charm acquisitions</p>
            </div>
            <Link href="/dashboard/orders" className="px-6 py-3 rounded-full bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-[#EA638C] hover:text-white transition-all">View All</Link>
          </div>

          <div className="space-y-4">
            {orders.length > 0 ? orders.slice(0, 3).map((order) => (
              <Link href={`/dashboard/orders/${order._id}`} key={order._id} className="flex items-center justify-between p-7 bg-gray-50/50 rounded-[2.5rem] border border-transparent hover:border-[#FBB6E6] hover:bg-white hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#EA638C] group-hover:scale-110 transition-all shadow-sm">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="font-black text-[#3E442B] text-sm tracking-tight uppercase">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#3E442B] text-lg">৳{order.totalAmount.toLocaleString()}</p>
                  <span className={`text-[9px] font-black uppercase px-4 py-1 rounded-full inline-block mt-1 ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-[#EA638C]/10 text-[#EA638C]'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            )) : (
              <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[3rem]">
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Your story is just beginning.</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. QUICK ACCESS */}
        <div className="space-y-8 lg:col-span-2">
          <div className="bg-[#EA638C] rounded-[3.5rem] p-10 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-2xl shadow-[#EA638C]/20">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-8 backdrop-blur-md">
                <Zap size={30} fill="currentColor" />
              </div>
              <h3 className="mb-3 text-3xl italic font-black tracking-tighter uppercase">Quick Hub</h3>
              <p className="text-white/70 text-sm font-medium mb-10 max-w-[200px]">Tailor your collection and delivery details effortlessly.</p>
              
              <div className="space-y-4">
                <Link href="/dashboard/profile" className="flex items-center justify-between p-6 bg-white/10 hover:bg-white hover:text-[#EA638C] rounded-[2rem] font-black uppercase text-[11px] tracking-widest transition-all duration-500 group">
                  <span className="flex items-center gap-4"><MapPin size={18} /> Shipping Vault</span>
                  <ChevronRight size={18} className="transition-transform group-hover:translate-x-2" />
                </Link>
                <Link href="/dashboard/wishlist" className="flex items-center justify-between p-6 bg-white/10 hover:bg-white hover:text-[#EA638C] rounded-[2rem] font-black uppercase text-[11px] tracking-widest transition-all duration-500 group">
                  <span className="flex items-center gap-4"><Heart size={18} /> Wishlist Gallery</span>
                  <ChevronRight size={18} className="transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}