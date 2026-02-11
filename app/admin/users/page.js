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
    <div className="p-4 mx-auto duration-500 md:p-6 max-w-7xl animate-in fade-in overflow-x-hidden">
      
      {/* --- HEADER UI --- */}
      <div className="flex flex-col justify-between gap-6 mb-8 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 bg-[#EA638C]/10 px-3 py-1 rounded-lg border border-[#EA638C]/20 w-fit">
              <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> User Registry
              </span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl italic font-black leading-none tracking-tighter text-[#3E442B] uppercase">
            Manage <span className="text-[#EA638C]">Members</span>
          </h2>
        </div>

        <div className="flex flex-col items-center w-full gap-4 md:flex-row lg:w-auto">
          <div className="w-full md:w-72">
            <SearchUsers placeholder="Search members..." />
          </div>
          <div className="flex items-center justify-between w-full gap-2 md:w-auto">
            <ExportUsers data={filteredUsers} fileName={`members-${activeFilter}`} />
            <div className="flex items-center gap-1 bg-[#F3F4F6] p-1.5 rounded-2xl border border-gray-200 shadow-sm">
              <Link href="/admin/users?filter=all" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-[#3E442B] text-white shadow-md' : 'text-gray-400'}`}>All</Link>
              <Link href="/admin/users?filter=vip" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${activeFilter === 'vip' ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-400'}`}><Zap size={12} /> VIP</Link>
            </div>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
          <SearchX className="w-16 h-16 mb-4 text-gray-100" />
          <h3 className="text-lg font-black text-[#3E442B] uppercase italic">No Matches Found</h3>
        </div>
      ) : (
        <>
          {/* --- 📱 MOBILE CARD LAYOUT (< 768px) --- */}
          <div className="grid grid-cols-1 gap-6 md:hidden pb-20">
            {filteredUsers.map((user, index) => {
              const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
              const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
              const displayImg = user.image 
                ? (user.image.startsWith('http') ? user.image : `https://res.cloudinary.com/diabqgzyo/image/upload/${user.image}`)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EA638C&color=fff&bold=true`;

              return (
                <div 
                  key={user._id} 
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-visible"
                  style={{ zIndex: filteredUsers.length - index }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 flex items-center justify-center bg-[#EA638C] ${isVIP ? 'border-yellow-400 shadow-md' : 'border-white shadow-sm'}`}>
                         <Image src={displayImg} alt={user.name} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-[#3E442B] uppercase italic truncate max-w-[130px] leading-tight">{user.name}</h4>
                        <EmailCopy email={user.email} />
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Spendings</p>
                       <span className="text-sm font-black text-[#3E442B]">৳{user.totalSpent?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Body Inset: Action Rows */}
                  <div className="space-y-5 p-5 bg-gray-50/80 rounded-[2.2rem] border border-gray-100/50 overflow-visible">
                    
                    {/* Surprise Reward Row */}
                    <div className="flex flex-col gap-2.5">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Surprise Reward</span>
                       <div className="w-full pr-4 overflow-visible"> {/* pr-4 ensures Send button isn't on the edge */}
                         {!isSuperAdmin ? (
                           <div className="relative scale-95 origin-left overflow-visible">
                             <UserGiftActions 
                                userId={user._id.toString()} 
                                userName={user.name} 
                                availableGifts={availableGifts} 
                             />
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 text-purple-600 bg-purple-100 px-4 py-2 rounded-xl w-fit">
                             <ShieldCheck size={12} />
                             <span className="text-[10px] font-black uppercase tracking-tight">Protected Admin</span>
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Access Level Row */}
                    <div className="flex items-center justify-between gap-4 border-t border-gray-200/60 pt-4">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Access Level</span>
                       <div className="scale-90 origin-right">
                          <RoleSelect userId={user._id.toString()} currentRole={user.role || "user"} />
                       </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-end gap-3 mt-6 pr-2">
                      <UserDetailsModal user={user} orders={user.orders || []} totalSpent={user.totalSpent || 0} lastGiftAt={user.lastGiftAt} lastGiftTitle={user.lastGiftTitle} lastGiftValue={user.lastGiftValue} />
                      <DeleteUserButton userId={user._id.toString()} userName={user.name} isSuperAdmin={isSuperAdmin} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- 💻 DESKTOP TABLE LAYOUT (>= 768px) --- */}
          <div className="hidden md:block bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-visible">
            <table className="min-w-full border-separate divide-y divide-gray-100 table-auto border-spacing-0 overflow-visible">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">User Profile</th>
                  <th className="px-4 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest w-[260px]">Surprise Reward</th>
                  <th className="px-4 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">Access Level</th>
                  <th className="px-4 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">Spendings</th>
                  <th className="px-6 py-5 text-right text-[9px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredUsers.map((user, index) => {
                  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
                  const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
                  const displayImg = user.image 
                    ? (user.image.startsWith('http') ? user.image : `https://res.cloudinary.com/diabqgzyo/image/upload/${user.image}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EA638C&color=fff&bold=true`;

                  return (
                    <tr 
                      key={user._id} 
                      className="transition-all duration-300 group hover:bg-[#EA638C]/5 relative overflow-visible"
                      style={{ zIndex: filteredUsers.length - index, position: 'relative' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border bg-white flex items-center justify-center ${isVIP ? 'border-yellow-400 shadow-sm' : 'border-gray-100'}`}>
                            <Image src={displayImg} alt={user.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] italic font-black text-[#3E442B] uppercase leading-tight truncate max-w-[150px]">{user.name}</p>
                            <EmailCopy email={user.email} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 overflow-visible">
                        <div className="relative z-[100] origin-left scale-95 pr-6">
                          {!isSuperAdmin ? (
                            <UserGiftActions userId={user._id.toString()} userName={user.name} availableGifts={availableGifts} />
                          ) : (
                            <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full w-fit">
                              <ShieldCheck size={12} />
                              <span className="text-[10px] font-black uppercase tracking-tight">Protected</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 overflow-visible">
                        <div className="relative z-10 origin-left scale-90">
                           <RoleSelect userId={user._id.toString()} currentRole={user.role || "user"} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-black text-[#3E442B] bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            ৳{user.totalSpent?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 scale-90 origin-right">
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
        </>
      )}
    </div>
  );
}