"use server";

import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product"; 
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { sendShippingUpdateEmail } from "@/lib/mail";

/**
 * 1. CREATE ORDER (The missing function)
 */
export async function createOrder(orderData) {
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

    // 1. Map items to match your Schema's variant structure
    const formattedItems = items.map(item => ({
      product: item._id || item.id,
      productName: item.name,
      variant: {
        name: item.color || "Default", // Storing color as variant name
        image: item.imageUrl || "",
        size: item.size || "N/A",
      },
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    // 2. Determine payment status based on your Schema's Enum
    // Options: "Unpaid", "Partially Paid", "Paid"
    let statusOfPayment = "Unpaid";
    if (paymentMethod === "Online") {
       statusOfPayment = "Paid";
    } else if (paidAmount > 0) {
       statusOfPayment = "Partially Paid";
    }

    // 3. Create the order
    const newOrder = await Order.create({
      user: userId,
      items: formattedItems,
      shippingAddress: {
        ...shippingAddress,
        phone: phone, // Injected from checkout state
      },
      totalAmount: Number(totalAmount),
      deliveryCharge: Number(deliveryCharge),
      paidAmount: Number(paidAmount),
      dueAmount: Number(dueAmount),
      status: "Pending",
      paymentStatus: statusOfPayment,
    });

    // 4. Update product stock
    for (const item of formattedItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");

    return { 
      success: true, 
      message: "Order placed successfully!", 
      orderId: newOrder._id.toString() 
    };
  } catch (error) {
    console.error("❌ Schema/Database Error:", error);
    return { 
      success: false, 
      message: error.code === 11000 ? "Order already exists" : error.message 
    };
  }
}

/**
 * 2. UNIQUE SYNC FUNCTION
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

/**
 * 3. UPDATE ORDER STATUS
 */
export async function updateOrderStatus(orderId, newStatus, trackingNumber = null) {
  try {
    await dbConnect();

    const oldOrder = await Order.findById(orderId);
    if (!oldOrder) throw new Error("Order not found");

    // Stock Return Logic (If cancelled)
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
      updateData.paidAmount = oldOrder.totalAmount;
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    // VIP Sync
    if (newStatus === "Delivered" && updatedOrder.user) {
      await syncVIPStatus(updatedOrder.user);
    }

    // Email logic
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

/**
 * 4. DASHBOARD STATS (Fixed dbConnect typo)
 */
export async function getDashboardStats() {
  try {
    await dbConnect(); // Changed from connectDB

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
      stats: {
        totalRevenue,
        activeOrders,
        totalUsers,
        conversionRate: 3.2
      }
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

/**
 * 5. FETCHING FUNCTIONS
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