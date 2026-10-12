"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order"; // 🚨 Added Order Import
import { auth } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

// 💡 MUST MATCH YOUR auth.js LIST
const SUPER_ADMIN_EMAILS = [
  "towhidulislam12995@gmail.com",
  "jubydaakter994@gmail.com",
  "charmandbeads.official@gmail.com",
];

// --- EXISTING & ENHANCED ADDRESS FUNCTIONS ---

export async function getUserAddress() {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.email)
      return { success: false, error: "Not authenticated" };
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user || !user.addresses || user.addresses.length === 0)
      return { success: true, address: null, addresses: [] };

    // Return both the primary/default address for backwards compatibility and the full list
    const defaultAddr =
      user.addresses.find((a) => a.isDefault) || user.addresses[0];
    return {
      success: true,
      address: JSON.parse(JSON.stringify(defaultAddr)),
      addresses: JSON.parse(JSON.stringify(user.addresses)),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAddress(formData) {
  console.log(
    "Server Action Received:",
    Object.fromEntries(formData.entries()),
  );
  try {
    const session = await auth();
    if (!session?.user?.email)
      return { success: false, error: "Not authenticated" };
    await dbConnect();

    const addressId = formData.get("addressId"); // Present when editing an existing address
    const name = formData.get("name") || formData.get("fullName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const district = formData.get("district") || "Dhaka";
    const thana = formData.get("thana") || "";
    const city = formData.get("city");
    const street = formData.get("street");
    const zipCode = formData.get("zipCode");
    const deliveryCharge = Number(formData.get("deliveryCharge")) || 80;
    const label = formData.get("label") || "Home";

    // Optional validation for basic email layout
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) return { success: false, error: "User not found" };

    if (!user.addresses) {
      user.addresses = [];
    }

    const addressPayload = {
      label,
      fullName: name,
      email: email,
      phone: phone,
      district,
      thana,
      city,
      street,
      zipCode,
      deliveryCharge,
      isDefault: true, // New or edited from single view defaults to primary
    };

    // Make all other addresses non-default since this one is being added/saved as active
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    if (addressId) {
      // Edit existing sub-document
      const addrDoc = user.addresses.id(addressId);
      if (addrDoc) {
        Object.assign(addrDoc, addressPayload);
      } else {
        user.addresses.push(addressPayload);
      }
    } else {
      // Add new address to array
      user.addresses.push(addressPayload);
    }

    // Update user's name and primary email if provided
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    revalidatePath("/dashboard/address");
    revalidatePath("/checkout");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (err) {
    console.error("UPDATE ADDRESS ERROR:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteAddress(addressId = null) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return { success: false, error: "User not found" };

    if (addressId) {
      // Delete a specific address by its sub-document ID
      user.addresses.pull({ _id: addressId });
      // If default was deleted and items remain, set the first one as default
      if (
        user.addresses.length > 0 &&
        !user.addresses.some((a) => a.isDefault)
      ) {
        user.addresses[0].isDefault = true;
      }
    } else {
      // Clear all addresses if no specific ID is provided (backward compatibility)
      user.addresses = [];
    }

    await user.save();

    revalidatePath("/dashboard/address");
    revalidatePath("/checkout");
    return { success: true, message: "Address removed" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function setDefaultAddress(addressId) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return { success: false, error: "Not authenticated" };

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return { success: false, error: "User not found" };

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();
    revalidatePath("/dashboard/address");
    revalidatePath("/checkout");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// --- EXISTING ADMIN & PROFILE FUNCTIONS ---

export async function syncVIPStatus(userId) {
  try {
    await dbConnect();

    // Calculate sum of all delivered orders
    const orders = await Order.find({ user: userId, status: "Delivered" });
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0,
    );

    const isVIP = totalSpent >= 10000;

    await User.findByIdAndUpdate(userId, {
      $set: { isVIP: isVIP },
    });

    revalidatePath("/admin/users");
    return { success: true, isVIP, totalSpent };
  } catch (err) {
    console.error("VIP Sync Error:", err);
    return { success: false };
  }
}

export async function updateUserRole(userId, newRole) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    await dbConnect();

    if (userId === session.user.id) {
      return {
        success: false,
        error: "Security risk: You cannot change your own role.",
      };
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, error: "User not found" };

    if (SUPER_ADMIN_EMAILS.includes(targetUser.email)) {
      return {
        success: false,
        error: "Permission Denied: Protected Super Admin.",
      };
    }

    await User.findByIdAndUpdate(userId, { $set: { role: newRole } });

    await syncVIPStatus(userId);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateProfile(formData) {
  try {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) throw new Error("User not found");

    const name = formData.get("name");
    const phone = formData.get("phone");
    const imageBase64 = formData.get("image");

    const updateData = {
      name: name || user.name,
      phone: phone || "",
    };

    if (imageBase64 && imageBase64.startsWith("data:image")) {
      if (user.imagePublicId) {
        try {
          await deleteImage(user.imagePublicId);
        } catch (err) {
          console.error("Cloudinary Delete Error (Non-Fatal):", err);
        }
      }

      const uploadResult = await uploadImage(imageBase64, "user_profiles");
      if (uploadResult) {
        updateData.image = uploadResult.public_id;
        updateData.imagePublicId = uploadResult.public_id;
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true },
    ).lean();

    revalidatePath("/", "layout");
    revalidatePath("/profile");

    return {
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
      },
    };
  } catch (error) {
    console.error("Profile Update Error:", error);
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

export async function deleteUser(userId) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    await dbConnect();

    if (userId === session.user.id) {
      return {
        success: false,
        error: "You cannot delete your own account from the admin panel.",
      };
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, error: "User not found" };

    if (SUPER_ADMIN_EMAILS.includes(targetUser.email)) {
      return {
        success: false,
        error: "Permission Denied: Cannot delete a protected Super Admin.",
      };
    }

    if (targetUser.imagePublicId) {
      try {
        await deleteImage(targetUser.imagePublicId);
      } catch (cloudinaryErr) {
        console.error("Cloudinary Delete Error:", cloudinaryErr);
      }
    }

    await User.findByIdAndDelete(userId);

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User and associated data removed successfully.",
    };
  } catch (err) {
    console.error("DELETE_USER_ERROR:", err);
    return { success: false, error: err.message };
  }
}
