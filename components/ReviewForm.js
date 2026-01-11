"use client";
import React, { useState, useRef } from "react";
import { Camera, User, Mail, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfile } from "@/actions/userActions";

export default function ProfileForm({ user, initials }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.image || "");
  const fileInputRef = useRef(null);

  // Function to handle image selection and conversion to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit for Base64 storage
        return toast.error("Image must be less than 1MB");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Append the image preview (Base64) to formData
    formData.append("image", imagePreview);

    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Update failed");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 📸 Image Upload Section */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
          >
            <Camera size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Profile Picture</h3>
          <p className="text-xs text-gray-500">JPG, PNG or Gif. Max size 1MB.</p>
        </div>
      </div>

      {/* 📝 Fields Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              name="name"
              defaultValue={user.name}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-300" size={18} />
            <input 
              disabled
              defaultValue={user.email}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              name="phone"
              defaultValue={user.addresses?.[0]?.phone || ""}
              placeholder="+880..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Profile Changes"}
      </button>
    </form>
  );
}