"use server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import NotifyMe from "@/models/NotifyMe";
import Order from "@/models/Order";
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
    await sendAdminLowStockAlert(
      product.name,
      `${variant.color}-${variant.size}`,
      currentStock,
      moq,
    );
  }
}

export async function updateInventoryStock(
  productId,
  variantId,
  newStockAmount,
  adminEmail = "Admin",
) {
  try {
    await dbConnect();
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return { success: false, message: "Product not found" };

    let stockDifference = 0;
    let variantKey = "Standard";
    let updatedProduct;
    let oldStock = 0;

    // 🟢 CASE A: The product has variants
    if (variantId && variantId !== "undefined") {
      const variant = currentProduct.variants.id(variantId);
      if (!variant) return { success: false, message: "Variant not found" };
      
      oldStock = variant.stock;
      stockDifference = Number(newStockAmount) - oldStock;
      variantKey = `${variant.color}-${variant.size}`;

      if (stockDifference === 0) return { success: true, notifiedCount: 0 };

      updatedProduct = await Product.findOneAndUpdate(
        { _id: productId },
        {
          $inc: {
            "variants.$[v].stock": stockDifference,
            stock: stockDifference,
          },
        },
        {
          arrayFilters: [{ "v._id": variantId }],
          new: true,
          runValidators: true,
        }
      );
    } 
    // 🟢 CASE B: Standard Product (No variants)
    else {
      oldStock = currentProduct.stock;
      stockDifference = Number(newStockAmount) - oldStock;
      
      if (stockDifference === 0) return { success: true, notifiedCount: 0 };

      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: stockDifference } },
        { new: true, runValidators: true }
      );
    }

    // 3. Create Inventory Log
    await InventoryLog.create({
      productId,
      productName: updatedProduct.name,
      variantKey,
      change: stockDifference,
      reason: stockDifference > 0 ? "Restock" : "Adjustment",
      performedBy: adminEmail,
    });

    // 4. Back-in-stock logic
    let notifiedCount = 0;
    const moq = updatedProduct.minOrderQuantity || 1; 

    if (Number(newStockAmount) >= moq && oldStock < moq) {
      const waitingUsers = await NotifyMe.find({
        productId,
        variantKey,
        status: "Pending",
      });

      if (waitingUsers.length > 0) {
        notifiedCount = waitingUsers.length;
        await Promise.all(
          waitingUsers.map(async (req) => {
            await sendStockEmail(
              req.email,
              updatedProduct.name,
              variantKey,
              productId
            );
            req.status = "Notified";
            await req.save();
          })
        );
      }
    }

    revalidatePath("/admin/products");
    return { success: true, notifiedCount };
  } catch (error) {
    console.error("RESTOCK_ERROR:", error);
    return { success: false, message: error.message };
  }
}

/**
 * 3. ORDER PROCESSOR (The Fix for Variant Sync)
 * Using explicit async serialization to ensure each variant is deducted properly.
 */
export async function processOrderStock(order) {
  try {
    await dbConnect();
    const existingOrder = await Order.findById(order._id);
    if (existingOrder?.stockProcessed) {
      console.log("Order already processed, skipping stock deduction.");
      return { success: true };
    }
    // 🟢 CRITICAL: We use a standard for loop to ensure "await"
    // blocks until the DB fully finishes the previous variant.
    for (const item of order.items) {
      const qtyToDeduct = Number(item.quantity);
      const isVariant = item.variant && item.variant.name !== "Default";

      if (isVariant) {
        // TARGETED ATOMIC UPDATE
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            variants: {
              $elemMatch: {
                color: item.variant.name,
                size: item.variant.size,
                stock: { $gte: qtyToDeduct }, // 🛑 Prevent negative stock
              },
            },
          },
          {
            $inc: {
              "variants.$[v].stock": -qtyToDeduct,
              stock: -qtyToDeduct, // Deducts from the main "total" stock too
            },
          },
          {
            arrayFilters: [
              { "v.color": item.variant.name, "v.size": item.variant.size },
            ],
            new: true,
          },
        );

        if (updatedProduct) {
          const variant = updatedProduct.variants.find(
            (v) =>
              v.color === item.variant.name && v.size === item.variant.size,
          );

          await InventoryLog.create({
            productId: item.product,
            productName: updatedProduct.name,
            variantKey: `${item.variant.name}-${item.variant.size}`,
            change: -qtyToDeduct,
            reason: "Sale",
            performedBy: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
          });

          await checkLowStock(updatedProduct, variant);
        }
      } else {
        // Standard Product Deduction
        await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: qtyToDeduct } },
          { $inc: { stock: -qtyToDeduct } },
          { new: true },
        );
      }
    }

    // Mark as processed to prevent double-deduction on page refresh
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
      .sort({ createdAt: -1 })
      .limit(10);
    return { success: true, logs: JSON.parse(JSON.stringify(logs)) };
  } catch (error) {
    return { success: false, logs: [] };
  }
}
