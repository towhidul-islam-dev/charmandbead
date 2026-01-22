"use client";

import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '@/actions/order';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

export default function AnalyticsBreakdown() {
  const [period, setPeriod] = useState("30days");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getDashboardStats(period);
      if (res.success) {
        setStats(res.stats);
      }
      setLoading(false);
    }
    loadData();
  }, [period]);

  if (loading || !stats) return (
    <div className="bg-white p-8 rounded-[3rem] h-[400px] flex items-center justify-center border border-gray-100">
      <div className="animate-pulse text-[#3E442B]/20 font-black uppercase text-[10px]">Calculating Breakdown...</div>
    </div>
  );

  // Calculate percentages for the SVG stroke-dasharray
  const total = stats.totalRevenue || 1; // Prevent division by zero
  const netPerc = (stats.netRevenue / total) * 100;
  const mfsPerc = (stats.gatewayCosts / total) * 100;
  const delPerc = (stats.deliveryCosts / total) * 100;

  // SVG Constants for the Ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-[#3E442B] uppercase italic tracking-tighter">
            Revenue <span className="text-[#EA638C]">Split</span>
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Calculated by Period</p>
        </div>
        
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-gray-50 border border-gray-100 text-[10px] font-black uppercase px-4 py-2 rounded-xl outline-none text-[#3E442B] cursor-pointer hover:border-[#EA638C]/30 transition-colors"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* --- PURE SVG DONUT CHART --- */}
        <div className="relative flex justify-center items-center h-56">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background Circle */}
            <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#f3f4f6" strokeWidth="24" />
            
            {/* Delivery Cost Segment (Light Pink) */}
            <circle
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="#FBB6E6"
              strokeWidth="24"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * (delPerc + mfsPerc + netPerc)) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />

            {/* MFS Fee Segment (Brand Pink) */}
            <circle
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="#EA638C"
              strokeWidth="24"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * (mfsPerc + netPerc)) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />

            {/* Net Revenue Segment (Brand Green) */}
            <circle
              cx="100" cy="100" r={radius}
              fill="transparent"
              stroke="#3E442B"
              strokeWidth="24"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * netPerc) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out shadow-lg"
            />
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Gross</span>
            <span className="text-sm font-black text-[#3E442B]">৳{stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* --- LEGEND DETAILS --- */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
             <LegendItem label="Net Product Value" value={stats.netRevenue} color="bg-[#3E442B]" percentage={netPerc} />
             <LegendItem label="MFS Gateway Fees" value={stats.gatewayCosts} color="bg-[#EA638C]" percentage={mfsPerc} />
             <LegendItem label="Delivery Charges" value={stats.deliveryCosts} color="bg-[#FBB6E6]" percentage={delPerc} />
          </div>
          
          <div className="pt-6 mt-2 border-t border-dashed border-gray-100 flex items-center gap-3">
             <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp size={16} className="text-green-600" />
             </div>
             <div>
                <p className="text-[8px] font-black text-gray-400 uppercase">Efficiency Score</p>
                <p className="text-xs font-black text-[#3E442B]">{netPerc.toFixed(1)}% <span className="text-gray-300 font-bold tracking-tighter ml-1">of gross revenue</span></p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ label, value, color, percentage }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${color} group-hover:scale-125 transition-transform`} />
        <div>
          <p className="text-[9px] font-black uppercase text-[#3E442B] tracking-tight">{label}</p>
          <p className="text-[8px] font-bold text-gray-400">{percentage.toFixed(1)}% of total</p>
        </div>
      </div>
      <p className="text-xs font-black text-[#3E442B]">৳{value.toLocaleString()}</p>
    </div>
  );
}