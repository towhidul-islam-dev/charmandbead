"use server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import NotifyMe from "@/models/NotifyMe";
import Order from "@/models/Order"; // ⬅️ ADDED THIS IMPORT
import { sendAdminLowStockAlert, sendStockEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import InventoryLog from "@/models/InventoryLog";
/**
 * 1. THE WATCHER (Sale Trigger)
 */
export async function checkLowStock(product, variant) {
  const currentStock = variant.stock;
  const moq = variant.minOrderQuantity || product.minOrderQuantity || 1;
  const threshold = moq * 2;

  if (currentStock <= threshold && currentStock > 0) {
    console.log(`⚠️ Low stock detected: ${product.name} (${variant.color})`);
    await sendAdminLowStockAlert(
      product.name,
      `${variant.color}-${variant.size}`,
      currentStock,
      moq
    );
  }
}

/**
 * 2. THE REFILLER (Admin Trigger)
 */
export async function updateInventoryStock(productId, variantId, newStockAmount, adminEmail = "Admin") {
  try {
    await dbConnect();

    // 1. Fetch current product to calculate the change (difference)
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return { success: false, message: "Product not found" };

    const variant = currentProduct.variants.id(variantId);
    const oldStock = variant.stock;
    const stockDifference = Number(newStockAmount) - oldStock;
    const variantKey = `${variant.color}-${variant.size}`;

    // 2. Perform the Update
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, "variants._id": variantId },
      { $set: { "variants.$.stock": Number(newStockAmount) } },
      { new: true }
    );

    // 3. 🟢 CREATE INVENTORY LOG
    // This creates a permanent record of the restock
    await InventoryLog.create({
      productId,
      productName: updatedProduct.name,
      variantKey: variantKey,
      change: stockDifference,
      reason: 'Restock',
      performedBy: adminEmail // Pass the current user's email here if available
    });

    // 4. BACK-IN-STOCK NOTIFICATIONS
    const moq = variant.minOrderQuantity || updatedProduct.minOrderQuantity || 1;
    let notifiedCount = 0;

    if (Number(newStockAmount) >= moq) {
      const waitingUsers = await NotifyMe.find({
        productId: productId,
        variantKey: variantKey,
        status: "Pending"
      });

      if (waitingUsers.length > 0) {
        notifiedCount = waitingUsers.length;
        await Promise.all(waitingUsers.map(async (request) => {
          await sendStockEmail(request.email, updatedProduct.name, variantKey, productId);
          request.status = "Notified";
          await request.save();
        }));
      }
    }

    revalidatePath(`/product/${productId}`);
    revalidatePath("/admin/products");
    
    return { success: true, notifiedCount, change: stockDifference };
  } catch (error) {
    console.error("STOCK_UPDATE_ERROR:", error);
    return { success: false, message: "Failed to update stock" };
  }
}

/**
 * 3. ORDER PROCESSOR (Checkout Trigger)
 */
export async function processOrderStock(order) {
  try {
    await dbConnect();

    for (const item of order.items) {
      // 1. Find the product
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // 2. Decrement the stock in the database
      const updatedProduct = await Product.findOneAndUpdate(
        { 
          _id: item.productId, 
          "variants.color": item.color, 
          "variants.size": item.size 
        },
        { $inc: { "variants.$.stock": -item.quantity } },
        { new: true }
      );

      if (updatedProduct) {
        const variant = updatedProduct.variants.find(
          (v) => v.color === item.color && v.size === item.size
        );
        
        // 3. 🟢 RECORD THE LOG (Sale)
        // This tracks the deduction in your history log
        await InventoryLog.create({
          productId: item.productId,
          productName: updatedProduct.name,
          variantKey: `${item.color}-${item.size}`,
          change: -item.quantity, // Negative number representing stock removal
          reason: 'Sale',
          performedBy: `Order #${order._id.slice(-6).toUpperCase()}` // Ties the log to a specific order
        });

        // 4. Trigger the Low Stock Email if it falls below threshold
        await checkLowStock(updatedProduct, variant);
      }
    }

    // 5. Mark order as stock-processed
    await Order.findByIdAndUpdate(order._id, { stockProcessed: true });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("FAILED_TO_PROCESS_STOCK:", error);
    return { success: false };
  }
}

export async function getInventoryHistory(productId) {
  try {
    await dbConnect();
    const logs = await InventoryLog.find({ productId })
      .sort({ createdAt: -1 }) // Newest first
      .limit(10); // Last 10 entries
    
    return { success: true, logs: JSON.parse(JSON.stringify(logs)) };
  } catch (error) {
    return { success: false, logs: [] };
  }
}