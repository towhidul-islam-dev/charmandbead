"use client";
import { useState } from 'react';
import { Gift, Power, Trash2, Edit3, Plus } from 'lucide-react';
import { toggleGiftStatus, deleteGift } from '@/actions/surprise';
import toast from 'react-hot-toast';
import GiftFormModal from './GiftFormModal';

export default function GiftManager({ gifts: initialGifts }) {
  const [gifts, setGifts] = useState(initialGifts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);

  /**
   * 🟢 EXTRACTION LOGIC
   * Extracts digits from the coupon code (e.g., "PROMO50" -> 50)
   * This ensures the UI reflects the code's value even if the 'value' prop differs.
   */
  const getExtractedValue = (code, fallback) => {
    const match = code.match(/\d+/);
    return match ? parseInt(match[0]) : fallback;
  };

  const handleToggle = async (id) => {
    const res = await toggleGiftStatus(id);
    if (res.success) {
      toast.success("Status updated");
      setGifts(gifts.map(g => g._id === id ? { ...g, isActive: !g.isActive } : g));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This gift will be removed from the registry.")) return;
    const res = await deleteGift(id);
    if (res.success) {
      toast.success("Gift deleted");
      setGifts(gifts.filter(g => g._id !== id));
    }
  };

  const openCreateModal = () => {
    setEditingGift(null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#3E442B] uppercase italic leading-none">
            Gift <span className="text-[#EA638C]">Control</span>
          </h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Manage Surprise Rewards</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[#EA638C] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3E442B] transition-all flex items-center gap-2 shadow-lg shadow-[#EA638C]/20"
        >
          <Plus size={14} /> Create New Gift
        </button>
      </div>

      {/* Gift List */}
      <div className="space-y-4">
        {gifts.length > 0 ? (
          gifts.map((gift) => {
            // Logic to sync the UI with the Coupon Code number
            const couponValue = getExtractedValue(gift.code, gift.value);
            const displayPercent = gift.discountType === 'percentage' ? `${couponValue}%` : `৳${couponValue}`;

            return (
              <div key={gift._id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-gray-50 bg-[#FAFAFA] hover:border-[#FBB6E6]/50 transition-all duration-300">
                
                {/* Left: Gift Info */}
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-all duration-500 ${gift.isActive ? 'bg-[#EA638C] text-white shadow-lg shadow-[#EA638C]/30' : 'bg-gray-200 text-gray-400'}`}>
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#3E442B] uppercase tracking-tight">{gift.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-[#EA638C] bg-[#EA638C]/10 px-2 py-0.5 rounded-full tracking-widest uppercase">
                        {gift.code}
                      </span>
                      <span className="text-[9px] font-black text-[#3E442B] uppercase bg-white px-2 py-0.5 rounded-full border border-gray-100">
                        {displayPercent} OFF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Visualization & Actions */}
                <div className="flex items-center justify-between gap-8 mt-4 md:mt-0">
                  
                  {/* Probability / Value Bar */}
                  <div className="w-32">
                    <div className="flex justify-between items-center mb-1.5">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Value Power</p>
                        <p className="text-[8px] font-black text-[#EA638C] uppercase">{couponValue}%</p>
                    </div>
                    <div className="w-full h-1.5 overflow-hidden bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-[#EA638C] transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(couponValue, 100)}%` }} 
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Status Toggle */}
                    <button 
                      onClick={() => handleToggle(gift._id)}
                      className={`p-3 rounded-xl transition-all ${gift.isActive ? 'bg-green-100 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white'}`}
                      title="Toggle Status"
                    >
                      <Power size={18} />
                    </button>
                    
                    {/* Edit Button */}
                    <button 
                      onClick={() => { setEditingGift(gift); setIsModalOpen(true); }}
                      className="p-3 bg-white text-[#3E442B] rounded-xl shadow-sm border border-gray-100 hover:text-[#EA638C] hover:border-[#FBB6E6] transition-all"
                    >
                      <Edit3 size={18} />
                    </button>

                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(gift._id)}
                      className="p-3 bg-white text-[#3E442B] rounded-xl shadow-sm border border-gray-100 hover:text-red-500 hover:border-red-200 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30">
            <Gift size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No gifts in the registry</p>
          </div>
        )}
      </div>

      {/* Modal Integration */}
      {isModalOpen && (
        <GiftFormModal 
          gift={editingGift} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}