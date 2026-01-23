// components/admin/GiftFormModal.js
"use client";
import { useState } from 'react';
import { X } from 'lucide-react';
import { saveGift } from '@/actions/surprise';
import toast from 'react-hot-toast';

export default function GiftFormModal({ gift, onClose }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(gift || {
    title: "",
    code: "",
    discountType: "percentage",
    value: 0,
    probability: 10,
    minPurchase: 0,
    isActive: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveGift(formData);
    if (res.success) {
      toast.success(res.message);
      onClose();
      window.location.reload(); // Refresh to show new data
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#3E442B]/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-[#3E442B] p-6 text-white flex justify-between items-center">
          <h2 className="text-xl italic font-black tracking-tighter uppercase">Configure <span className="text-[#EA638C]">Gift</span></h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Gift Title</label>
              <input 
                required
                className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-[#EA638C]"
                placeholder="e.g. New Year Surprise"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Coupon Code</label>
              <input 
                required
                className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold uppercase outline-none focus:border-[#EA638C]"
                placeholder="GIFT20"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Probability (0-100%)</label>
              <input 
                type="number"
                required
                className="w-full mt-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-[#EA638C]"
                value={formData.probability}
                onChange={(e) => setFormData({...formData, probability: Number(e.target.value)})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#EA638C] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#3E442B] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Deploy to Registry"}
          </button>
        </form>
      </div>
    </div>
  );
}