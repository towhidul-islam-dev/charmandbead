"use client";
import React, { useState, useMemo } from "react";
import { MapPin, Home, Phone, User, Save, Trash2, CheckCircle2, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { updateAddress, deleteAddress } from "@/actions/userActions";
import AddressDeleteModal from "@/components/AddressDeleteModal";

// 💡 Predefined Dhaka Zones to identify "Inside Dhaka"
const DHAKA_ZONES = [
  "Badda", "Banani", "Banglamotor", "Bashundhara", "Cantonment", "Dhanmondi", 
  "Gulshan", "Jatrabari", "Khilgaon", "Mirpur", "Mohakhali", "Savar","Mohammadpur", 
  "Motijheel", "New Market", "Old Dhaka", "Pallabi", "Rampura", "Uttara"
];

export default function AddressPageClient({ initialData }) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 💡 State to track city for real-time delivery charge preview
  const [selectedCity, setSelectedCity] = useState(initialData?.address?.city || "");

  const hasAddress = !!(initialData?.address?.street || initialData?.address?.phone);

  // 💡 Logic to determine delivery charge
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
        // Using window.location.reload() to refresh the server props (initialData)
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
  
  // 💡 Add the calculated delivery charge to the formData manually
  // This ensures your server action receives the correct number
  formData.append("deliveryCharge", deliveryCharge); 

  const result = await updateAddress(formData);

  if (result.success) {
    toast.success("Address and delivery rate saved!");
  } else {
    toast.error(result.error || "Something went wrong");
  }
  setLoading(false);
}

  // ... (handleConfirmDelete remains the same)

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Shipping Address</h1>
          <p className="text-sm text-gray-500">Manage your delivery locations</p>
        </div>
        {hasAddress && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-xs font-bold text-red-500 uppercase transition-colors hover:text-red-700">
            <Trash2 size={14} /> Clear Address
          </button>
        )}
      </div>

      {/* Saved Address Card */}
      {hasAddress && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-widest">Primary</span>
                  <CheckCircle2 size={16} className="text-blue-600" />
               </div>
               {deliveryCharge && (
                  <div className="flex items-center gap-1 text-xs font-black text-blue-700 uppercase">
                    <Truck size={14} /> Delivery: ৳{deliveryCharge}
                  </div>
               )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Receiver</p>
                <p className="font-bold text-gray-900">{initialData.name}</p>
                <p className="flex items-center gap-1 mt-1 text-sm text-gray-600"><Phone size={12} /> {initialData.address.phone}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Location</p>
                <p className="text-sm font-medium leading-relaxed text-gray-900">
                  {initialData.address.street},<br />
                  <span className="font-bold text-blue-600">{initialData.address.city} {initialData.address.zipCode && `(${initialData.address.zipCode})`}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-xs font-black text-gray-400 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input name="name" defaultValue={initialData?.name} type="text" className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-xs font-black text-gray-400 uppercase">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input name="phone" defaultValue={initialData?.address?.phone} type="text" placeholder="017XXXXXXXX" className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-xs font-black text-gray-400 uppercase">Area / City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                name="city" 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="e.g. Dhaka or Chittagong" 
                className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-xs font-black text-gray-400 uppercase">Zip Code</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                name="zipCode" 
                defaultValue={initialData?.address?.zipCode}
                type="text" 
                placeholder="1209" 
                className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-black text-gray-400 uppercase">Street Address</label>
          <div className="relative">
            <Home className="absolute text-gray-400 left-4 top-4" size={18} />
            <textarea name="street" defaultValue={initialData?.address?.street} rows="3" placeholder="House #12, Road #5, Dhanmondi..." className="w-full py-4 pl-12 pr-4 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>

        {deliveryCharge && (
          <div className="flex items-center justify-between p-4 border border-green-100 bg-green-50 rounded-2xl">
            <span className="text-sm font-bold text-green-700">Estimated Delivery Charge:</span>
            <span className="text-lg font-black text-green-700">৳{deliveryCharge}</span>
          </div>
        )}

        <button disabled={loading} className="w-full bg-[#00B65E] text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-green-100 hover:bg-[#009E51] transition-all flex justify-center items-center gap-3 active:scale-95">
          {loading ? "Processing..." : <><Save size={22} /> Save Shipping Info</>}
        </button>
      </form>
    </div>
  );
}