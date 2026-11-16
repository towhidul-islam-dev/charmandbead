"use server";

import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";
import { revalidatePath } from "next/cache";

export async function updateCartItemNote({ userId, productId, variantId, note }) {
  try {
    await connectDB();

    if (!userId || !productId) {
      return { success: false, message: "Missing user or product information." };
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return { success: false, message: "Cart not found." };
    }

    // Match the exact item & variant in the cart
    const itemIndex = cart.items.findIndex((item) => {
      const sameProduct = item.productId.toString() === productId.toString();
      const itemVarId = item.variantId ? item.variantId.toString() : null;
      const targetVarId = variantId ? variantId.toString() : null;
      return sameProduct && itemVarId === targetVarId;
    });

    if (itemIndex === -1) {
      return { success: false, message: "Item not found in cart." };
    }

    cart.items[itemIndex].note = note.trim();
    await cart.save();

    revalidatePath("/dashboard/cart");
    return { success: true, note: cart.items[itemIndex].note };
  } catch (error) {
    console.error("UPDATE_CART_NOTE_ERROR:", error);
    return { success: false, message: "Failed to save note to database." };
  }
}