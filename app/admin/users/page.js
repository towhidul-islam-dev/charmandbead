import { getUsers } from "@/lib/data";
import RoleSelect from "@/components/admin/RoleSelect";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import SearchUsers from "@/components/admin/SearchUsers";
import ExportUsers from "@/components/admin/ExportUsers";
import DeleteUserButton from "@/components/admin/DeleteUserButton"; // 🟢 Added this
import { ShieldCheck, Users, Zap, Phone, SearchX, CircleDot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const SUPER_ADMIN_EMAILS = ["towhidulislam12@gmail.com", "dev@admin.com"];
const VIP_THRESHOLD = 10000; 

export default async function AdminUsersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = resolvedSearchParams?.filter || "all";
  const query = resolvedSearchParams?.query?.toLowerCase() || "";

  const { users: rawUsers, success, error } = await getUsers();
  
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

  const users = JSON.parse(JSON.stringify(rawUsers));

  const filteredUsers = users.filter((user) => {
    const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
    const matchesTier = activeFilter === "all" || (activeFilter === "vip" && isVIP) || (activeFilter === "regular" && !isVIP);
    const matchesSearch = 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query) || 
      user.phone?.includes(query);
    
    return matchesTier && matchesSearch;
  });

  return (
    <div className="p-4 mx-auto md:p-8 max-w-7xl animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 mb-10 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-[#EA638C]/10 px-2 py-1 rounded-lg border border-[#EA638C]/20 w-fit">
              <span className="text-[10px] font-black text-[#EA638C] uppercase tracking-widest flex items-center gap-1">
                <Users size={12} /> System Administration
              </span>
            </div>
          </div>
          <h2 className="text-4xl italic font-black leading-none tracking-tighter text-[#3E442B] uppercase">
            User <span className="text-[#EA638C]">Management</span>
          </h2>
        </div>

        <div className="flex flex-col items-center w-full gap-4 md:flex-row lg:w-auto">
          <SearchUsers placeholder="Search name, email or phone..." />
          <div className="flex items-center gap-3">
            <ExportUsers data={filteredUsers} fileName={`members-${activeFilter}`} />
            <div className="flex items-center gap-2 bg-[#F3F4F6] p-1.5 rounded-2xl border border-gray-200">
              <Link href="/admin/users?filter=all" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-[#3E442B] text-white' : 'text-gray-400 hover:text-[#3E442B]'}`}>All</Link>
              <Link href="/admin/users?filter=vip" className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'vip' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-yellow-600'}`}><Zap size={10} /> VIP</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 mb-4 rounded-full bg-gray-50">
              <SearchX className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-[#3E442B] uppercase italic">No Users Found</h3>
            <p className="max-w-xs mt-1 text-sm text-gray-400">We couldn't find anyone matching "{query}".</p>
            <Link href="/admin/users" className="mt-4 text-[10px] font-black uppercase text-[#EA638C] border-b border-[#EA638C]">View all users</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Creator Profile</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Status</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Access Level</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase text-gray-400 text-left tracking-widest">Investment (৳)</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
                  const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
                  
                  const imageUrl = user.image?.startsWith('http') 
                    ? user.image 
                    : user.image 
                    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${user.image}`
                    : null;

                  return (
                    <tr key={user._id} className="transition-colors group hover:bg-pink-50/30">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            <div className={`flex items-center justify-center w-12 h-12 overflow-hidden border shadow-sm rounded-2xl bg-white ${isVIP ? 'border-yellow-400' : 'border-gray-200'}`}>
                              {imageUrl ? (
                                <Image 
                                  src={imageUrl} 
                                  alt={user.name || "User"} 
                                  width={48} 
                                  height={48} 
                                  className="object-cover w-full h-full"
                                  unoptimized 
                                />
                              ) : (
                                <span className={`text-sm font-black uppercase ${isVIP ? 'text-yellow-600' : 'text-gray-300'}`}>
                                  {user.name?.charAt(0) || "U"}
                                </span>
                              )}
                            </div>
                            {isVIP && (
                              <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black p-0.5 rounded-full border-2 border-white shadow-sm z-10">
                                <Zap size={8} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm italic font-black tracking-tight text-[#3E442B] uppercase">{user.name}</span>
                            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                              {user.email} {user.phone && <><span className="mx-1">•</span> <Phone size={10} /> {user.phone}</>}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full w-fit border border-emerald-100">
                          <CircleDot size={10} className="animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Active</span>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        {isSuperAdmin ? (
                          <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">Super Admin</span>
                        ) : (
                          <RoleSelect userId={user._id.toString()} currentRole={user.role || "user"} />
                        )}
                      </td>

                      <td className="px-6 py-6">
                        <span className="text-xs font-black text-[#3E442B]">৳{(user.totalSpent || 0).toLocaleString()}</span>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <UserDetailsModal user={user} />
                          
                          {/* 🟢 Delete Button with Super Admin protection */}
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