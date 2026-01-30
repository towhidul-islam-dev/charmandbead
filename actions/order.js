"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import InventoryLog from "@/models/InventoryLog";

// export async function createOrder(orderData) {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     await dbConnect();
    
//     // 1. Destructure for clarity
//     const { items, phone, totalAmount, userId, shippingAddress, paidAmount, dueAmount, paymentMethod } = orderData;

//     // 🛡️ User Validation Check
//     if (!userId) {
//       throw new Error("User ID is required. Please log in to complete your order.");
//     }

//     // 2. Double-Order Protection (Idempotency)
//     const existingOrder = await Order.findOne({
//       "shippingAddress.phone": phone,
//       totalAmount: totalAmount,
//       // Check for orders in the last 60 seconds to prevent double-clicks
//       createdAt: { $gte: new Date(Date.now() - 60 * 1000) } 
//     }).session(session);

//     if (existingOrder) {
//       await session.abortTransaction();
//       return { success: true, orderId: existingOrder._id };
//     }

//     // 3. Create Order Doc 
//     // 🟢 FIXED: Explicitly mapping 'userId' to the 'user' field required by your Schema
//     const [newOrder] = await Order.create([{
//        user: userId, 
//        items: items.map(i => ({
//          product: i.productId || i.product || i._id,
//          productName: i.name,
//          variant: {
//             name: i.color || "Default",
//             size: i.size || "N/A",
//             variantId: i.variantId
//          },
//          quantity: Number(i.quantity),
//          price: Number(i.price),
//          sku: i.sku || "N/A"
//        })),
//        shippingAddress,
//        totalAmount,
//        paidAmount,
//        dueAmount,
//        paymentMethod,
//        status: "Pending",
//        isStockReduced: false
//     }], { session });

//     // 4. Group deductions by Product ID 
//     const productDeductions = items.reduce((acc, item) => {
//       const pId = (item.productId || item.product || item._id).toString();
//       if (!acc[pId]) acc[pId] = { totalQty: 0, variants: [], name: item.name };
      
//       const qty = Number(item.quantity);
//       acc[pId].totalQty += qty;
      
//       if (item.variantId) {
//         acc[pId].variants.push({ vId: item.variantId.toString(), qty });
//       }
//       return acc;
//     }, {});

//     // 5. Atomic Inventory Update
//     const orderRef = `Order #${newOrder._id.toString().slice(-6).toUpperCase()}`;

//     for (const [productId, data] of Object.entries(productDeductions)) {
//       const updateDoc = { $inc: { stock: -data.totalQty } };
//       const arrayFilters = [];

//       data.variants.forEach((v, idx) => {
//         const fName = `var${idx}`;
//         updateDoc.$inc[`variants.$[${fName}].stock`] = -v.qty;
//         arrayFilters.push({ [`${fName}._id`]: new mongoose.Types.ObjectId(v.vId) });
//       });

//       const productUpdate = await Product.findOneAndUpdate(
//         { _id: productId, stock: { $gte: data.totalQty } },
//         updateDoc,
//         { 
//           session, 
//           arrayFilters: arrayFilters.length > 0 ? arrayFilters : undefined, 
//           new: true 
//         }
//       );

//       if (!productUpdate) {
//         throw new Error(`Insufficient stock for ${data.name}.`);
//       }

//       // Log the inventory change
//       await InventoryLog.create([{
//         productId,
//         productName: data.name,
//         change: -data.totalQty,
//         reason: "Order Placement",
//         performedBy: orderRef
//       }], { session });
//     }

//     // 6. Finalize Order Status
//     await Order.updateOne({ _id: newOrder._id }, { isStockReduced: true }, { session });
    
//     await session.commitTransaction();

//     revalidatePath("/admin/products");
//     revalidatePath("/admin/orders");
//     revalidatePath("/products");

//     return { success: true, orderId: newOrder._id };

//   } catch (error) {
//     if (session.transaction.state !== 'TRANSACTION_ABORTED') {
//       await session.abortTransaction();
//     }
//     console.error("ORDER_ERROR:", error.message);
//     return { success: false, message: error.message };
//   } finally {
//     session.endSession();
//   }
// }

