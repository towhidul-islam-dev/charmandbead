"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Upload, Sparkles, Trophy, Zap, 
  Package, Heart, ExternalLink,
  Loader2, Check, Fingerprint, X
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProductLabPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [statusStep, setStatusStep] = useState(0); 
  const [trends, setTrends] = useState([]);
  const [userNote, setUserNote] = useState(""); 
  const [lastSync, setLastSync] = useState(null);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  useEffect(() => {
    fetchTrends();
    fetchSyncStatus();
  }, []);

  const fetchTrends = async () => {
    try {
      const res = await fetch("/api/recommend/top-trends");
      const data = await res.json();
      if (Array.isArray(data)) setTrends(data);
    } catch (err) {
      console.error("Failed to fetch trends:", err);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch("/api/admin/system/status");
      const data = await res.json();
      if (data.lastSync) setLastSync(data.lastSync);
    } catch (e) {
      console.log("Sync status not available");
    }
  };

  const activeTrends = trends.filter(t => t.status !== "Stocked");
  const stockedItems = trends.filter(t => t.status === "Stocked");

  // UPDATED: Now accepts 'choice' (yes/no)
  const handleVote = async (id, choice) => {
    try {
      const res = await fetch("/api/recommend/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, choice }),
      });
      const data = await res.json();

      if (res.ok) {
        const message = choice === 'yes' ? "Identity Verified!" : "Feedback Noted";
        toast.success(message, { id: "vote-success", icon: choice === 'yes' ? "🧬" : "🖇️" });
        fetchTrends();
      } else {
        toast.error(data.error || "Verification failed.", {
          id: "vote-error",
          icon: res.status === 403 ? "🚫" : "❌"
        });
      }
    } catch (err) {
      toast.error("Connection error.", { id: "vote-net-error" });
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!CLOUD_NAME) {
      toast.error("Cloudinary Configuration Error");
      return;
    }

    setUploading(true);
    setStatusStep(1);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "product_lab");

    try {
      const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!cldRes.ok) throw new Error("Image upload failed");
      const cldData = await cldRes.json();

      setStatusStep(2); 
      const aiRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageUrl: cldData.secure_url, 
          userName: session?.user?.name || "Guest User",
          userNote: userNote 
        }),
      });

      if (!aiRes.ok) throw new Error("AI analysis failed");

      setStatusStep(3);
      toast.success("AI Analysis Complete!", { id: "upload-success", icon: '✨' });
      setUserNote(""); 
      await fetchTrends();

    } catch (err) {
      toast.error(err.message, { id: "upload-error" });
      setUploading(false);
      setStatusStep(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setStatusStep(0);
      }, 3000);
      e.target.value = ""; 
    }
  };

  return (
    <div className="min-h-screen p-4 mx-auto space-y-20 font-sans bg-white max-w-7xl md:p-8">
      
      {/* HEADER */}
      <header className="py-10 mt-10 space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100 mb-2">
          <Zap size={14} className="text-[#EA638C] fill-current" />
          <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest">Community Curated Drops</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase text-[#3E442B] leading-[0.85]">
          PRODUCT <span className="text-[#EA638C]">LAB</span>
        </h1>
        <p className="text-gray-400 text-[10px] font-black tracking-[0.4em] uppercase max-w-lg mx-auto leading-relaxed">
          From your moodboard to our store. Help us decide the next treasure drop.
        </p>
        
        {lastSync && (
          <div className="flex items-center justify-center gap-1.5 opacity-60">
             <Sparkles size={10} className="text-[#EA638C]" />
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
               Last AI Cleanse: {new Date(lastSync).toLocaleString()}
             </p>
          </div>
        )}
      </header>

      {/* UPLOAD SECTION */}
      <div className="relative bg-[#FBB6E6]/10 border-4 border-dashed border-[#FBB6E6]/30 rounded-[4rem] p-8 md:p-16 overflow-hidden shadow-inner">
        {uploading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in">
            <div className="flex flex-col items-center w-full max-w-xs space-y-6">
              <div className="relative flex items-center justify-center w-20 h-20">
                {statusStep < 3 ? <Loader2 className="w-full h-full text-[#EA638C] animate-spin" /> : 
                <div className="w-full h-full bg-[#3E442B] rounded-full flex items-center justify-center animate-in zoom-in"><Check className="w-10 h-10 text-white" /></div>}
              </div>
              <div className="w-full space-y-3">
                <StatusItem label="Uploading to Cloud" active={statusStep === 1} done={statusStep > 1} />
                <StatusItem label="AI Analysis" active={statusStep === 2} done={statusStep > 2} />
                <StatusItem label="Finalizing Drop" active={statusStep === 3} done={statusStep >= 3} />
              </div>
            </div>
          </div>
        )}

        <div className="grid items-center max-w-5xl grid-cols-1 gap-12 mx-auto md:grid-cols-2">
          <div className="relative group flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] shadow-xl border border-[#FBB6E6]/20 transition-all hover:scale-[1.02]">
            <input type="file" onChange={handleUpload} className="absolute inset-0 z-20 opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={uploading} accept="image/*" />
            <div className="p-7 mb-5 bg-pink-50 rounded-full text-[#EA638C] group-hover:bg-[#EA638C] group-hover:text-white transition-colors">
              <Upload size={36} />
            </div>
            <h3 className="font-black text-2xl uppercase tracking-tighter text-[#3E442B]">Drop Image</h3>
            <p className="text-[10px] font-black text-[#EA638C] uppercase tracking-[0.2em] mt-2">Identify trend instantly</p>
          </div>

          <div className="flex flex-col gap-5 text-left">
            <div>
              <h2 className="font-black text-3xl uppercase tracking-tighter text-[#3E442B] italic">Lab Notes</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                Posting as <span className="text-[#EA638C]">{session?.user?.name || "Guest"}</span>
              </p>
            </div>
            <textarea value={userNote} onChange={(e) => setUserNote(e.target.value)} placeholder="Tell us about this style..." className="w-full h-40 p-6 bg-white rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-[#EA638C]/10 outline-none text-sm text-[#3E442B] font-medium resize-none placeholder:text-gray-300" />
            <div className="flex items-center gap-2 px-5 py-3 bg-[#3E442B]/5 rounded-2xl border border-[#3E442B]/10">
              <Sparkles size={16} className="text-[#3E442B]" />
              <span className="text-[10px] font-bold text-[#3E442B] uppercase tracking-wider">AI processes your photo & notes</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRENDING SECTION */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 pb-6 border-b-2 border-gray-50">
          <div className="p-3 bg-[#3E442B] rounded-2xl text-white shadow-lg shadow-[#3E442B]/20">
            <Trophy size={24} />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#3E442B]">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {activeTrends.map((trend, i) => (
            <TrendCard key={trend._id} trend={trend} rank={i + 1} onVote={handleVote} />
          ))}
        </div>
      </section>

      {/* SUCCESS GALLERY */}
      {stockedItems.length > 0 && (
        <section className="pt-12 pb-20">
          <div className="bg-[#3E442B] rounded-[4rem] p-10 md:p-20 text-white relative shadow-2xl overflow-hidden">
            <div className="relative z-10 space-y-12">
              <div className="text-center md:text-left">
                <h2 className="text-4xl italic font-black tracking-tighter uppercase md:text-5xl">Community Wins</h2>
                <p className="text-xs font-bold text-pink-200 uppercase tracking-[0.4em]">From Lab to Stock</p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stockedItems.map((item) => (
                  <SuccessCard key={item._id} item={item} onShop={(cat) => router.push(`/products?search=${cat}`)} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// COMPONENTS
function StatusItem({ label, active, done }) {
  return (
    <div className={`flex items-center gap-3 transition-all duration-500 ${active ? 'opacity-100 scale-105' : 'opacity-40'}`}>
      <div className={`w-2 h-2 rounded-full ${done ? 'bg-green-500' : (active ? 'bg-[#EA638C] animate-pulse' : 'bg-gray-300')}`} />
      <span className={`text-[11px] font-black uppercase tracking-widest ${done ? 'line-through text-gray-400' : 'text-[#3E442B]'}`}>
        {label}
      </span>
    </div>
  );
}

function TrendCard({ trend, rank, onVote }) {
  const [showOptions, setShowOptions] = useState(false);
  
  const statusColors = {
    "Coming Soon": "bg-[#EA638C] text-white",
    "Sourcing": "bg-[#3E442B] text-white",
    "default": "bg-white/90 text-[#3E442B] border border-gray-100"
  };

  const handleChoice = (choice) => {
    // UPDATED: Pass the choice up to parent handleVote
    onVote(trend._id, choice);
    setShowOptions(false);
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border border-gray-100 p-5 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2">
      <div className="relative aspect-[4/5] rounded-[1.8rem] overflow-hidden bg-gray-50 mb-5">
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[9px] font-black uppercase z-20 ${statusColors[trend.status] || statusColors.default}`}>
           {trend.status || "Pending"}
        </div>
        <div className="absolute top-3 left-3 bg-[#3E442B] text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10">#{rank}</div>
        
        {/* BINARY VOTING OVERLAY */}
        {showOptions && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-[#3E442B]/95 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <div className="mb-4 p-2 bg-white/10 rounded-full">
              <Fingerprint size={20} className="text-[#EA638C]" />
            </div>
            <p className="mb-5 text-[10px] font-black text-center text-white uppercase tracking-[0.2em]">Should we bring this item?</p>
            
            <div className="flex flex-col w-full gap-2">
              <button 
                onClick={() => handleChoice('yes')}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#EA638C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
              >
                <Heart size={14} fill="currentColor" /> Yes
              </button>
              <button 
                onClick={() => handleChoice('no')}
                className="flex items-center justify-center gap-2 w-full py-3 text-white/40 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                <X size={14} /> Skip
              </button>
            </div>
          </div>
        )}

        <img src={trend.imageUrl} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" alt="trend" />
      </div>

      <div className="px-1">
        <h3 className="font-black text-lg uppercase text-[#3E442B] truncate">{trend.aiAnalysis.category}</h3>
        <p className="text-[10px] font-bold text-[#EA638C] uppercase tracking-widest">{trend.aiAnalysis.style}</p>
        <div className="flex items-center justify-between mt-6">
          <div className="px-4 py-2 border border-gray-100 rounded-full bg-gray-50 font-black text-[10px] text-[#3E442B] uppercase tracking-widest">
            {trend.votes} Marks
          </div>
          
          <button 
            onClick={() => setShowOptions(!showOptions)} 
            className={`relative p-3.5 rounded-2xl transition-all shadow-xl active:scale-90 z-40 ${
              showOptions 
                ? 'bg-white text-[#EA638C] rotate-90' 
                : 'bg-[#3E442B] text-white hover:bg-[#EA638C]'
            }`}
          >
            {showOptions ? <X size={20} /> : <Fingerprint size={20} className="animate-pulse" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessCard({ item, onShop }) {
  return (
    <div onClick={() => onShop(item.aiAnalysis.category)} className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-5 border border-white/10 group cursor-pointer transition-all hover:bg-white/20 shadow-lg">
      <div className="relative aspect-square rounded-[1.8rem] overflow-hidden mb-5">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 transition-opacity opacity-0 bg-black/60 group-hover:opacity-100">
          <span className="bg-white text-[#3E442B] px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-tighter shadow-xl">Shop Now</span>
        </div>
        <img src={item.imageUrl} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" alt="stocked" />
      </div>
      <div className="flex items-start justify-between px-1 text-white">
        <div className="max-w-[80%]">
          <p className="text-lg font-black leading-none uppercase truncate">{item.aiAnalysis.category}</p>
          <p className="text-[10px] font-bold text-pink-100 uppercase mt-2">Verified Drop</p>
        </div>
        <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-[#EA638C] transition-colors"><ExternalLink size={16} /></div>
      </div>
    </div>
  );
}