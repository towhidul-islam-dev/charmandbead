// components/admin/CategoryStatCard.jsx
export default function CategoryStatCard({ name, count, isParent }) {
  return (
    <div className={`p-5 rounded-[2rem] transition-all border ${
      isParent 
        ? "bg-[#3E442B] text-white border-transparent shadow-xl" 
        : "bg-white text-[#3E442B] border-gray-100 shadow-sm"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
            {isParent ? "Main Collection" : "Sub-Category"}
          </h4>
          <p className="text-lg font-black italic uppercase leading-none">{name}</p>
        </div>
        <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-2xl ${
          isParent ? "bg-[#EA638C] text-white" : "bg-pink-50 text-[#EA638C]"
        }`}>
          <span className="text-xl font-black leading-none">{count}</span>
          <span className="text-[7px] font-black uppercase">Items</span>
        </div>
      </div>
    </div>
  );
}