export async function createOrder(orderData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const { items, phone, totalAmount, userId, shippingAddress, paidAmount, dueAmount, paymentMethod } = orderData;

    if (!userId) throw new Error("User ID is required.");

    // 1. Idempotency Check (Prevents double orders if user clicks twice)
    const existingOrder = await Order.findOne({
      "shippingAddress.phone": phone,
      totalAmount: totalAmount,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) } 
    }).session(session);

    if (existingOrder) {
      await session.abortTransaction();
      return { success: true, orderId: existingOrder._id };
    }

    // 2. Create the Order
    const [newOrder] = await Order.create([{
       user: userId, 
       items: items.map(i => ({
         product: i.productId || i.product || i._id,
         productName: i.name,
         variant: {
            name: i.color || "Default",
            size: i.size || "N/A",
            variantId: i.variantId
         },
         quantity: Number(i.quantity),
         price: Number(i.price),
         sku: i.sku || "N/A"
       })),
       shippingAddress,
       totalAmount,
       paidAmount,
       dueAmount,
       paymentMethod,
       status: "Pending",
       isStockReduced: false
    }], { session });

    // 3. Group deductions by Product
    const productDeductions = items.reduce((acc, item) => {
      const pId = (item.productId || item.product || item._id).toString();
      if (!acc[pId]) acc[pId] = { totalQty: 0, variants: [], name: item.name };
      const qty = Number(item.quantity);
      acc[pId].totalQty += qty;
      if (item.variantId) {
        acc[pId].variants.push({ vId: item.variantId.toString(), qty });
      }
      return acc;
    }, {});

    // 4. Atomic Inventory Sync Loop
    const orderRef = `Order #${newOrder._id.toString().slice(-6).toUpperCase()}`;

    for (const [productId, data] of Object.entries(productDeductions)) {
      // Step A: Find the product first to check stock and get current variants
      const product = await Product.findById(productId).session(session);
      
      if (!product) throw new Error(`Product ${data.name} not found.`);
      
      // Step B: Calculate new variant stocks in memory
      if (product.hasVariants) {
        data.variants.forEach(orderedVar => {
          const target = product.variants.id(orderedVar.vId);
          if (!target) throw new Error(`Variant not found for ${data.name}`);
          if (target.stock < orderedVar.qty) throw new Error(`Low stock for ${data.name} (${target.color})`);
          
          target.stock -= orderedVar.qty; // Subtract variant stock
        });

        // Step C: 🟢 THE HEALER - Set parent stock as sum of new variant stocks
        product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      } else {
        // Standard product logic
        if (product.stock < data.totalQty) throw new Error(`Low stock for ${data.name}`);
        product.stock -= data.totalQty;
      }

      // Step D: Save the product (This triggers your Pre-Save Hook automatically)
      await product.save({ session });

      // Step E: Log the change
      await InventoryLog.create([{
        productId,
        productName: data.name,
        change: -data.totalQty,
        reason: "Order Placement",
        performedBy: orderRef
      }], { session });
    }

    // 5. Success - Finalize order status
    await Order.updateOne({ _id: newOrder._id }, { isStockReduced: true }, { session });
    
    await session.commitTransaction();

    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");
    revalidatePath("/products");

    return { success: true, orderId: newOrder._id };

  } catch (error) {
    if (session.transaction.state !== 'TRANSACTION_ABORTED') {
      await session.abortTransaction();
    }
    console.error("ORDER_ERROR:", error.message);
    return { success: false, message: error.message };
  } finally {
    session.endSession();
  }
}

// --- STATS & HELPER FUNCTIONS ---
export async function updateOrderStatus(orderId, newStatus) {
  try {
    await dbConnect();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return { success: false, message: "Order not found" };
    }

    // Trigger Next.js to refresh the data on these pages
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    
    // If the order is marked as delivered, update the user's VIP status
    if (newStatus === "Delivered" && updatedOrder.user) {
      await syncVIPStatus(updatedOrder.user);
    }

    return { success: true, order: JSON.parse(JSON.stringify(updatedOrder)) };
  } catch (error) {
    console.error("UPDATE_STATUS_FAILED:", error.message);
    return { success: false, message: "Failed to update status" };
  }
}

export async function syncVIPStatus(userId) {
  try {
    await dbConnect();
    const stats = await Order.aggregate([
      { $match: { user: userId, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSpent = stats.length > 0 ? stats[0].total : 0;
    const isVIP = totalSpent >= 10000;
    await User.findByIdAndUpdate(userId, { totalSpent, isVIP });
    return { success: true, totalSpent, isVIP };
  } catch (error) { return { success: false }; }
}

export async function getDashboardStats(period = "all") {
  try {
    await dbConnect();
    let startDate = new Date(0);
    const now = new Date();
    if (period === "7days") startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === "30days") startDate = new Date(now.setDate(now.getDate() - 30));
    else if (period === "year") startDate = new Date(now.setFullYear(now.getFullYear() - 1));

    const financialData = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: "$totalAmount" },
          totalMfsFees: { $sum: { $ifNull: ["$mobileBankingFee", 0] } },
          totalDeliveryCharges: { $sum: { $ifNull: ["$deliveryCharge", 0] } },
          orderCount: { $sum: 1 },
        },
      },
    ]);
    const financials = financialData[0] || { grossRevenue: 0, totalMfsFees: 0, totalDeliveryCharges: 0, orderCount: 0 };
    return {
      success: true,
      stats: {
        totalRevenue: financials.grossRevenue,
        netRevenue: financials.grossRevenue - financials.totalMfsFees - financials.totalDeliveryCharges,
        gatewayCosts: financials.totalMfsFees,
        deliveryCosts: financials.totalDeliveryCharges,
        orderCount: financials.orderCount,
      },
    };
  } catch (error) { return { success: false }; }
}

export async function getAllOrders(page = 1, limit = 10, search = "", status = "All") {
  try {
    await dbConnect();
    const query = {};
    if (status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
      ];
    }
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);
    return {
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    };
  } catch (error) { return { success: false, orders: [], totalPages: 0 }; }
}

export async function getOrderById(orderId) {
  try {
    await dbConnect();
    const order = await Order.findById(orderId).lean();
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch (error) { return null; }
}

export async function deleteOrder(orderId) {
  try {
    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) return { success: false, error: "Order not found" };
    const userId = order.user;
    await Order.findByIdAndDelete(orderId);
    if (userId) await syncVIPStatus(userId);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) { return { success: false, error: "Database error" }; }
}

export async function getUserOrders(userId) {
  try {
    await dbConnect();
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) { return []; }
}

export async function getNewOrdersCount() {
  try {
    await dbConnect();
    return await Order.countDocuments({ status: "Pending" });
  } catch (error) { return 0; }
}