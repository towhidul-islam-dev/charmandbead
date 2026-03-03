"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Upload, X, Loader2, Trash2, Eye, EyeOff, 
  Image as ImageIcon, AlertCircle, CheckCircle2 
} from "lucide-react";

export default function AdminCarousel() {
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [status, setStatus] = useState("");

  // Form States
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [priority, setPriority] = useState(0);

  // 1. Fetch all slides
  const fetchSlides = useCallback(async () => {
    setLoadingSlides(true);
    try {
      const res = await fetch("/api/hero-slides?admin=true");
      if (!res.ok) throw new Error("Failed to fetch slides");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setStatus("Error loading banners");
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
      if (res.ok) fetchSlides();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // 3. Delete Slide
  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this banner?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlides(slides.filter(s => s._id !== id));
      } else {
        throw new Error("Delete failed on server");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete banner");
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
        setStatus("Please select a file first");
        return;
    }

    setUploading(true);
    setStatus("Uploading to Cloudinary...");

    try {
      // Step A: Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      // 🟢 IMPORTANT: Replace 'your_preset_name' with your actual UNSIGNED preset from Cloudinary settings
      formData.append("upload_preset", "your_preset_name"); 

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData }
      );
      
      const cloudData = await cloudRes.json();
      
      if (!cloudData.secure_url) {
        console.error("Cloudinary Error:", cloudData);
        throw new Error("Image upload failed. Check your Cloudinary Cloud Name and Preset.");
      }

      const format = file.type === "application/pdf" ? "pdf" : file.type.includes("svg") ? "svg" : "image";

      // Step B: Save metadata to MongoDB
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

      const dbResponse = await res.json();

      if (res.ok) {
        setStatus("Banner Added!");
        setFile(null);
        setPreview("");
        setTitle("");
        setLink("");
        setPriority(0);
        fetchSlides();
        setTimeout(() => setStatus(""), 4000);
      } else {
        console.error("Database Save Error Details:", dbResponse);
        throw new Error(dbResponse.error || "Failed to save to database");
      }

    } catch (err) {
      console.error("Submission Error:", err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-[#3E442B] uppercase">
            Hero <span className="text-[#EA638C]">Banners</span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Manage homepage promotional slides
          </p>
        </div>
        
        {status && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight animate-in fade-in slide-in-from-top-2 duration-300 ${
            status.includes("Error") ? "bg-red-50 text-red-500" : "bg-[#FBB6E6] text-[#3E442B]"
          }`}>
            {status.includes("Error") ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {status}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- LEFT: UPLOAD FORM --- */}
        <section className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-10">
            <h2 className="text-sm font-black text-[#3E442B] uppercase tracking-wider mb-6">Add New Banner</h2>
            
            <div className="space-y-4">
              <label className="group relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#FBB6E6] transition-all overflow-hidden bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload size={24} className="mb-2 group-hover:text-[#EA638C]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Select Image / PDF</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setFile(f);
                  setPreview(f.type.includes("pdf") ? "/pdf-placeholder.png" : URL.createObjectURL(f));
                }} />
              </label>

              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="BANNER TITLE" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-[#FBB6E6] transition-all text-[11px] font-bold uppercase tracking-wider" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="LINK (E.G. /SHOP)" 
                  value={link} 
                  onChange={e => setLink(e.target.value)} 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-[#FBB6E6] transition-all text-[11px] font-bold uppercase tracking-wider" 
                  required 
                />
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Priority Weight</span>
                  <input 
                    type="number" 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)} 
                    className="w-16 bg-transparent outline-none text-right font-black text-[#3E442B]" 
                  />
                </div>
              </div>

              <button 
                disabled={uploading || !file} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3E442B]/10 ${
                  uploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#3E442B] text-[#FBB6E6] hover:bg-[#EA638C] hover:text-white'
                }`}
              >
                {uploading ? (
                  <><Loader2 className="animate-spin" size={16} /> Processing...</>
                ) : (
                  "Deploy Banner"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* --- RIGHT: LIST & MANAGEMENT --- */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black text-[#3E442B] uppercase tracking-[0.2em]">Active Inventory</h2>
            <span className="text-[10px] font-black text-gray-300 uppercase">{slides.length} Total</span>
          </div>

          {loadingSlides ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <Loader2 className="animate-spin text-[#EA638C] mb-4" size={32} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing with database...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {slides.map((slide) => (
                <div 
                  key={slide._id} 
                  className={`flex items-center justify-between p-4 rounded-[24px] border transition-all duration-500 ${
                    slide.isActive ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-transparent grayscale opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="relative w-28 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 border border-gray-50">
                      {slide.format === 'pdf' ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-400 text-[10px] font-black">PDF</div>
                      ) : (
                        <img src={slide.image} className="w-full h-full object-cover" alt="" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-black text-[11px] text-[#3E442B] uppercase tracking-wider truncate">{slide.title}</p>
                      <p className="text-[9px] text-[#EA638C] font-black uppercase tracking-tighter mt-1">{slide.link || 'NO LINK'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(slide._id, slide.isActive)}
                      className={`p-3 rounded-xl transition-all ${
                        slide.isActive 
                          ? 'text-[#3E442B] bg-[#FBB6E6]/30 hover:bg-[#FBB6E6]' 
                          : 'text-gray-400 bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {slide.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    <button 
                      onClick={() => handleDelete(slide._id)}
                      disabled={deletingId === slide._id}
                      className="p-3 text-gray-300 hover:text-white hover:bg-[#EA638C] rounded-xl transition-all"
                    >
                      {deletingId === slide._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              ))}

              {slides.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-gray-200">
                  <ImageIcon className="mx-auto text-gray-100 mb-4" size={48} />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Gallery Empty</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}