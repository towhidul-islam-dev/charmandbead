import { Loader2 } from "lucide-react";

export default function RewardsLoading() {
  return (
    <div className="p-4 md:p-0 animate-pulse">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-50">
        
        {/* Header Skeleton */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
             <Loader2 className="text-[#EA638C] animate-spin" size={24} />
          </div>
          <div className="h-4 w-48 bg-gray-100 rounded-full mb-2" />
          <div className="h-3 w-32 bg-gray-50 rounded-full" />
        </div>

        {/* Reward Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem]" />
          ))}
        </div>

        {/* Bottom Notice Skeleton */}
        <div className="mt-10 p-10 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-2">
          <div className="h-2 w-24 bg-[#FBB6E6]/30 rounded-full" />
          <div className="h-3 w-64 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}