"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product"; 
import User from "@/models/User";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { sendShippingUpdateEmail } from "@/lib/mail";

/**
 * 1. CREATE ORDER (Atomic Transaction Logic)
 */
export async function createOrder(orderData) {
  // Start a MongoDB Session for Transactional Integrity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();

    const { 
      userId, 
      items, 
      shippingAddress, 
      totalAmount, 
      paidAmount,
      dueAmount,
      deliveryCharge,
      paymentMethod,
      phone 
    } = orderData;

    // A. Validate and Deduct Stock Atomically
    for (const item of items) {
      const quantityToDeduct = Number(item.quantity);
      const productId = item.productId || item._id;

      // Logic for Variant vs Simple Product
      const isVariant = item.color || item.size;

      const filter = isVariant 
        ? { 
            _id: productId, 
            "variants.color": item.color, 
            "variants.size": item.size,
            "variants.stock": { $gte: quantityToDeduct } // Atomic Check
          }
        : { 
            _id: productId, 
            stock: { $gte: quantityToDeduct } 
          };

      const update = isVariant
        ? { $inc: { "variants.$.stock": -quantityToDeduct } }
        : { $inc: { stock: -quantityToDeduct } };

      const productUpdate = await Product.updateOne(filter, update, { session });

      if (productUpdate.modifiedCount === 0) {
        // This triggers if stock is insufficient OR product/variant doesn't exist
        throw new Error(`Stock error: ${item.name} (${item.color || ''}) is no longer available in the requested quantity.`);
      }
    }

    // B. Map items to match your Schema
    const formattedItems = items.map(item => ({
      product: item.productId || item._id,
      productName: item.name,
      variant: {
        name: item.color || "Default",
        image: item.imageUrl || "",
        size: item.size || "N/A",
      },
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    // C. Determine payment status
    let statusOfPayment = "Unpaid";
    if (paymentMethod === "Online") {
       statusOfPayment = "Paid";
    } else if (paidAmount > 0) {
       statusOfPayment = "Partially Paid";
    }

    // D. Create the order
    const [newOrder] = await Order.create([{
      user: userId,
      items: formattedItems,
      shippingAddress: { ...shippingAddress, phone },
      totalAmount: Number(totalAmount),
      deliveryCharge: Number(deliveryCharge),
      paidAmount: Number(paidAmount),
      dueAmount: Number(dueAmount),
      status: "Pending",
      paymentStatus: statusOfPayment,
    }], { session });

    // If we reach here, commit all changes to the database
    await session.commitTransaction();

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    revalidatePath("/admin/products");

    return { 
      success: true, 
      message: "Order placed successfully!", 
      orderId: newOrder._id.toString() 
    };
  } catch (error) {
    // If ANY part fails, undo all stock deductions
    await session.abortTransaction();
    console.error("❌ Checkout Error:", error);
    return { 
      success: false, 
      message: error.message 
    };
  } finally {
    session.endSession();
  }
}

/**
 * 2. UPDATE ORDER STATUS (Includes Stock Return Logic)
 */
export async function updateOrderStatus(orderId, newStatus, trackingNumber = null) {
  try {
    await dbConnect();

    const oldOrder = await Order.findById(orderId);
    if (!oldOrder) throw new Error("Order not found");

    // Stock Return Logic for Cancellations
    if (newStatus === "Cancelled" && oldOrder.status !== "Cancelled") {
      for (const item of oldOrder.items) {
        const isVariant = item.variant && item.variant.name !== "Default";
        
        const filter = isVariant 
          ? { _id: item.product, "variants.color": item.variant.name, "variants.size": item.variant.size }
          : { _id: item.product };

        const update = isVariant
          ? { $inc: { "variants.$.stock": item.quantity } }
          : { $inc: { stock: item.quantity } };

        await Product.updateOne(filter, update);
      }
    }

    const updateData = { status: newStatus };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    if (newStatus === "Delivered") {
      updateData.paymentStatus = "Paid";
      updateData.paidAmount = oldOrder.totalAmount;
      updateData.dueAmount = 0;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    // VIP Sync on Delivery
    if (newStatus === "Delivered" && updatedOrder.user) {
      await syncVIPStatus(updatedOrder.user);
    }

    // Shipping Notification
    if (newStatus === "Shipped") {
      try {
        await sendShippingUpdateEmail(JSON.parse(JSON.stringify(updatedOrder)));
      } catch (err) {
        console.error("Email failed:", err);
      }
    }
    
    revalidatePath("/admin/orders");
    return { success: true, order: JSON.parse(JSON.stringify(updatedOrder)) };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * 3. DASHBOARD & UTILS
 */
export async function syncVIPStatus(userId) {
  try {
    await dbConnect();
    const stats = await Order.aggregate([
      { $match: { user: userId, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalSpent = stats.length > 0 ? stats[0].total : 0;
    const isVIP = totalSpent >= 10000;

    await User.findByIdAndUpdate(userId, { totalSpent, isVIP });
    return { success: true, totalSpent, isVIP };
  } catch (error) {
    return { success: false };
  }
}

export async function getDashboardStats() {
  try {
    await dbConnect();
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const activeOrders = await Order.countDocuments({
      status: { $in: ["Pending", "Processing", "Shipped"] }
    });

    const totalUsers = await User.countDocuments();

    return {
      success: true,
      stats: { totalRevenue, activeOrders, totalUsers, conversionRate: 3.2 }
    };
  } catch (error) {
    return { success: false };
  }
}

/**
 * 4. FETCHING FUNCTIONS
 */
export async function getAllOrders(page = 1, limit = 10, search = "", status = "All") {
  try {
    await dbConnect();
    const query = {};
    if (status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { "_id": { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query)
    ]);

    return {
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    };
  } catch (error) {
    return { success: false, orders: [], totalPages: 0 };
  }
}

export async function getOrderById(orderId) {
  try {
    await dbConnect();
    const order = await Order.findById(orderId).lean();
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch (error) {
    return null;
  }
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
  } catch (error) {
    return { success: false, error: "Database error" };
  }
}

export async function getUserOrders(userId) {
  try {
    await dbConnect();
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    return [];
  }
}

export async function getNewOrdersCount() {
  try {
    await dbConnect();
    return await Order.countDocuments({ status: "Pending" });
  } catch (error) {
    return 0;
  }
}