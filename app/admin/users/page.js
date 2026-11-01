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
import { ShieldCheck, Users, Zap, SearchX, ChevronLeft, ChevronRight, Calendar, UserCheck, ShoppingBag, Trophy, Crown, Sparkles, Medal } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";

const SUPER_ADMIN_EMAILS = ["towhidulislam12@gmail.com", "dev@admin.com"];
const VIP_THRESHOLD = 10000;

export default async function AdminUsersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = resolvedSearchParams?.filter || "all";
  const query = resolvedSearchParams?.query || "";
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const spenderDuration = resolvedSearchParams?.duration || "this_month";
  const itemsPerPage = 20;
  
  await dbConnect();
  
  const [userResult, rawGifts, latestRewards] = await Promise.all([
    getUsers(),
    Surprise.find({ isActive: true }).select("title code isActive").lean(),
    RewardHistory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastGiftAt: { $first: "$createdAt" },
          lastGiftTitle: { $first: "$title" },
          lastGiftCode: { $first: "$code" },
        },
      },
    ]).catch(() => [])
  ]);

  const { users: rawUsers, success, error } = userResult;
  const availableGifts = JSON.parse(JSON.stringify(rawGifts || []));

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

  const getProfileImage = (user) => {
    if (user.image) {
      if (user.image.startsWith('http')) return user.image;
      return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'diabqgzyo'}/image/upload/${user.image}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EA638C&color=fff&bold=true`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const now = new Date();
  const rewardMap = new Map((latestRewards || []).map(r => [r._id?.toString(), r]));

  const users = JSON.parse(JSON.stringify(rawUsers || [])).map(user => {
    const reward = rewardMap.get(user._id?.toString());
    let extractedPercent = null;
    if (reward?.lastGiftCode) {
        const match = reward.lastGiftCode.match(/\d+/);
        extractedPercent = match ? `${match[0]}% OFF` : null;
    }

    const orderList = user.orders || [];
    let periodSpent = 0;
    
    orderList.forEach(order => {
      const orderDate = new Date(order.createdAt || order.date || Date.now());
      let includeOrder = false;

      if (spenderDuration === "this_month") {
        if (orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth()) {
          includeOrder = true;
        }
      } else if (spenderDuration === "last_month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (orderDate.getFullYear() === lastMonth.getFullYear() && orderDate.getMonth() === lastMonth.getMonth()) {
          includeOrder = true;
        }
      } else if (spenderDuration === "last_7d") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate >= sevenDaysAgo) {
          includeOrder = true;
        }
      } else {
        includeOrder = true;
      }

      if (includeOrder) {
        periodSpent += (order.totalAmount || order.total || order.totalPrice || 0);
      }
    });

    const finalPeriodSpent = (spenderDuration === "all_time" || periodSpent === 0) ? (user.totalSpent || periodSpent) : periodSpent;

    return {
      ...user,
      totalOrders: orderList.length || user.orderCount || 0,
      periodSpent: finalPeriodSpent,
      lastGiftAt: reward ? reward.lastGiftAt : null,
      lastGiftTitle: reward ? reward.lastGiftTitle : null,
      lastGiftValue: extractedPercent 
    };
  });

  const topSpenders = [...users]
    .filter(u => u.periodSpent > 0)
    .sort((a, b) => b.periodSpent - a.periodSpent)
    .slice(0, 5);

  const totalMemberCount = users.length;
  const totalVipCount = users.filter(u => u.isVIP || u.totalSpent >= VIP_THRESHOLD).length;

  const filteredUsers = users.filter((user) => {
    const matchesTier =
      activeFilter === "all" ||
      (activeFilter === "vip" && (user.isVIP || user.totalSpent >= VIP_THRESHOLD)) ||
      (activeFilter === "regular" && !(user.isVIP || user.totalSpent >= VIP_THRESHOLD));

    if (!matchesTier) return false;

    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return true;

    const matchesName = (user.name?.toLowerCase() || "").includes(cleanQuery);
    const matchesEmail = (user.email?.toLowerCase() || "").includes(cleanQuery);

    const primaryPhone = user.phone || user.phoneNumber || user.mobile || "";
    const addressPhones = Array.isArray(user.addresses)
      ? user.addresses.map((a) => a.phone).filter(Boolean)
      : [user.shippingAddress?.phone].filter(Boolean);

    const allPhones = [primaryPhone, ...addressPhones].map((p) => String(p).trim().toLowerCase());
    const queryDigits = cleanQuery.replace(/\D/g, "");
    const normalizedQueryDigits = queryDigits.startsWith("880") ? queryDigits.slice(2) : queryDigits;

    const matchesPhone = allPhones.some((rawPhone) => {
      if (rawPhone.includes(cleanQuery)) return true;
      const phoneDigits = rawPhone.replace(/\D/g, "");
      const normalizedPhoneDigits = phoneDigits.startsWith("880") ? phoneDigits.slice(2) : phoneDigits;
      if (queryDigits.length > 0 && phoneDigits.includes(queryDigits)) return true;
      if (normalizedQueryDigits.length > 0 && normalizedPhoneDigits.includes(normalizedQueryDigits)) return true;
      return false;
    });

    return matchesName || matchesEmail || matchesPhone;
  });

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / itemsPerPage) || 1;
  const safeCurrentPage = currentPage > totalPages ? 1 : currentPage;

  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    const range = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safeCurrentPage - range && i <= safeCurrentPage + range)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="p-4 mx-auto duration-500 md:p-6 max-w-7xl animate-in fade-in overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* TOP SPENDERS LEADERBOARD WITH UNIQUE METALLIC THEMES & TROPHIES */}
      <div className="mb-10 bg-[#3E442B] p-6 md:p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-12 -bottom-12 text-white/5 opacity-10 pointer-events-none rotate-12">
          <Trophy size={260} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EA638C] text-white rounded-2xl shadow-lg shadow-[#EA638C]/40">
              <Trophy size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tight text-white">Top Spenders Leaderboard</h3>
                <Sparkles size={16} className="text-[#FBB6E6]" />
              </div>
              <p className="text-[9.5px] font-bold text-gray-200 uppercase tracking-widest">Highest contributing store members</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/15">
            {[
              { id: "this_month", label: "This Month" },
              { id: "last_month", label: "Last Month" },
              { id: "last_7d", label: "Last 7 Days" },
              { id: "all_time", label: "All-Time" }
            ].map((tab) => (
              <Link
                key={tab.id}
                href={`?duration=${tab.id}&filter=${activeFilter}&query=${query}&page=1`}
                className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                  spenderDuration === tab.id 
                    ? 'bg-[#EA638C] text-white shadow-md' 
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {topSpenders.length === 0 ? (
          <div className="py-10 text-center text-gray-300 uppercase text-xs font-black tracking-widest bg-black/20 rounded-2xl border border-white/5">
            No spending records found for this timeframe.
          </div>
        ) : (
          <div className="relative w-full overflow-hidden rounded-2xl">
            <div className="animate-marquee flex gap-4 py-2">
              {[...topSpenders, ...topSpenders].map((spender, idx) => {
                const rank = (idx % topSpenders.length) + 1;
                
                // 🎨 Unique Color Themes and Rank Trophies/Badges
                let cardTheme = "";
                let badgeTheme = "";
                let TrophyIcon = Trophy;
                let textColor = "text-[#3E442B]";
                let subText = "text-gray-700";
                let priceColor = "text-[#3E442B]";
                let orderBadge = "bg-[#3E442B]/10 text-[#3E442B] border-[#3E442B]/20";

                if (rank === 1) {
                  // 🏆 #1 Gold Theme
                  TrophyIcon = Crown;
                  cardTheme = "bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-300 border-yellow-400";
                  badgeTheme = "bg-yellow-500 text-white border-yellow-300 shadow-yellow-500/50";
                  textColor = "text-[#3E442B]";
                  subText = "text-amber-950 font-extrabold";
                  priceColor = "text-[#3E442B]";
                  orderBadge = "bg-amber-950/15 text-[#3E442B] border-amber-950/30 font-black";
                } else if (rank === 2) {
                  // 🥈 #2 Sterling Silver Theme
                  TrophyIcon = Medal;
                  cardTheme = "bg-gradient-to-br from-slate-100 via-slate-200 to-zinc-300 border-slate-300";
                  badgeTheme = "bg-slate-600 text-white border-slate-400 shadow-slate-500/50";
                  textColor = "text-slate-900";
                  subText = "text-slate-800 font-extrabold";
                  priceColor = "text-slate-950";
                  orderBadge = "bg-slate-950/15 text-slate-900 border-slate-950/30 font-black";
                } else if (rank === 3) {
                  // 🥉 #3 Bronze / Copper Theme
                  TrophyIcon = Medal;
                  cardTheme = "bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border-amber-600";
                  badgeTheme = "bg-amber-600 text-white border-amber-400 shadow-amber-900/50";
                  textColor = "text-white";
                  subText = "text-amber-200 font-bold";
                  priceColor = "text-yellow-300";
                  orderBadge = "bg-white/20 text-white border-white/30 font-black";
                } else if (rank === 4) {
                  // 🌸 #4 Rose Gold Theme
                  TrophyIcon = Sparkles;
                  cardTheme = "bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 border-rose-300";
                  badgeTheme = "bg-[#EA638C] text-white border-pink-400 shadow-pink-500/50";
                  textColor = "text-[#3E442B]";
                  subText = "text-rose-950 font-extrabold";
                  priceColor = "text-[#EA638C]";
                  orderBadge = "bg-[#3E442B]/15 text-[#3E442B] border-[#3E442B]/30 font-black";
                } else {
                  // 💎 #5 Platinum / Pearl Theme
                  TrophyIcon = Zap;
                  cardTheme = "bg-gradient-to-br from-indigo-100 via-purple-200 to-blue-200 border-indigo-300";
                  badgeTheme = "bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/50";
                  textColor = "text-indigo-950";
                  subText = "text-indigo-900 font-extrabold";
                  priceColor = "text-indigo-950";
                  orderBadge = "bg-indigo-950/15 text-indigo-950 border-indigo-950/30 font-black";
                }

                return (
                  <div 
                    key={`${spender._id}-${idx}`}
                    className={`w-80 backdrop-blur-md border p-4 rounded-3xl flex items-center gap-4 shrink-0 shadow-2xl transition-all duration-300 hover:scale-[1.02] relative ${cardTheme}`}
                  >
                    {/* TROPHY & AVATAR WRAPPER */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/80 bg-white/50 relative shadow-md">
                        <Image src={getProfileImage(spender)} alt={spender.name} fill className="object-cover" unoptimized />
                      </div>

                      {/* RANK BADGE WITH TROPHY ICON */}
                      <div className={`absolute -top-2.5 -left-2.5 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[9px] font-black shadow-lg border ${badgeTheme}`}>
                        <TrophyIcon size={11} />
                        <span>#{rank}</span>
                      </div>
                    </div>
                    
                    {/* SPENDER DETAILS WITH HIGH READABILITY */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-black uppercase tracking-tight truncate drop-shadow-2xs ${textColor}`}>
                        {spender.name}
                      </p>
                      <p className={`text-[9.5px] truncate mt-0.5 ${subText}`}>
                        {spender.email}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/15">
                        <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md border ${orderBadge}`}>
                          {spender.totalOrders} Orders
                        </span>
                        <span className={`text-sm font-black drop-shadow-2xs ${priceColor}`}>
                          ৳{spender.periodSpent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* HEADER CONTROLS */}
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
              <Link href={`/admin/users?filter=all&duration=${spenderDuration}`} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-[#3E442B] text-white shadow-md' : 'text-gray-400'}`}>All</Link>
              <Link href={`/admin/users?filter=vip&duration=${spenderDuration}`} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${activeFilter === 'vip' ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-400'}`}><Zap size={12} /> VIP</Link>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3E442B]/10 text-[#3E442B] flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Members</p>
            <h3 className="text-xl font-black text-[#3E442B]">{totalMemberCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 text-yellow-600 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">VIP Members</p>
            <h3 className="text-xl font-black text-[#3E442B]">{totalVipCount}</h3>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EA638C]/10 text-[#EA638C] flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filtered Result</p>
            <h3 className="text-xl font-black text-[#3E442B]">{totalUsers}</h3>
          </div>
        </div>
      </div>

      {totalUsers === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
          <SearchX className="w-16 h-16 mb-4 text-gray-100" />
          <h3 className="text-lg font-black text-[#3E442B] uppercase italic">No Matches Found</h3>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-6 md:hidden pb-10">
            {paginatedUsers.map((user, index) => {
              const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
              const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
              const displayImg = getProfileImage(user);
              return (
                <div key={user._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-visible" style={{ zIndex: paginatedUsers.length - index }}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3 relative group/mobile-profile">
                      <div className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 flex items-center justify-center bg-[#EA638C] ${isVIP ? 'border-yellow-400 shadow-md' : 'border-white shadow-sm'}`}>
                         <Image src={displayImg} alt={user.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-[#3E442B] uppercase italic truncate max-w-[130px] leading-tight">{user.name}</h4>
                        <EmailCopy email={user.email} />
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-[#EA638C] bg-[#EA638C]/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1 w-fit border border-[#EA638C]/20">
                        <ShoppingBag size={10} /> {user.totalOrders} {user.totalOrders === 1 ? 'Order' : 'Orders'}
                      </span>
                      <span className="text-sm font-black text-[#3E442B]">
                        ৳{user.totalSpent?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-5 p-5 bg-gray-50/80 rounded-[2.2rem] border border-gray-100/50 overflow-visible">
                    <div className="flex flex-col gap-2.5">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Surprise Reward</span>
                        <div className="w-full pr-4 overflow-visible">
                          {!isSuperAdmin ? (
                            <div className="relative scale-95 origin-left overflow-visible">
                              <UserGiftActions userId={user._id.toString()} userName={user.name} availableGifts={availableGifts} />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-purple-600 bg-purple-100 px-4 py-2 rounded-xl w-fit">
                              <ShieldCheck size={12} />
                              <span className="text-[10px] font-black uppercase tracking-tight">Protected Admin</span>
                            </div>
                          )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-gray-200/60 pt-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Access Level</span>
                        <div className="scale-90 origin-right">
                          <RoleSelect userId={user._id.toString()} currentRole={user.role || "user"} />
                        </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-6 pr-2">
                      <UserDetailsModal user={user} orders={user.orders || []} totalSpent={user.totalSpent || 0} lastGiftAt={user.lastGiftAt} lastGiftTitle={user.lastGiftTitle} lastGiftValue={user.lastGiftValue} />
                      <DeleteUserButton userId={user._id.toString()} userName={user.name} isSuperAdmin={isSuperAdmin} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-visible">
            <table className="min-w-full border-separate divide-y divide-gray-100 table-auto border-spacing-0 overflow-visible">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">User Profile</th>
                  <th className="px-4 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest w-[260px]">Surprise Reward</th>
                  <th className="px-4 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">Access Level</th>
                  <th className="px-4 py-5 text-[9px] font-black uppercase text-gray-400 text-left tracking-widest">Orders & Spent</th>
                  <th className="px-6 py-5 text-right text-[9px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {paginatedUsers.map((user, index) => {
                  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);
                  const isVIP = user.isVIP || (user.totalSpent >= VIP_THRESHOLD);
                  const displayImg = getProfileImage(user);
                  return (
                    <tr key={user._id} className="transition-all duration-300 group hover:bg-[#EA638C]/5 relative overflow-visible" style={{ zIndex: paginatedUsers.length - index, position: 'relative' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 relative group/profile">
                          <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border bg-white flex items-center justify-center ${isVIP ? 'border-yellow-400 shadow-sm' : 'border-gray-100'}`}>
                            <Image src={displayImg} alt={user.name} fill className="object-cover" unoptimized />
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
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-[9px] font-black text-[#EA638C] bg-[#EA638C]/10 px-2.5 py-0.5 rounded-lg flex items-center gap-1 border border-[#EA638C]/20">
                            <ShoppingBag size={10} /> {user.totalOrders} {user.totalOrders === 1 ? 'Order' : 'Orders'}
                          </span>
                          <span className="text-[11px] font-black text-[#3E442B] bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                            ৳{user.totalSpent?.toLocaleString() || 0}
                          </span>
                        </div>
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

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-6 mt-16 pb-10">
              <div className="flex items-center gap-2 p-1.5 bg-white shadow-xl rounded-full border border-gray-50">
                <Link
                  href={`?page=${Math.max(1, safeCurrentPage - 1)}&filter=${activeFilter}&query=${query}&duration=${spenderDuration}`}
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${safeCurrentPage === 1 ? 'opacity-20 pointer-events-none' : 'bg-gray-50 text-[#3E442B] hover:text-[#EA638C]'}`}
                >
                  <ChevronLeft size={18} />
                </Link>

                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((p, i) => (
                    p === "..." ? (
                      <span key={`dots-${i}`} className="px-2 text-gray-300 font-bold text-xs">...</span>
                    ) : (
                      <Link
                        key={p}
                        href={`?page=${p}&filter=${activeFilter}&query=${query}&duration=${spenderDuration}`}
                        className={`w-11 h-11 flex flex-col items-center justify-center rounded-full text-[10px] font-black transition-all ${
                          safeCurrentPage === p ? 'bg-[#3E442B] text-white shadow-lg' : 'text-gray-400 hover:text-[#EA638C]'
                        }`}
                      >
                        {safeCurrentPage === p && <span className="text-[5px] uppercase tracking-tighter opacity-60 leading-none">Pg</span>}
                        {p}
                      </Link>
                    )
                  ))}
                </div>

                <Link
                  href={`?page=${Math.min(totalPages, safeCurrentPage + 1)}&filter=${activeFilter}&query=${query}&duration=${spenderDuration}`}
                  className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${safeCurrentPage === totalPages ? 'opacity-20 pointer-events-none' : 'bg-[#3E442B] text-white hover:bg-[#EA638C] shadow-lg'}`}
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
              <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">
                Member Registry <span className="mx-2 opacity-30">•</span> {totalUsers} Records
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}