import { getUsers } from "@/lib/data";
import RoleSelect from "@/components/admin/RoleSelect";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import { ShieldCheck, Users, Filter, Zap } from "lucide-react";
import Link from "next/link";

const SUPER_ADMIN_EMAILS = ["towhidulislam12@gmail.com", "dev@admin.com"];

export default async function AdminUsersPage({ searchParams }) {
  // 🟢 1. FIX: Await searchParams for Next.js 15/16
  const resolvedSearchParams = await searchParams;
  const activeFilter = resolvedSearchParams?.filter || "all";

  const { users, success, error } = await getUsers();
  
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

  // 🟢 2. FILTER LOGIC
  const filteredUsers = users.filter((user) => {
    const isVIP = user.isVIP || (user.totalSpent >= 10000);
    if (activeFilter === "vip") return isVIP;
    if (activeFilter === "regular") return !isVIP;
    return true; 
  });

  return (
    <div className="p-4 mx-auto md:p-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#EA638C]/10 px-2 py-1 rounded-lg border border-[#EA638C]/20">
              <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> System Administration
              </span>
            </div>
          </div>
          <h2 className="text-4xl italic font-black leading-none tracking-tighter text-[#3E442B] uppercase">
            User <span className="text-[#EA638C]">Management</span>
          </h2>
        </div>

        {/* 🟢 THEMED FILTER CONTROLS */}
        <div className="flex items-center gap-2 bg-[#F3F4F6] p-1.5 rounded-2xl border border-gray-200">
          <Link 
            href="/admin/users?filter=all"
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-[#3E442B] text-white shadow-lg shadow-[#3E442B]/20' : 'text-gray-400 hover:text-gray-600'}`}
          >
            All Members
          </Link>
          <Link 
            href="/admin/users?filter=vip"
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'vip' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-400 hover:text-yellow-600'}`}
          >
            <Zap size={10} fill={activeFilter === 'vip' ? 'black' : 'none'} /> VIP Tier
          </Link>
          <Link 
            href="/admin/users?filter=regular"
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'regular' ? 'bg-white text-[#3E442B] border border-gray-200 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Regular
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Filter size={14} className="text-[#EA638C]" /> 
            Directory: <span className="text-[#3E442B]">{activeFilter}</span> ({filteredUsers.length} total)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Creator Profile</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Access Level</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Investment (৳)</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Joined</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
                const isVIP = user.isVIP || (user.totalSpent >= 10000);
                
                return (
                  <tr key={user._id} className="transition-colors group hover:bg-pink-50/30">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                           <div className={`flex items-center justify-center w-10 h-10 overflow-hidden border shadow-sm rounded-2xl ${isVIP ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-100'}`}>
                              {user.image ? <img src={user.image} alt="" className="object-cover w-full h-full" /> : <span className="text-sm font-black text-gray-300">{user.name.charAt(0)}</span>}
                           </div>
                           {isVIP && (
                             <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full border-2 border-white shadow-sm animate-pulse">
                               <Zap size={8} fill="currentColor" />
                             </div>
                           )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm italic font-black tracking-tight text-[#3E442B] uppercase">{user.name}</span>
                            {isVIP && <span className="bg-yellow-400 text-black text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase">PRO VIP</span>}
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 whitespace-nowrap">
                      {isSuperAdmin ? (
                        <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Super Admin</span>
                      ) : (
                        <RoleSelect userId={user._id.toString()} currentRole={user.role || "user"} />
                      )}
                    </td>

                    <td className="px-6 py-6 text-xs font-black whitespace-nowrap text-[#3E442B]">
                      ৳{(user.totalSpent || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-6 whitespace-nowrap text-[11px] font-black text-gray-400 uppercase">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="px-8 py-6 text-right">
                      <UserDetailsModal user={JSON.parse(JSON.stringify(user))} orders={user.orders} totalSpent={user.totalSpent || 0} />
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center text-[10px] font-black uppercase text-gray-300 tracking-[0.3em]">
                    No members found in this category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}