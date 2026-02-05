"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag, Heart, MapPin, ArrowRight, Clock, Wallet, PackageCheck, Zap, ChevronRight, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/Context/WishlistContext";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ lifetimeSpend: 0, totalOrdersCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch("/api/users/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setSummary(data.summary || { lifetimeSpend: 0, totalOrdersCount: 0 });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [session]);

  const stats = [
    {
      label: "Lifetime Spend",
      value: `৳${summary.lifetimeSpend.toLocaleString()}`,
      icon: <Wallet size={22} />,
      color: "bg-[#3E442B] text-white shadow-lg shadow-[#3E442B]/20", 
      labelColor: "text-gray-300"
    },
    {
      label: "Total Orders",
      value: summary.totalOrdersCount.toString().padStart(2, "0"),
      icon: <ShoppingBag size={22} />,
      color: "bg-[#EA638C]/10 text-[#EA638C] border border-[#EA638C]/20",
      labelColor: "text-gray-400"
    },
    {
      label: "Wishlist Items",
      value: wishlist.length.toString().padStart(2, "0"),
      icon: <Heart size={22} />,
      color: "bg-[#FBB6E6]/30 text-[#EA638C] border border-[#FBB6E6]/50",
      labelColor: "text-gray-400"
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#EA638C]" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading Sanctuary</p>
      </div>
    </div>
  );

  const processingOrder = orders.find(o => o.status === "Processing" || o.status === "Pending");

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden bg-[#3E442B] rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
              <span className="relative flex h-2 w-2">
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
            Explore New Charms <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA638C]/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FBB6E6]/5 rounded-full blur-[80px] -ml-20 -mb-20"></div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`relative overflow-hidden p-10 rounded-[3.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${index === 0 ? stat.color : 'bg-white border border-gray-100'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${index === 0 ? 'bg-white/10' : stat.color}`}>
              {stat.icon}
            </div>
            <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-2 ${index === 0 ? 'text-white/60' : 'text-gray-400'}`}>{stat.label}</p>
            <p className={`text-4xl font-black italic tracking-tighter ${index === 0 ? 'text-white' : 'text-[#3E442B]'}`}>{stat.value}</p>
            
            {/* Subtle background icon for style */}
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${index === 0 ? 'text-white' : 'text-[#EA638C]'}`}>
               {React.cloneElement(stat.icon, { size: 120 })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#EA638C] rounded-[3.5rem] p-10 text-white relative overflow-hidden h-full flex flex-col justify-between shadow-2xl shadow-[#EA638C]/20">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-8 backdrop-blur-md">
                <Zap size={30} fill="currentColor" />
              </div>
              <h3 className="font-black text-3xl uppercase italic tracking-tighter mb-3">Quick Hub</h3>
              <p className="text-white/70 text-sm font-medium mb-10 max-w-[200px]">Tailor your collection and delivery details effortlessly.</p>
              
              <div className="space-y-4">
                <Link href="/dashboard/profile" className="flex items-center justify-between p-6 bg-white/10 hover:bg-white hover:text-[#EA638C] rounded-[2rem] font-black uppercase text-[11px] tracking-widest transition-all duration-500 group">
                  <span className="flex items-center gap-4"><MapPin size={18} /> Shipping Vault</span>
                  <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link href="/dashboard/wishlist" className="flex items-center justify-between p-6 bg-white/10 hover:bg-white hover:text-[#EA638C] rounded-[2rem] font-black uppercase text-[11px] tracking-widest transition-all duration-500 group">
                  <span className="flex items-center gap-4"><Heart size={18} /> Wishlist Gallery</span>
                  <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
            
            {/* Watermark */}
            <div className="absolute -right-6 -bottom-6 text-white opacity-[0.03] font-black text-9xl italic uppercase select-none pointer-events-none tracking-tighter">
              CHARM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}