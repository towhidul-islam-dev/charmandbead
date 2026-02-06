export const dynamic = "force-dynamic";

import { getMyRewards } from "@/actions/surprise";
import MyRewards from "@/components/profile/MyRewards";

export default async function CustomerRewardsPage() {
  // Fetches rewards for the logged-in user only
  const myWins = await getMyRewards();

  return (
    <div className="p-4 md:p-0">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-50">
        <MyRewards wins={myWins} />
        
        {myWins.length > 0 && (
          <div className="mt-10 p-6 bg-[#3E442B] rounded-2xl md:rounded-[2rem] text-center border border-[#EA638C]/20">
            <p className="text-[10px] font-black text-[#FBB6E6] uppercase tracking-[0.2em]">
              Ready to use a code?
            </p>
            <p className="mt-1 text-xs font-bold text-white">
              Apply your reward at checkout to save on your registry!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}