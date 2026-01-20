import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ProfileForm from "@/components/ProfileForm";
import Image from "next/image";
import VIPBadge from "@/components/ui/VIPBadge"; // 🟢 Import the new badge
import { CalendarDays } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  await dbConnect();

  const rawUser = await User.findOne({ email: session?.user?.email }).lean();
  if (!rawUser)
    return (
      <div className="p-20 text-center font-black uppercase text-[#3E442B]">
        Please log in to view this page.
      </div>
    );

  // 🟢 Serialize MongoDB data to avoid "Plain Object" errors in ProfileForm
  const user = JSON.parse(JSON.stringify(rawUser));

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  // 🟢 Smart Image Handler (Google/GitHub vs Cloudinary)
  const profileImageUrl = user.image?.startsWith("http")
    ? user.image
    : user.image
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${user.image}`
      : null;

  const isVIP = user.role === "admin" || user.totalSpent >= 10000;

  return (
    <div className="max-w-3xl p-6 mx-auto md:p-12">
      {/* --- TOP HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 pb-10 mb-10 border-b border-gray-100">
        {/* 🟢 ENHANCED PROFILE PICTURE */}
        <div className="relative group">
          <div
            className={`relative h-32 w-32 rounded-[2.5rem] overflow-hidden bg-white border-4 shadow-2xl transition-transform duration-500 group-hover:scale-105 ${isVIP ? "border-yellow-400" : "border-white"}`}
          >
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={user.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
                <span className="text-3xl font-black text-[#EA638C]">
                  {initials}
                </span>
              </div>
            )}
          </div>
          {/* Floating Status Indicator */}
          <div
            className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"
            title="Account Active"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-[#3E442B] uppercase italic tracking-tighter">
              {user.name}
            </h1>
            {isVIP ? (
              <VIPBadge type="vip" size="md" />
            ) : (
              <VIPBadge type="member" size="md" />
            )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              {user.email}
            </p>
            <span className="hidden md:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5 text-xs font-black text-[#EA638C] uppercase tracking-tighter">
              <CalendarDays size={14} />
              Member Since {new Date(user.createdAt).getFullYear()}
            </div>
          </div>
        </div>
      </div>

      {/* --- ACCOUNT STATS CARDS --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
            Total Investment
          </p>
          <p className="text-lg font-black text-[#3E442B]">
            ৳{(user.totalSpent || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
            Access Level
          </p>
          <p className="text-lg font-black text-[#EA638C] uppercase italic">
            {user.role || "User"}
          </p>
        </div>
        <div className="hidden md:block bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
            Account Status
          </p>
          <p className="text-lg font-black text-emerald-600 uppercase italic">
            Verified
          </p>
        </div>
      </div>

      {/* --- PROFILE FORM --- */}
      <div className="bg-white rounded-[3rem] p-1 md:p-4">
        <div className="mb-6 px-4">
          <h2 className="text-lg font-black text-[#3E442B] uppercase tracking-tight">
            Update Details
          </h2>
          <p className="text-xs text-gray-400">
            Manage your shipping and contact information
          </p>
        </div>
        <ProfileForm user={user} initials={initials} />
      </div>
    </div>
  );
}
