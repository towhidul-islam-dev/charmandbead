"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product"; 
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { sendShippingUpdateEmail } from "@/lib/mail";

// 1. UNIQUE SYNC FUNCTION
export async function syncVIPStatus(userId) {
  try {
    await dbConnect();
    const stats = await Order.aggregate([
      { $match: { user: userId, status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalSpent = stats.length > 0 ? stats[0].total : 0;
    const isVIP = totalSpent >= 10000;

    await User.findByIdAndUpdate(userId, {
      totalSpent: totalSpent,
      isVIP: isVIP
    });

    return { success: true, totalSpent, isVIP };
  } catch (error) {
    console.error("VIP Sync Error:", error);
    return { success: false };
  }
}

export async function getNewOrdersCount() {

  try {

    await dbConnect();

    return await Order.countDocuments({ status: "Pending" });

  } catch (error) {

    console.error("Error fetching new orders count:", error);

    return 0;

  }

}

export async function getOrderById(orderId) {

  try {

    await dbConnect();

    const order = await Order.findById(orderId).lean();

    if (!order) return null;

    return JSON.parse(JSON.stringify(order));

  } catch (error) {

    return null;

  }

}
// 2. UNIQUE STATUS UPDATE FUNCTION (Merged Logic)
export async function updateOrderStatus(orderId, newStatus, trackingNumber = null) {
  try {
    await dbConnect();

    const oldOrder = await Order.findById(orderId);
    if (!oldOrder) throw new Error("Order not found");

    // Stock Return Logic
    if (newStatus === "Cancelled" && oldOrder.status !== "Cancelled") {
      for (const item of oldOrder.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    const updateData = { status: newStatus };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    if (newStatus === "Delivered") {
      updateData.paymentStatus = "Paid";
      updateData.dueAmount = 0;
      updateData.paidAmount = oldOrder.totalAmount;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    // VIP Sync Trigger
    if (newStatus === "Delivered" && updatedOrder.user) {
      await syncVIPStatus(updatedOrder.user);
    }

    // Email Notification
    if (newStatus === "Shipped") {
      try {
        const emailPayload = JSON.parse(JSON.stringify(updatedOrder.toObject()));
        await sendShippingUpdateEmail(emailPayload);
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

// 3. DELETE ORDER FUNCTION
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

// 4. FETCHING FUNCTIONS
export async function getAllOrders(page = 1, limit = 10, search = "", status = "All") {
  try {
    await dbConnect();
    
    // 1. Build Query for MongoDB (Faster than filtering in Javascript)
    const query = {};
    if (status !== "All") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { "_id": { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    // 2. Execute queries in parallel for speed
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    return {
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, orders: [], totalPages: 0 };
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