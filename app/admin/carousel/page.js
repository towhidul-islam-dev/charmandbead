"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Upload, X, Loader2, Trash2, Eye, EyeOff, 
  Image as ImageIcon, AlertCircle, CheckCircle2,
  Calendar 
} from "lucide-react";

export default function AdminCarousel() {
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [status, setStatus] = useState("");
  
  // 🟢 NEW STATE: Toast Notification
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Form States
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [priority, setPriority] = useState(0);

  // 🟢 NEW HELPER: Show Toast
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // 1. Fetch all slides
  const fetchSlides = useCallback(async () => {
    setLoadingSlides(true);
    try {
      const res = await fetch("/api/hero-slides?admin=true");
      if (!res.ok) throw new Error("Could not sync with Database");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setStatus("Error: Database sync failed");
    } finally {
      setLoadingSlides(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // 2. Toggle Active/Archive Status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/hero-slides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        await fetchSlides();
        triggerToast(currentStatus ? "Banner Archived" : "Banner is now Live!");
      }
    } catch (err) {
      triggerToast("Failed to update status", "error");
    }
  };

  // 3. Full Delete
  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this banner?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlides(prev => prev.filter(s => s._id !== id));
        triggerToast("Banner deleted successfully");
      }
    } catch (err) {
      triggerToast("Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatus("Uploading to Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "charmandbeads"); 

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/diabqgzyo/auto/upload`,
        { method: "POST", body: formData }
      );
      
      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error(cloudData.error?.message || "Cloudinary Upload Failed");

      const format = file.type === "application/pdf" ? "pdf" : file.type.includes("svg") ? "svg" : "image";

      setStatus("Saving to Database...");
      const res = await fetch("/api/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          link,
          priority: Number(priority),
          image: cloudData.secure_url,
          format,
          isActive: true
        }),
      });

      if (res.ok) {
        setStatus("Banner Added!");
        setFile(null);
        setPreview("");
        setTitle("");
        setLink("");
        setPriority(0);
        fetchSlides();
        triggerToast("New Campaign Launched!");
        setTimeout(() => setStatus(""), 4000);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "DB Save Failed");
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      triggerToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl min-h-screen p-6 mx-auto space-y-12 bg-white md:p-10 relative">
      <header className="flex items-center justify-between pb-8 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-[#3E442B] uppercase">
            Hero <span className="text-[#EA638C]">Banners</span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">
            Charm & Beads • Admin Panel
          </p>
        </div>
        
        {status && (
          <div className={`flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest animate-bounce ${
            status.includes("Error") 
              ? "bg-[#EA638C]/10 text-[#EA638C] border border-[#EA638C]/20" 
              : "bg-[#FBB6E6] text-[#3E442B]"
          }`}>
            {status.includes("Error") ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {status}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-10">
            <h2 className="text-[12px] font-black text-[#3E442B] uppercase tracking-widest mb-8 flex items-center gap-2">
               <ImageIcon size={16} className="text-[#EA638C]" /> New Campaign
            </h2>
            
            <div className="space-y-6">
              <label className="group relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-[#FBB6E6] rounded-[32px] cursor-pointer hover:bg-[#FBB6E6]/10 transition-all overflow-hidden bg-gray-50/50">
                {preview ? (
                  <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <div className="flex items-center justify-center w-12 h-12 mb-3 transition-transform bg-white rounded-full shadow-sm group-hover:scale-110">
                      <Upload size={20} className="text-[#EA638C]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Select Visual</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setFile(f);
                  setPreview(f.type.includes("pdf") ? "/pdf-placeholder.png" : URL.createObjectURL(f));
                }} />
              </label>

              <div className="space-y-4">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-[#3E442B] uppercase ml-2">Banner Heading</p>
                    <input type="text" placeholder="..." value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-[#FBB6E6] transition-all text-[11px] font-bold uppercase" required />
                </div>
                
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-[#3E442B] uppercase ml-2">Target Link</p>
                    <input type="text" placeholder="/shop/bracelets" value={link} onChange={e => setLink(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-[#FBB6E6] transition-all text-[11px] font-bold uppercase" required />
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Display Priority</span>
                  <input type="number" value={priority} onChange={e => setPriority(e.target.value)} className="w-16 bg-transparent outline-none text-right font-black text-[#3E442B] text-lg" />
                </div>
              </div>

              <button 
                disabled={uploading || !file} 
                className={`w-full py-5 rounded-[24px] font-black uppercase text-[12px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg ${
                  uploading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#3E442B] text-[#FBB6E6] hover:bg-[#EA638C] hover:text-white shadow-[#3E442B]/20'
                }`}
              >
                {uploading ? (
                  <><Loader2 className="animate-spin" size={18} /> Processing</>
                ) : (
                  "Launch Campaign"
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[13px] font-black text-[#3E442B] uppercase tracking-[0.25em]">Live Inventory</h2>
            <div className="flex-1 h-px mx-6 bg-gray-100"></div>
            <span className="text-[10px] font-black text-[#EA638C] bg-[#EA638C]/5 px-3 py-1 rounded-full uppercase">{slides.length} Slides</span>
          </div>

          {loadingSlides ? (
            <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100">
              <Loader2 className="animate-spin text-[#EA638C] mb-4" size={40} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing inventory...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {slides.map((slide) => (
                <div 
                  key={slide._id} 
                  className={`group flex items-center justify-between p-5 rounded-[32px] border transition-all duration-500 hover:scale-[1.01] ${
                    slide.isActive ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center min-w-0 gap-6">
                    <div className="relative w-36 h-20 bg-gray-100 rounded-[24px] overflow-hidden shadow-inner flex-shrink-0 border border-gray-100">
                      {slide.format === 'pdf' ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50 text-[#EA638C] text-[10px] font-black">CATALOGUE</div>
                      ) : (
                        <img src={slide.image} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!slide.isActive && 'grayscale'}`} alt="" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-black text-[12px] text-[#3E442B] uppercase tracking-wider">{slide.title}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-[8px] font-black text-[#3E442B] bg-[#FBB6E6] px-2 py-1 rounded-md uppercase tracking-tighter">
                          <Calendar size={10} /> 
                          {slide.createdAt ? new Date(slide.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'New'}
                        </span>

                        <span className="text-[9px] text-[#EA638C] font-black uppercase tracking-tighter bg-[#EA638C]/5 px-2 py-1 rounded-md">
                            P: {slide.priority}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold tracking-tighter truncate max-w-[120px]">
                            {slide.link}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pr-2">
                    <button 
                      onClick={() => toggleStatus(slide._id, slide.isActive)}
                      className={`p-4 rounded-2xl transition-all ${
                        slide.isActive 
                          ? 'text-[#3E442B] bg-[#FBB6E6] hover:bg-[#EA638C] hover:text-white' 
                          : 'text-gray-400 bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {slide.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>

                    <button 
                      onClick={() => handleDelete(slide._id)}
                      disabled={deletingId === slide._id}
                      className="p-4 text-gray-300 hover:text-white hover:bg-[#3E442B] rounded-2xl transition-all"
                    >
                      {deletingId === slide._id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 🟢 BRANDED TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-8 py-4 rounded-[24px] shadow-2xl border ${
            toast.type === "error" 
              ? "bg-[#EA638C] text-white border-[#EA638C]" 
              : "bg-[#3E442B] text-[#FBB6E6] border-[#FBB6E6]/20"
          }`}>
            {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
              {toast.message}
            </span>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 hover:opacity-50">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}