 "use client";
import React from "react";
import {
  ShoppingBag,
  Heart,
  MapPin,
  User,
  ArrowRight,
  Clock,
  Wallet,
  PackageCheck,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardOverview() {
  const { data: session } = useSession();

  const stats = [
    {
      label: "Total Spend",
      value: "৳14,500",
      icon: <Wallet size={20} />,
      color: "bg-[#EA638C]/10 text-[#EA638C]",
    },
    {
      label: "Total Orders",
      value: "12",
      icon: <ShoppingBag size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Wishlist Items",
      value: "08",
      icon: <Heart size={20} />,
      color: "bg-[#EA638C]/10 text-[#EA638C]",
    },
  ];

  const recentOrders = [
    { id: "ORD-9921", date: "20 Dec", total: 1250, status: "Delivered" },
    { id: "ORD-9945", date: "22 Dec", total: 850, status: "Processing" },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Dynamic Welcome Header */}
      <div className="relative overflow-hidden bg-gray-900 rounded-[3rem] p-8 md:p-12 text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              Hello, <br />
              <span className="text-[#EA638C]">
                {session?.user?.name?.split(" ")[0] || "Collector"}
              </span>
            </h1>
            <p className="text-gray-400 font-bold mt-4 text-sm uppercase tracking-widest">
              Your charm sanctuary is up to date.
            </p>
          </div>
          <Link
            href="/products"
            className="w-fit bg-[#EA638C] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-[#EA638C]/20"
          >
            New Collections <ArrowRight size={14} />
          </Link>
        </div>
        {/* Decorative Background Flare */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA638C]/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
      </div>

      {/* 2. Active Tracking Widget (High Priority) */}
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
            <Clock className="animate-pulse" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/60">
              Live Order Update
            </p>
            <p className="text-sm font-black text-orange-900">
              Order #ORD-9945 is currently <span className="italic underline">In Processing</span>
            </p>
          </div>
        </div>
        <Link href="/dashboard/orders/9945" className="text-orange-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
          Track Details <ChevronRight size={14} />
        </Link>
      </div>

      {/* 3. Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 4. Recent Orders (60% width) */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 text-xl italic uppercase tracking-tighter flex items-center gap-2">
              <PackageCheck className="text-[#EA638C]" /> Recent History
            </h3>
            <Link
              href="/dashboard/orders"
              className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-[#EA638C] transition-colors"
            >
              See All
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50 hover:bg-gray-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#EA638C] transition-colors shadow-sm">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-sm">{order.id}</p>
                    <p className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">
                      {order.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-sm">৳{order.total}</p>
                  <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-[#EA638C]/10 text-[#EA638C]'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Account Quick Actions (40% width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#EA638C] rounded-[3rem] p-8 text-white relative overflow-hidden h-full flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} fill="currentColor" />
              </div>
              <h3 className="font-black text-2xl uppercase italic tracking-tighter mb-2">
                Quick Access
              </h3>
              <p className="text-white/70 text-xs font-bold mb-8">Manage your profile and preferences.</p>
              
              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center justify-between p-5 bg-black/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black/20 transition-all group"
                >
                  <span className="flex items-center gap-3">
                    <MapPin size={16} /> Shipping Addresses
                  </span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard/wishlist"
                  className="flex items-center justify-between p-5 bg-black/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black/20 transition-all group"
                >
                  <span className="flex items-center gap-3">
                    <Heart size={16} /> Saved Items
                  </span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            {/* Background branding */}
            <div className="absolute -right-4 -bottom-4 text-white opacity-5 font-black text-8xl italic uppercase select-none pointer-events-none">
              Charm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}