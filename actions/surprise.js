"use server";

import dbConnect from "@/lib/mongodb";
import Surprise from "@/models/Surprise";
import RewardHistory from "@/models/RewardHistory"; 
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// CREATE OR UPDATE GIFT
export async function saveGift(data) {
  try {
    await dbConnect();
    if (data._id) {
      await Surprise.findByIdAndUpdate(data._id, data);
    } else {
      await Surprise.create(data);
    }
    revalidatePath("/admin/gifts");
    return { success: true, message: "Gift registry updated!" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// TOGGLE ACTIVE STATUS
export async function toggleGiftStatus(id) {
  try {
    await dbConnect();
    const gift = await Surprise.findById(id);
    gift.isActive = !gift.isActive;
    await gift.save();
    revalidatePath("/admin/gifts");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// DELETE GIFT
export async function deleteGift(id) {
  try {
    await dbConnect();
    await Surprise.findByIdAndDelete(id);
    revalidatePath("/admin/gifts");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// --- UPDATED: MANUAL OVERRIDE ACTION ---
export async function generateManualGift(giftId, userId) {
  try {
    await dbConnect();
    const gift = await Surprise.findById(giftId);
    if (!gift) throw new Error("Gift not found in registry");

    // 💡 NEW: If a userId is provided, save it to their history immediately
    if (userId) {
      await RewardHistory.create({
        userId: userId,
        giftId: gift._id,
        title: gift.title,
        code: gift.code,
        value: gift.value,
        discountType: gift.discountType
      });
    }

    await Surprise.findByIdAndUpdate(giftId, { $inc: { usageCount: 1 } });
    
    revalidatePath("/admin/gifts");
    revalidatePath("/dashboard/rewards"); 

    return { 
      success: true, 
      gift: JSON.parse(JSON.stringify(gift)),
      generatedAt: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// --- UPDATED: THE "WINNING" LOGIC FOR CUSTOMERS ---
export async function rollForGift(orderTotal) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    // We only roll for logged-in users so we can save their history
    if (!session?.user?.id) return null;

    const activeGifts = await Surprise.find({ 
      isActive: true, 
      minPurchase: { $lte: orderTotal } 
    }).lean();

    if (!activeGifts.length) return null;

    const random = Math.random() * 100;
    let cumulative = 0;

    for (const gift of activeGifts) {
      cumulative += gift.probability;
      if (random <= cumulative) {
        
        // 💡 NEW: Save this win to RewardHistory so they see it in their dashboard
        await RewardHistory.create({
          userId: session.user.id,
          giftId: gift._id,
          title: gift.title,
          code: gift.code,
          value: gift.value,
          discountType: gift.discountType
        });

        await Surprise.findByIdAndUpdate(gift._id, { $inc: { usageCount: 1 } });
        
        revalidatePath("/dashboard/rewards");
        return JSON.parse(JSON.stringify(gift));
      }
    }
    return null;
  } catch (err) {
    console.error("Roll error:", err);
    return null;
  }
}

// FETCH PERSONAL REWARDS
export async function getMyRewards() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return [];
    }

    const rewards = await RewardHistory.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(rewards));
  } catch (err) {
    console.error("Fetch Rewards Error:", err);
    return [];
  }
}

export async function distributeGift(userId, giftId) {
  try {
    await dbConnect();

    // 1. Find the gift details
    const gift = await Surprise.findById(giftId);
    if (!gift) return { success: false, error: "Gift not found" };

    // 2. Create the reward history record
    await RewardHistory.create({
      userId,
      giftId: gift._id,
      title: gift.title,
      code: gift.code,
      discountType: gift.discountType,
      value: gift.value,
      createdAt: new Date(),
    });

    // 3. Refresh the admin page data
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Distribution Error:", error);
    return { success: false, error: "Database error during distribution" };
  }
}