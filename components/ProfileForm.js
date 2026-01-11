"use client";
import React, { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfile } from "@/actions/userActions";
import { useSession } from "next-auth/react";

export default function ProfileForm({ user, initials }) {
  const { update } = useSession(); // 💡 Used to refresh Navbar instantly
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.image || "");
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        toast.error("File is too large. Max 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (imagePreview) formData.append("image", imagePreview);

    const result = await updateProfile(formData);
    
    if (result.success) {
      // 💡 REFRESH SESSION: This tells the Navbar to update the image
      await update({
        ...user,
        image: imagePreview,
      });
      toast.success("Profile & Navbar updated!");
    } else {
      toast.error(result.error || "Update failed");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white border border-gray-100 shadow-sm rounded-[2.5rem]">
      <div className="flex flex-col items-start gap-4">
        <div className="relative group">
          <div className="w-32 h-32 p-1 rounded-[2.5rem] shadow-xl bg-[#EA638C]">
            <div className="flex items-center justify-center w-full h-full overflow-hidden bg-gray-100 border-4 border-white rounded-[2.3rem]">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="object-cover w-full h-full" />
              ) : (
                <div className="flex flex-col items-center">
                   <span className="text-2xl font-black tracking-tighter text-[#3E442B]">{initials}</span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-1 right-1 bg-[#3E442B] text-white p-2.5 rounded-2xl border-4 border-white shadow-lg hover:bg-[#EA638C] transition-all"
          >
            <Camera size={18} fill="currentColor" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#3E442B] uppercase italic tracking-tighter">Profile Picture</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">JPG or PNG. Max size 1MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
          <input name="name" type="text" defaultValue={user.name} className="w-full p-4 border border-gray-100 outline-none rounded-2xl focus:border-[#EA638C] font-bold text-[#3E442B]" />
        </div>
        <div className="space-y-1">
          <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
          <input type="email" disabled defaultValue={user.email} className="w-full p-4 font-bold text-gray-300 border cursor-not-allowed border-gray-50 rounded-2xl bg-gray-50" />
        </div>
        <div className="space-y-1">
          <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
          <input name="phone" type="text" defaultValue={user.addresses?.[0]?.phone || ""} className="w-full p-4 border border-gray-100 outline-none rounded-2xl focus:border-[#EA638C] font-bold text-[#3E442B]" />
        </div>
      </div>

      <div className="pt-4">
        <button disabled={loading} className="flex items-center justify-center w-full gap-2 px-10 py-4 font-black text-white transition-all bg-[#3E442B] rounded-2xl uppercase tracking-widest text-[11px] hover:bg-[#EA638C] disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Profile Changes"}
        </button>
      </div>
    </form>
  );
}