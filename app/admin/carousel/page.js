"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Upload, X, Loader2, Trash2, Eye, EyeOff, 
  Image as ImageIcon, AlertCircle, CheckCircle2 
} from "lucide-react";
import Image from "next/image";

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

  // 1. Fetch all slides (Admin view includes archived)
  const fetchSlides = useCallback(async () => {
    setLoadingSlides(true);
    try {
      const res = await fetch("/api/hero-slides?admin=true");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      console.error("Fetch Error:", err);
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

  // 3. Full Delete (DB + Cloudinary)
  const handleDelete = async (id) => {
    if (!confirm("This will permanently delete the file from Cloudinary and Database. Continue?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlides(slides.filter(s => s._id !== id));
      }
    } catch (err) {
      alert("Delete failed");
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
      formData.append("upload_preset", "your_preset_name"); // REPLACE WITH YOUR PRESET

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData }
      );
      const cloudData = await cloudRes.json();

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
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (err) {
      setStatus("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif italic text-[#3E442B]">Hero <span className="text-[#EA638C]">Banners</span></h1>
          <p className="text-sm text-gray-500 mt-1">Manage your homepage promotion slides</p>
        </div>
        {status === "Banner Added!" && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full animate-bounce">
            <CheckCircle2 size={18} /> <span className="text-sm font-bold">Live Now</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- LEFT: UPLOAD FORM --- */}
        <section className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-10">
            <h2 className="text-lg font-bold text-[#3E442B] mb-4">Add New Banner</h2>
            
            <div className="space-y-4">
              <label className="group relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#FBB6E6] transition-all overflow-hidden bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload size={24} className="mb-2 group-hover:text-[#EA638C]" />
                    <span className="text-xs font-medium uppercase tracking-widest">SVG, PNG, PDF</span>
                  </div>
                )}
                <input type="file" className="hidden" onChange={(e) => {
                  const f = e.target.files[0];
                  setFile(f);
                  setPreview(f.type.includes("pdf") ? "/pdf-placeholder.png" : URL.createObjectURL(f));
                }} />
              </label>

              <input type="text" placeholder="Banner Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#FBB6E6] transition-all text-sm" required />
              <input type="text" placeholder="Link (e.g., /products)" value={link} onChange={e => setLink(e.target.value)} className="w-full p-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#FBB6E6] transition-all text-sm" required />
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase">Priority:</span>
                <input type="number" value={priority} onChange={e => setPriority(e.target.value)} className="w-20 p-2 bg-gray-50 rounded-lg outline-none text-center font-bold text-[#3E442B]" />
              </div>

              <button 
                disabled={uploading || !file} 
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-[#3E442B] text-[#FBB6E6] hover:bg-[#EA638C] hover:text-white'}`}
              >
                {uploading ? <><Loader2 className="animate-spin" size={18} /> {status}</> : "Launch Banner"}
              </button>
            </div>
          </form>
        </section>

        {/* --- RIGHT: LIST & MANAGEMENT --- */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-[#3E442B]">Current Banners</h2>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{slides.length} Items</span>
          </div>

          {loadingSlides ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-100">
              <Loader2 className="animate-spin text-[#EA638C] mb-2" />
              <p className="text-sm text-gray-400">Loading Database...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {slides.map((slide) => (
                <div 
                  key={slide._id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${slide.isActive ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-75'}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-24 h-14 bg-gray-200 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                      {slide.format === 'pdf' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-500 font-bold text-[10px]">PDF</div>
                      ) : (
                        <img src={slide.image} className={`w-full h-full object-cover ${!slide.isActive && 'grayscale'}`} alt="" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className={`font-bold text-sm ${slide.isActive ? 'text-[#3E442B]' : 'text-gray-400'}`}>{slide.title}</p>
                      <p className="text-[10px] text-[#EA638C] font-mono mt-0.5">{slide.link}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle Button */}
                    <button 
                      onClick={() => toggleStatus(slide._id, slide.isActive)}
                      className={`p-2.5 rounded-xl transition-all ${slide.isActive ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-200'}`}
                      title={slide.isActive ? "Deactivate (Archive)" : "Activate"}
                    >
                      {slide.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(slide._id)}
                      disabled={deletingId === slide._id}
                      className="p-2.5 text-gray-300 hover:text-[#EA638C] hover:bg-pink-50 rounded-xl transition-all"
                    >
                      {deletingId === slide._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              ))}

              {slides.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <ImageIcon className="mx-auto text-gray-200 mb-2" size={40} />
                  <p className="text-sm text-gray-400">Your carousel is empty.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}