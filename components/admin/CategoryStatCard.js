// components/admin/CategoryStatCard.jsx
export default function CategoryStatCard({ name, count, isParent }) {
  return (
    <div className={`group p-4 rounded-[1.8rem] transition-all duration-300 border ${
      isParent 
        ? "bg-[#3E442B] text-white border-transparent shadow-lg hover:shadow-xl" 
        : "bg-white text-[#3E442B] border-gray-100 shadow-sm hover:border-[#FBB6E6]"
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"> {/* min-w-0 prevents text overflow in small containers */}
          <h4 className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1.5 ${
            isParent ? "text-[#FBB6E6]" : "text-[#EA638C]"
          }`}>
            {isParent ? "Collection" : "Sub-Level"}
          </h4>
          <p className="text-sm font-black italic uppercase truncate">
            {name}
          </p>
        </div>

        <div className={`shrink-0 flex flex-col items-center justify-center h-11 w-11 rounded-2xl transition-transform group-hover:scale-110 ${
          isParent 
            ? "bg-[#EA638C] text-white shadow-md shadow-black/20" 
            : "bg-pink-50 text-[#EA638C]"
        }`}>
          <span className="text-base font-black leading-none">{count}</span>
          <span className="text-[6px] font-black uppercase tracking-tighter">Qty</span>
        </div>
      </div>
    </div>
  );
}