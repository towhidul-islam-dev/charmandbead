"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function getUserAddress() {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user || !user.addresses || user.addresses.length === 0) {
      return { success: true, address: null };
    }

    // Return the first address (making it plain JSON for Next.js)
    return { 
      success: true, 
      address: JSON.parse(JSON.stringify(user.addresses[0])) 
    };
  } catch (err) {
    console.error("Error fetching address:", err);
    return { success: false, error: err.message };
  }
}

export async function updateAddress(formData) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Not authenticated" };
    }
    await dbConnect();

    const name = formData.get("name");
    const phone = formData.get("phone");
    const city = formData.get("city");
    const street = formData.get("street");
    const zipCode = formData.get("zipCode"); // Added this

    const result = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          name: name,
          addresses: [{
            fullName: name,
            phone: phone,
            city: city,
            street: street,
            zipCode: zipCode, // Added this
            isDefault: true,
            label: "Home"
          }]
        } 
      },
      { upsert: true, new: true }
    );

    revalidatePath("/dashboard/address");
    revalidatePath("/admin/users");
    revalidatePath("/"); 
    
    return { success: true };
  } catch (err) {
    console.error("Database Error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteAddress(addressId) {
    try {
      const session = await auth();
      if (!session) return { success: false, error: "Not authenticated" };
  
      await dbConnect();
  
      await User.updateOne(
        { email: session.user.email },
        { $pull: { addresses: { _id: addressId } } }
      );
  
      revalidatePath("/dashboard/address");
      revalidatePath("/admin/users");
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
}

// --- UPDATED PROFILE LOGIC ---
export async function updateProfile(formData) {
    try {
        const session = await auth();
        if (!session) throw new Error("Unauthorized");

        await dbConnect();
        const name = formData.get("name");
        const phone = formData.get("phone");
        const imageUrl = formData.get("image"); // Get image URL if passed

        const updateData = { 
            name, 
            "address.phone": phone 
        };

        // Only update image if a new URL is provided
        if (imageUrl) {
            updateData.image = imageUrl;
        }

        await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData }
        );

        // Revalidate all paths where the user profile or navbar appears
        revalidatePath("/profile");
        revalidatePath("/dashboard");
        revalidatePath("/"); 
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Dedicated function for quick avatar updates
export async function updateAvatar(imageUrl) {
    try {
        const session = await auth();
        if (!session) throw new Error("Unauthorized");

        await dbConnect();
        
        await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { image: imageUrl } }
        );

        revalidatePath("/"); 
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}