"use server";
import dbConnect from "@/lib/mongodb";
import NotifyMe from "@/models/NotifyMe";
import Product from "@/models/Product";
import { sendStockEmail } from "@/lib/mail";

// USER ACTION: Register for notification
export async function registerStockNotification(data) {
  try {
    await dbConnect();
    const existing = await NotifyMe.findOne({ 
      email: data.email, 
      variantKey: data.variantKey, 
      status: "Pending" 
    });
    if (existing) return { success: false, message: "Already on the list!" };
    
    await NotifyMe.create(data);
    return { success: true, message: "We'll email you when it's back!" };
  } catch (e) { return { success: false, message: "Error saving request" }; }
}

// ADMIN ACTION: Update stock and trigger emails
export async function updateProductStock(productId, updatedVariants) {
  try {
    await dbConnect();
    const product = await Product.findByIdAndUpdate(
      productId, 
      { variants: updatedVariants }, 
      { new: true }
    );

    for (const v of product.variants) {
      const moq = v.minOrderQuantity || product.minOrderQuantity || 1;
      if (v.stock >= moq) {
        const variantKey = `${v.color}-${v.size}`;
        const waitingUsers = await NotifyMe.find({ 
          productId, 
          variantKey, 
          status: "Pending" 
        });

        if (waitingUsers.length > 0) {
          await Promise.all(waitingUsers.map(async (req) => {
            await sendStockEmail(req.email, product.name, variantKey, productId);
            req.status = "Notified";
            await req.save();
          }));
        }
      }
    }
    return { success: true };
  } catch (e) { return { success: false }; }
}