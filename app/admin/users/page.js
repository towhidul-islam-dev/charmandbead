import { getUsers } from "@/lib/data";
import RoleSelect from "@/components/admin/RoleSelect";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import SearchUsers from "@/components/admin/SearchUsers";
import ExportUsers from "@/components/admin/ExportUsers";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import UserGiftActions from "@/components/admin/UserGiftActions";
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
  
  // 🟢 Clean search query: "017-123" becomes "017123"
  const cleanQuery = query.replace(/\D/g, "");

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="p-4 mb-4 rounded-full bg-red-50">
          <ShieldCheck className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-black tracking-tighter text-[#3E442B] uppercase">Access Error</h2>
        <p className="max-w-md mt-2 font-medium text-red-500">{error}</p>
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
    const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
    const matchesTier = activeFilter === "all" || (activeFilter === "vip" && isVIP) || (activeFilter === "regular" && !isVIP);
    
    // 🟢 ENHANCED SEARCH LOGIC
    const userName = user.name?.toLowerCase() || "";
    const userEmail = user.email?.toLowerCase() || "";
    
    // Check top-level phone AND address-level phone
    const primaryPhone = user.phone || "";
    const addressPhone = user.addresses?.[0]?.phone || "";
    
    // Create clean versions (digits only) for fuzzy matching
    const cleanPrimary = primaryPhone.replace(/\D/g, "");
    const cleanAddress = addressPhone.replace(/\D/g, "");

    const matchesSearch = 
      userName.includes(query) || 
      userEmail.includes(query) || 
      primaryPhone.includes(query) || 
      addressPhone.includes(query) ||
      (cleanQuery !== "" && (cleanPrimary.includes(cleanQuery) || cleanAddress.includes(cleanQuery)));
    
    return matchesTier && matchesSearch;
  });

  return (
    <div className="p-4 mx-auto duration-500 md:p-8 max-w-7xl animate-in fade-in">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 mb-10 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#EA638C]/10 px-2 py-1 rounded-lg border border-[#EA638C]/20 w-fit">
              <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> User Registry
              </span>
            </div>
          </div>
          <h2 className="text-4xl italic font-black leading-none tracking-tighter text-[#3E442B] uppercase">
            Manage <span className="text-[#EA638C]">Members</span>
          </h2>
        </div>

        <div className="flex flex-col items-center w-full gap-4 md:flex-row lg:w-auto">
          <SearchUsers placeholder="Search name, email or phone..." />
          <div className="flex items-center gap-3">
            <ExportUsers data={filteredUsers} fileName={`members-${activeFilter}`} />
            <div className="flex items-center gap-2 bg-[#F3F4F6] p-1.5 rounded-2xl border border-gray-200 shadow-sm">
              <Link href="/admin/users?filter=all" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-[#3E442B] text-white shadow-md' : 'text-gray-400 hover:text-[#3E442B]'}`}>All</Link>
              <Link href="/admin/users?filter=vip" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'vip' ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-400 hover:text-yellow-600'}`}><Zap size={10} /> VIP</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <SearchX className="w-16 h-16 mb-4 text-gray-100" />
            <h3 className="text-lg font-black text-[#3E442B] uppercase italic">No Matches Found</h3>
            <Link href="/admin/users" className="mt-2 text-[10px] font-black uppercase text-[#EA638C] border-b-2 border-[#EA638C]">Reset Filters</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-7 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">User Profile</th>
                  <th className="px-6 py-7 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">Surprise Reward</th>
                  <th className="px-6 py-7 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">Access</th>
                  <th className="px-6 py-7 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">Spendings</th>
                  <th className="px-8 py-7 text-right text-[9px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
                  const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
                  const userPhoneDisplay = user.phone || user.addresses?.[0]?.phone || "";
                  
                  const displayImg = user.image 
                    ? (user.image.startsWith('http') 
                        ? user.image 
                        : `https://res.cloudinary.com/diabqgzyo/image/upload/${user.image}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EA638C&color=fff&bold=true`;

                  return (
                    <tr key={user._id} className="transition-all duration-300 group hover:bg-[#FBB6E6]/5">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center ${isVIP ? 'border-yellow-400 shadow-lg shadow-yellow-100' : 'border-gray-100'}`}>
                            <Image 
                              src={displayImg} 
                              alt={user.name || "User"} 
                              width={48} 
                              height={48} 
                              className="object-cover w-full h-full" 
                              unoptimized 
                            />
                          </div>
                          <div>
                            <p className="text-sm italic font-black text-[#3E442B] uppercase leading-tight">{user.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                {userPhoneDisplay && <span className="text-[#EA638C] mr-2">{userPhoneDisplay}</span>}
                                {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* ... rest of your table cells (Actions, Access, etc) ... */}
                      <td className="px-6 py-5">
                        {!isSuperAdmin ? (
                          <UserGiftActions 
                            userId={user._id.toString()} 
                            userName={user.name} 
                            availableGifts={availableGifts} 
                          />
                        ) : (
                            <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-3 py-1 rounded-full w-fit">
                              <ShieldCheck size={12} />
                              <span className="text-[9px] font-black uppercase">Protected Account</span>
                            </div>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <RoleSelect userId={user._id.toString()} currentRole={user.role || "user"} />
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-xs font-black text-[#3E442B] bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            ৳{user.totalSpent?.toLocaleString() || 0}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <UserDetailsModal 
                            user={user} 
                            orders={user.orders || []} 
                            totalSpent={user.totalSpent || 0}
                            lastGiftAt={user.lastGiftAt}
                            lastGiftTitle={user.lastGiftTitle}
                            lastGiftValue={user.lastGiftValue}
                          />
                          <DeleteUserButton 
                            userId={user._id.toString()} 
                            userName={user.name} 
                            isSuperAdmin={isSuperAdmin}
                          />
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