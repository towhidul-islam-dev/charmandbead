"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order"; // 🚨 Added Order Import
import { auth } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

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
// actions/userActions.js
export async function updateProfile(formData) {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) throw new Error("User not found");

    const name = formData.get("name");
    const phone = formData.get("phone");
    const imageBase64 = formData.get("image"); 

    const updateData = { name, phone };

    // Handle Cloudinary Image Swap
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      // 1. Delete old image from Cloudinary
      if (user.imagePublicId) {
        await deleteImage(user.imagePublicId);
      }

      // 2. Upload new image
      const uploadResult = await uploadImage(imageBase64, "user_profiles");
      if (uploadResult) {
        updateData.image = uploadResult.url;
        updateData.imagePublicId = uploadResult.public_id;
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    );

    revalidatePath("/profile");
    revalidatePath("/admin/users");
    
    return { 
      success: true, 
      user: JSON.parse(JSON.stringify(updatedUser)) 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount() {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (user?.imagePublicId) {
      await deleteImage(user.imagePublicId);
    }

    await User.findByIdAndDelete(user._id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


//it's delete the user account.
export async function deleteUser(userId) {
  try {
    const session = await auth();
    
    // 1. Security Check: Must be an admin to delete users
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    await dbConnect();

    // 2. Security Check: Prevent self-deletion
    if (userId === session.user.id) {
      return { success: false, error: "You cannot delete your own account from the admin panel." };
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, error: "User not found" };

    // 3. Security Check: Prevent deleting protected Super Admins
    if (SUPER_ADMIN_EMAILS.includes(targetUser.email)) {
      return { success: false, error: "Permission Denied: Cannot delete a protected Super Admin." };
    }

    // 4. Cleanup: Delete profile image from Cloudinary if it exists
    if (targetUser.imagePublicId) {
      try {
        await deleteImage(targetUser.imagePublicId);
      } catch (cloudinaryErr) {
        console.error("Cloudinary Delete Error:", cloudinaryErr);
        // We continue deleting the user even if image deletion fails
      }
    }

    // 5. Delete the User record
    await User.findByIdAndDelete(userId);

    // 6. Refresh the UI
    revalidatePath("/admin/users");
    
    return { success: true, message: "User and associated data removed successfully." };
  } catch (err) {
    console.error("DELETE_USER_ERROR:", err);
    return { success: false, error: err.message };
  }
}