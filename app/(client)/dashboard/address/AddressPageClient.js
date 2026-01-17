"use client";
import React, { useState, useMemo } from "react";
import { MapPin, Home, Phone, User, Save, Trash2, CheckCircle2, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { updateAddress, deleteAddress } from "@/actions/userActions";
import AddressDeleteModal from "@/components/AddressDeleteModal";

const DHAKA_ZONES = [
  "Badda", "Banani", "Banglamotor", "Bashundhara", "Cantonment", "Dhanmondi", 
  "Gulshan", "Jatrabari", "Khilgaon", "Mirpur", "Mohakhali", "Savar","Mohammadpur", 
  "Motijheel", "New Market", "Old Dhaka", "Pallabi", "Rampura", "Uttara"
];

export default function AddressPageClient({ initialData }) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(initialData?.address?.city || "");

  const hasAddress = !!(initialData?.address?.street || initialData?.address?.phone);

  const deliveryCharge = useMemo(() => {
    if (!selectedCity) return null;
    const isInsideDhaka = DHAKA_ZONES.some(zone => 
        selectedCity.toLowerCase().includes(zone.toLowerCase()) || 
        selectedCity.toLowerCase() === "dhaka"
    );
    return isInsideDhaka ? 80 : 130;
  }, [selectedCity]);

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      const result = await deleteAddress();
      if (result.success) {
        toast.success("Address cleared successfully");
        setIsModalOpen(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("deliveryCharge", deliveryCharge); 
    const result = await updateAddress(formData);

    if (result.success) {
      toast.success("Address and delivery rate saved!");
    } else {
      toast.error(result.error || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl px-4 py-10 mx-auto">
      <AddressDeleteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />

      {/* Header UI */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl italic font-black tracking-tight text-[#3E442B] uppercase">Shipping Address</h1>
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Manage your delivery locations</p>
        </div>
        {hasAddress && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase transition-colors hover:text-red-700 tracking-tighter">
            <Trash2 size={12} /> Clear Address
          </button>
        )}
      </div>

      {/* Saved Address Card - Themed to Pink/Olive */}
      {hasAddress && (
        <div className="mb-8 p-6 bg-pink-50/50 border border-pink-100 rounded-[2rem] relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <span className="bg-[#EA638C] text-white text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-widest">Saved</span>
                  <CheckCircle2 size={16} className="text-[#EA638C]" />
               </div>
               {deliveryCharge && (
                  <div className="flex items-center gap-1 text-[10px] font-black text-[#3E442B] uppercase tracking-wider">
                    <Truck size={14} className="text-[#EA638C]" /> Delivery: ৳{deliveryCharge}
                  </div>
               )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase font-black text-[#EA638C] mb-1 tracking-widest">Receiver</p>
                <p className="font-black text-[#3E442B] italic uppercase">{initialData.name}</p>
                <p className="flex items-center gap-1 mt-1 text-xs font-bold text-gray-500"><Phone size={12} /> {initialData.address.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-[#EA638C] mb-1 tracking-widest">Location</p>
                <p className="text-sm font-medium leading-relaxed text-[#3E442B]">
                  {initialData.address.street},<br />
                  <span className="font-black italic text-[#EA638C] uppercase">{initialData.address.city} {initialData.address.zipCode && `(${initialData.address.zipCode})`}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form UI */}
      <form onSubmit={handleSave} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input name="name" defaultValue={initialData?.name} type="text" className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#EA638C] font-bold text-[#3E442B]" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input name="phone" defaultValue={initialData?.address?.phone} type="text" placeholder="017XXXXXXXX" className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#EA638C] font-bold text-[#3E442B]" required />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Area / City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input 
                name="city" 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="e.g. Dhaka" 
                className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#EA638C] font-bold text-[#3E442B]" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Zip Code</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input 
                name="zipCode" 
                defaultValue={initialData?.address?.zipCode}
                type="text" 
                placeholder="1209" 
                className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#EA638C] font-bold text-[#3E442B]" 
                required 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Street Address</label>
          <div className="relative">
            <Home className="absolute text-gray-300 left-4 top-4" size={18} />
            <textarea name="street" defaultValue={initialData?.address?.street} rows="3" placeholder="House #, Road #, Area..." className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#EA638C] font-bold text-[#3E442B]" required />
          </div>
        </div>

        {deliveryCharge && (
          <div className="flex items-center justify-between p-4 border border-pink-100 bg-pink-50/30 rounded-2xl">
            <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest">Delivery Rate:</span>
            <span className="text-xl font-black text-[#3E442B]">৳{deliveryCharge}</span>
          </div>
        )}

        <button disabled={loading} className="w-full bg-[#3E442B] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all flex justify-center items-center gap-3 active:scale-95 uppercase tracking-tighter italic">
          {loading ? "Processing..." : <><Save size={20} /> Save Address</>}
        </button>
      </form>
    </div>
  );
}