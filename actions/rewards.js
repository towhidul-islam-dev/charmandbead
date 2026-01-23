"use server";

import dbConnect from "@/lib/mongodb";
import RewardHistory from "@/models/RewardHistory";
import { getServerSession } from "next-auth"; // Adjust based on your auth (e.g., Kinde, Clerk, or NextAuth)
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function getMyRewards() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // 🔥 SECURITY: Only find rewards where userId matches the logged-in user
    const rewards = await RewardHistory.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(rewards));
  } catch (err) {
    console.error("Reward fetch error:", err);
    return [];
  }
}