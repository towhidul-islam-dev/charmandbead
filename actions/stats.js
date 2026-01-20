'use server'

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export async function getDashboardStats() {
  try {
    await connectDB();

    // 1. Total Revenue (Sum of all delivered or processing orders)
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 2. Active Orders (Pending, Processing, or Shipped)
    const activeOrdersCount = await Order.countDocuments({
      status: { $in: ["Pending", "Processing", "Shipped"] }
    });

    // 3. Total Users
    const totalUsers = await User.countDocuments();

    // 4. Conversion Rate (Placeholder calculation or actual logic)
    // Example: (Total Orders / Unique Website Visits) - Requires a separate tracking model
    const conversionRate = 3.2; 

    return {
      success: true,
      stats: {
        totalRevenue,
        activeOrders: activeOrdersCount,
        totalUsers,
        conversionRate
      }
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return { success: false, error: error.message };
  }
}