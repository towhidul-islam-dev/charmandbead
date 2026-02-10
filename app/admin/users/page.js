import { getUsers } from "@/lib/data";
import RoleSelect from "@/components/admin/RoleSelect";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import SearchUsers from "@/components/admin/SearchUsers";
import ExportUsers from "@/components/admin/ExportUsers";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import UserGiftActions from "@/components/admin/UserGiftActions";
import EmailCopy from "@/components/admin/EmailCopy";
import Surprise from "@/models/Surprise";
import RewardHistory from "@/models/RewardHistory";
import dbConnect from "@/lib/mongodb";
import { ShieldCheck, Users, Zap, SearchX } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";

const SUPER_ADMIN_EMAILS = ["towhidulislam12@gmail.com", "dev@admin.com"];
const VIP_THRESHOLD = 10000;

export default async function AdminUsersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = resolvedSearchParams?.filter || "all";
  const query = resolvedSearchParams?.query?.toLowerCase() || "";
  
  await dbConnect();
  const { users: rawUsers, success, error } = await getUsers();
  
  const rawGifts = await Surprise.find({ isActive: true }).lean();
  const availableGifts = JSON.parse(JSON.stringify(rawGifts));

  const latestRewards = await RewardHistory.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$userId",
        lastGiftAt: { $first: "$createdAt" },
        lastGiftTitle: { $first: "$title" },
        lastGiftCode: { $first: "$code" },
      },
    },
  ]);

  if (!success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <div className="p-3 mb-3 rounded-full bg-red-50">
          <ShieldCheck className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-lg font-black tracking-tighter text-[#3E442B] uppercase">Access Error</h2>
        <p className="max-w-md mt-1 text-xs font-medium text-red-500">{error}</p>
      </div>
    );
  }

  const users = JSON.parse(JSON.stringify(rawUsers)).map(user => {
    const reward = latestRewards.find(r => r._id.toString() === user._id.toString());
    let extractedPercent = null;
    if (reward?.lastGiftCode) {
        const match = reward.lastGiftCode.match(/\d+/);
        extractedPercent = match ? `${match[0]}% OFF` : null;
    }

    return {
      ...user,
      lastGiftAt: reward ? reward.lastGiftAt : null,
      lastGiftTitle: reward ? reward.lastGiftTitle : null,
      lastGiftValue: extractedPercent 
    };
  });

  const filteredUsers = users.filter((user) => {
    const matchesTier = activeFilter === "all" || (activeFilter === "vip" && (user.isVIP || user.totalSpent >= VIP_THRESHOLD)) || (activeFilter === "regular" && !(user.isVIP || user.totalSpent >= VIP_THRESHOLD));
    const matchesSearch = (user.name?.toLowerCase() || "").includes(query) || (user.email?.toLowerCase() || "").includes(query) || (user.phone || "").includes(query);
    return matchesTier && matchesSearch;
  });

  return (
    <div className="p-2 mx-auto duration-500 md:p-6 max-w-7xl animate-in fade-in">
      {/* Header UI */}
      <div className="flex flex-col justify-between gap-4 mb-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2 bg-[#EA638C]/10 px-2 py-0.5 rounded-lg border border-[#EA638C]/20 w-fit">
              <span className="text-[9px] font-black text-[#EA638C] uppercase tracking-widest flex items-center gap-1">
                <Users size={10} /> User Registry
              </span>
            </div>
          </div>
          <h2 className="text-2xl italic font-black leading-none tracking-tighter text-[#3E442B] uppercase">
            Manage <span className="text-[#EA638C]">Members</span>
          </h2>
        </div>

        <div className="flex flex-col items-center w-full gap-3 md:flex-row lg:w-auto">
          <SearchUsers placeholder="Search..." />
          <div className="flex items-center gap-2">
            <ExportUsers data={filteredUsers} fileName={`members-${activeFilter}`} />
            <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl border border-gray-200 shadow-sm">
              <Link href="/admin/users?filter=all" className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-[#3E442B] text-white shadow-md' : 'text-gray-400 hover:text-[#3E442B]'}`}>All</Link>
              <Link href="/admin/users?filter=vip" className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${activeFilter === 'vip' ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-400 hover:text-yellow-600'}`}><Zap size={10} /> VIP</Link>
            </div>
          </div>
        </div>
      </div>

      {/* User Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-visible">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SearchX className="w-12 h-12 mb-3 text-gray-100" />
            <h3 className="text-md font-black text-[#3E442B] uppercase italic">No Matches</h3>
          </div>
        ) : (
          <div className="overflow-visible">
            <table className="min-w-full border-separate divide-y divide-gray-100 table-auto border-spacing-0">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-5 py-4 text-[8px] font-black uppercase text-gray-400 text-left tracking-widest">User Profile</th>
                  <th className="px-3 py-4 text-[8px] font-black uppercase text-gray-400 text-left tracking-widest w-[200px]">Surprise Reward</th>
                  <th className="px-4 py-4 text-[8px] font-black uppercase text-gray-400 text-left tracking-widest">Access</th>
                  <th className="px-4 py-4 text-[8px] font-black uppercase text-gray-400 text-left tracking-widest">Spendings</th>
                  <th className="px-5 py-4 text-right text-[8px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredUsers.map((user, index) => {
                  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
                  const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
                  const userPhoneDisplay = user.phone || user.addresses?.[0]?.phone || "";
                  const displayImg = user.image 
                    ? (user.image.startsWith('http') ? user.image : `https://res.cloudinary.com/diabqgzyo/image/upload/${user.image}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EA638C&color=fff&bold=true`;

                  return (
                    <tr 
                      key={user._id} 
                      className="transition-all duration-300 group hover:bg-[#FBB6E6]/5 relative"
                      // 🟢 THIS FIXES EVERYTHING: Staggered z-index
                      // Higher rows get higher z-index so dropdowns overlap lower rows
                      style={{ zIndex: filteredUsers.length - index, position: 'relative' }}
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`relative flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden border bg-white flex items-center justify-center ${isVIP ? 'border-yellow-400' : 'border-gray-100'}`}>
                            <Image src={displayImg} alt={user.name} width={36} height={36} className="object-cover w-full h-full" unoptimized />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] italic font-black text-[#3E442B] uppercase leading-tight truncate max-w-[100px]">{user.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {userPhoneDisplay && <span className="text-[8px] font-black text-[#EA638C] uppercase tracking-tighter">{userPhoneDisplay}</span>}
                                <EmailCopy email={user.email} />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 overflow-visible">
                        <div className="relative z-50 origin-left scale-90">
                          {!isSuperAdmin ? (
                            <UserGiftActions userId={user._id.toString()} userName={user.name} availableGifts={availableGifts} />
                          ) : (
                            <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit">
                              <ShieldCheck size={10} />
                              <span className="text-[8px] font-black uppercase tracking-tight">Protected</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative z-10 origin-left scale-75">
                          <RoleSelect userId={user._id.toString()} currentRole={user.role || "user"} />
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[9px] font-black text-[#3E442B] bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            ৳{user.totalSpent?.toLocaleString() || 0}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 scale-75 origin-right">
                          <UserDetailsModal user={user} orders={user.orders || []} totalSpent={user.totalSpent || 0} lastGiftAt={user.lastGiftAt} lastGiftTitle={user.lastGiftTitle} lastGiftValue={user.lastGiftValue} />
                          <DeleteUserButton userId={user._id.toString()} userName={user.name} isSuperAdmin={isSuperAdmin} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}