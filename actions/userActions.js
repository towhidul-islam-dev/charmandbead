"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order"; // 🚨 Added Order Import
import { auth } from "@/lib/auth";

// 💡 MUST MATCH YOUR auth.js LIST
const SUPER_ADMIN_EMAILS = [
  "towhidulislam12@gmail.com", 
  "dev@admin.com"
];

// --- EXISTING FUNCTIONS ---

export async function getUserAddress() {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: "Not authenticated" };
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user || !user.addresses || user.addresses.length === 0) return { success: true, address: null };
    return { success: true, address: JSON.parse(JSON.stringify(user.addresses[0])) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAddress(formData) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    await dbConnect();

    const name = formData.get("name");
    const phone = formData.get("phone");
    const city = formData.get("city");
    const street = formData.get("street");
    const zipCode = formData.get("zipCode");

    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: name,
          addresses: [{
            fullName: name, phone, city, street, zipCode,
            isDefault: true, label: "Home",
          }],
        },
      },
      { upsert: true, new: true }
    );

    revalidatePath("/dashboard/address");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ... (deleteAddress, updateAvatar remain same as your snippet)
export async function deleteAddress() {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    
    await dbConnect();

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { addresses: [] } }
    );

    revalidatePath("/dashboard/address");
    return { success: true, message: "Address removed" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function syncVIPStatus(userId) {
  try {
    await dbConnect();
    
    // Calculate sum of all delivered orders
    const orders = await Order.find({ user: userId, status: "Delivered" });
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const isVIP = totalSpent >= 10000;

    await User.findByIdAndUpdate(userId, { 
      $set: { isVIP: isVIP } 
    });

    revalidatePath("/admin/users");
    return { success: true, isVIP, totalSpent };
  } catch (err) {
    console.error("VIP Sync Error:", err);
    return { success: false };
  }
}

/**
 * Updated updateUserRole with automatic VIP sync check
 */
export async function updateUserRole(userId, newRole) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    await dbConnect();

    if (userId === session.user.id) {
      return { success: false, error: "Security risk: You cannot change your own role." };
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, error: "User not found" };

    if (SUPER_ADMIN_EMAILS.includes(targetUser.email)) {
      return { success: false, error: "Permission Denied: Protected Super Admin." };
    }

    await User.findByIdAndUpdate(userId, { $set: { role: newRole } });

    // 🟢 After updating role, also sync VIP status to be sure
    await syncVIPStatus(userId);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Updated profile with better nesting support
 */
export async function updateProfile(formData) {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    await dbConnect();
    const name = formData.get("name");
    const imageUrl = formData.get("image");

    const updateData = { name };
    if (imageUrl) updateData.image = imageUrl;

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData }
    );

    // 🟢 If user is a customer, check their VIP progress
    const user = await User.findOne({ email: session.user.email });
    await syncVIPStatus(user._id);

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/admin/users");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}