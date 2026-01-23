"use client";
import { useState } from "react";
import { Send, Gift } from "lucide-react";
import { distributeGift } from "@/actions/surprise";
import toast from "react-hot-toast";

export default function UserGiftActions({ userId, userName, availableGifts }) {
  const [selectedGiftId, setSelectedGiftId] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Extraction Logic: Pulls number from code (e.g., "GIFT25" -> 25)
  const getGiftPercentage = (code, fallbackValue) => {
    const match = code.match(/\d+/);
    return match ? match[0] : fallbackValue;
  };

  const handleSendGift = async () => {
    if (!selectedGiftId) return toast.error("Please select a gift type");
    
    setLoading(true);
    try {
      const res = await distributeGift(userId, selectedGiftId);
      if (res.success) {
        toast.success(`Gift sent to ${userName}!`);
        setSelectedGiftId("");
      } else {
        toast.error(res.error || "Failed to send gift");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 group/gift-action">
      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EA638C]">
          <Gift size={14} />
        </div>
        
        <select
          value={selectedGiftId}
          onChange={(e) => setSelectedGiftId(e.target.value)}
          disabled={loading}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EA638C]/20 rounded-2xl text-[11px] font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-[#EA638C]/20 transition-all appearance-none cursor-pointer text-[#3E442B]"
        >
          <option value="">GIFT TYPE...</option>
          {availableGifts.map((gift) => {
            // 🟢 Extract the actual percentage for the dropdown label
            const percentage = getGiftPercentage(gift.code, gift.value);
            
            return (
              <option key={gift._id} value={gift._id}>
                {gift.title} ({percentage}%)
              </option>
            );
          })}
        </select>
      </div>

      <button
        onClick={handleSendGift}
        disabled={loading || !selectedGiftId}
        className={`p-2.5 rounded-xl transition-all shadow-lg ${
          selectedGiftId 
            ? 'bg-[#3E442B] text-white hover:bg-[#EA638C] shadow-[#3E442B]/10' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Send size={16} className={loading ? "animate-pulse" : ""} />
      </button>
    </div>
  );
}