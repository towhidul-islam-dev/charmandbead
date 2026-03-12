"use client";

import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Loader2,
  MessageSquare,
  Download,
  X,
  Copy,
  User,
  RefreshCw,
  AlertCircle,
  Flame,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AdminProductLab() {
  const [recs, setRecs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [viewedNotes, setViewedNotes] = useState(new Set());

  const [activeModal, setActiveModal] = useState({
    id: null,
    imageUrl: null,
    top: 0,
    left: 0,
    openUpward: true,
  });

  useEffect(() => {
    fetchAllRecs();
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch("/api/admin/system/status");
      const data = await res.json();
      if (data.lastSync) setLastSync(data.lastSync);
    } catch (e) {
      console.error("Sync status fetch failed");
    }
  };

  const fetchAllRecs = async () => {
    try {
      const res = await fetch("/api/recommend/top-trends");
      const data = await res.json();
      if (Array.isArray(data)) setRecs(data);
    } catch (error) {
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleBackfillFingerprints = async () => {
    setIsSyncing(true);
    const loadingToast = toast.loading("AI is generating fingerprints for old images...");
    try {
      const res = await fetch("/api/admin/system/migrate-fingerprints?admin=true");
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message, { id: loadingToast });
        fetchAllRecs();
      } else {
        throw new Error(data.error || "Migration Failed");
      }
    } catch (error) {
      toast.error(`Migration failed: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAISmartMerge = async () => {
    setIsSyncing(true);
    const loadingToast = toast.loading("AI is analyzing visual fingerprints...");
    try {
      const res = await fetch("/api/admin/recommendations/smart-merge", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`AI Merge Success: ${data.mergedCount} items consolidated.`, { id: loadingToast });
        setLastSync(data.timestamp);
        fetchAllRecs();
      } else {
        throw new Error(data.error || "Authorization Failed");
      }
    } catch (error) {
      toast.error(`Sync failed: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSyncing(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Category", "Votes", "Voters", "Status"];
    const tableRows = filteredRecs.map((item) => [
      item.aiAnalysis?.category || "N/A",
      item.votes || 0,
      item.voterNames?.join(", ") || "No Voters",
      item.status || "Pending",
    ]);
    doc.setFontSize(18);
    doc.text("LAB CONTROL: TREND REPORT", 14, 22);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      headStyles: { fillColor: [62, 68, 43] },
      styles: { fontSize: 8 },
    });
    doc.save(`trend-report-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF Exported Successfully");
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const loadingToast = toast.loading(`Moving to ${newStatus}...`);
    try {
      const res = await fetch(`/api/admin/recommendations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Success: Item is now ${newStatus}`, { id: loadingToast });
        fetchAllRecs();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trend permanently?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/admin/recommendations/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully", { id: loadingToast });
        fetchAllRecs();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleNoteHover = (e, id, imageUrl) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = rect.top < 380;
    setViewedNotes((prev) => new Set(prev).add(id));
    setActiveModal({
      id,
      imageUrl,
      openUpward: !isTop,
      top: isTop ? rect.bottom + 16 : rect.top - 16,
      left: rect.left - 24,
    });
  };

  const filteredRecs = recs.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.aiAnalysis?.category?.toLowerCase().includes(search) ||
      r.userName?.toLowerCase().includes(search) ||
      r.voterNames?.some(v => v.toLowerCase().includes(search)) ||
      r.notes?.some((n) => n.body?.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-8 space-y-8 bg-[#F9FAFB] min-h-screen font-sans">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[#3E442B] uppercase italic tracking-tighter hover:text-black transition-colors">
            LAB <span className="text-[#EA638C]">CONTROL</span>
          </h1>
          {lastSync && (
            <div className="flex items-center gap-1.5 mt-1 opacity-60">
              <Clock size={10} className="text-[#EA638C]" />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Last AI Cleanse: {new Date(lastSync).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleBackfillFingerprints}
            className="flex items-center gap-2 px-6 py-4 bg-white text-[#3E442B] border-2 border-[#3E442B]/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#EA638C] transition-all"
          >
            <AlertCircle size={16} /> Repair Legacy
          </button>
          
          <button
            onClick={handleAISmartMerge}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-4 bg-[#EA638C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3E442B] transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            AI Cleanse Lab
          </button>

          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-6 py-4 bg-[#3E442B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Download size={16} /> Export Report
          </button>

          <div className="relative group">
            <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-[#EA638C] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search trends..."
              className="w-full py-4 pl-12 pr-6 text-sm transition-all bg-white border-none shadow-sm outline-none rounded-2xl md:w-80 placeholder:text-gray-300"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* FIXED STATS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 overflow-x-auto pb-2">
        <StatCard 
          label="Live Trends" 
          value={recs.length} 
          icon={<Clock className="text-blue-500" size={20} />} 
        />
        <StatCard 
          label="Total Votes" 
          value={recs.reduce((a, b) => a + (b.votes || 0), 0)} 
          icon={<Flame className="text-orange-500" size={20} />} 
        />
        <StatCard 
          label="Legacy Needs" 
          value={recs.filter(r => !r.imageFingerprint).length} 
          icon={<AlertCircle className="text-red-400" size={20} />} 
        />
        <StatCard 
          label="Awaiting Sourcing" 
          value={recs.filter((r) => r.status === "Pending" || !r.status).length} 
          icon={<Calendar className="text-orange-500" size={20} />} 
        />
        <StatCard 
          label="Successful Drops" 
          value={recs.filter((r) => r.status === "Stocked").length} 
          icon={<CheckCircle2 className="text-green-500" size={20} />} 
        />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Submission</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Recommender</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Voters</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">AI Insights</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="w-8 h-8 mx-auto text-gray-200 animate-spin" /></td></tr>
              ) : (
                filteredRecs.map((item) => (
                  <tr key={item._id} className="group hover:bg-[#FBB6E6]/5 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="relative w-16 h-16">
                          <img src={item.imageUrl} className="object-cover w-full h-full bg-gray-100 border-2 border-white shadow-lg rounded-2xl shrink-0" alt="trend" />
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
                            <Flame size={8} fill="currentColor" /> {item.votes || 0}
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-[#3E442B]/40 uppercase tracking-tighter">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-[#3E442B]">{item.userName || "Guest"}</p>
                        {item.notes?.length > 0 && (
                          <button onMouseEnter={(e) => handleNoteHover(e, item._id, item.imageUrl)} className="relative p-2 text-[#EA638C] bg-pink-50 rounded-lg shadow-sm">
                            <MessageSquare size={14} />
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA638C] text-[8px] font-bold text-white border border-white">
                              {item.notes.length}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 max-w-[140px]">
                        <div className="flex items-center gap-1 opacity-30">
                          <Users size={10} />
                          <span className="text-[9px] font-black uppercase">Voter List</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 line-clamp-1">
                          {item.voterNames?.length > 0 ? item.voterNames.join(", ") : "No votes"}
                        </p>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <span className="inline-block text-[10px] font-black uppercase px-2.5 py-1 bg-[#3E442B] text-white rounded-md">
                        {item.aiAnalysis?.category || "N/A"}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-center">
                      <select
                        value={item.status || "Pending"}
                        onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                        className={`text-[10px] font-black uppercase px-4 py-2.5 rounded-xl border-none ring-1 ring-black/5 min-w-[130px] appearance-none cursor-pointer text-center focus:ring-2 focus:ring-[#EA638C] ${
                          item.status === "Stocked" ? "bg-green-500 text-white" : item.status === "Coming Soon" ? "bg-[#EA638C] text-white" : item.status === "Sourcing" ? "bg-[#3E442B] text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <option value="Pending">🕒 Pending</option>
                        <option value="Sourcing">🔍 Sourcing</option>
                        <option value="Coming Soon">🚀 Coming Soon</option>
                        <option value="Stocked">✅ Stocked</option>
                      </select>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                        <button onClick={() => window.open(item.imageUrl, "_blank")} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-[#3E442B] shadow-sm transition-all">
                          <ExternalLink size={18} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-3 text-red-500 transition-all bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal.id && (
        <div
          className="fixed z-[10000] w-80 max-h-[420px] bg-[#3E442B] text-white rounded-[2rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: activeModal.openUpward ? "auto" : `${activeModal.top}px`,
            bottom: activeModal.openUpward ? `${window.innerHeight - activeModal.top}px` : "auto",
            left: `${activeModal.left}px`,
          }}
        >
          <div className="flex items-center gap-4 p-5 bg-black/20 rounded-t-[2rem]">
            <img src={activeModal.imageUrl} className="object-cover border-2 border-white shadow-md w-14 h-14 rounded-xl shrink-0" alt="trend context" />
            <div className="flex-1">
              <p className="font-black text-[#EA638C] uppercase tracking-widest text-[11px] mb-0.5">Lab Notes Log</p>
              <p className="text-[10px] opacity-60 font-bold uppercase">{recs.find((r) => r._id === activeModal.id)?.notes.length} Total Messages</p>
            </div>
            <button onClick={() => setActiveModal({ ...activeModal, id: null })} className="p-1.5 hover:bg-white/10 rounded-full transition-colors self-start">
              <X size={16} />
            </button>
          </div>
          <div className="p-6 space-y-5 overflow-y-auto max-h-72 custom-scrollbar">
            {recs.find((r) => r._id === activeModal.id)?.notes.map((note, idx) => (
              <div key={idx} className="group/note border-l-2 border-[#EA638C]/40 pl-4 relative">
                <p className="mb-1.5 italic font-medium leading-relaxed text-[12px]">"{note.body}"</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <User size={10} className="text-[#EA638C]" />
                    <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-wide">— {note.userName}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(note.body); toast.success("Copied!"); }} className="opacity-0 group-hover/note:opacity-100 p-1 hover:text-[#EA638C] transition-all">
                    <Copy size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={`modal-arrow left-7 ${activeModal.openUpward ? "-bottom-2" : "-top-2"}`}></div>
        </div>
      )}
    </div>
  );
}

// FIXED STATCARD COMPONENT
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-4 transition-all hover:shadow-md min-w-[170px] flex-nowrap">
      <div className="p-3 bg-gray-50 rounded-2xl shrink-0 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight leading-none mb-1 truncate">
          {label}
        </p>
        <p className="text-2xl font-black text-[#3E442B] leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}