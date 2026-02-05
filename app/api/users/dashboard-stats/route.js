import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    await dbConnect();
    const userId = session.user.id;
    const userEmail = session.user.email;

    // Convert string ID to MongoDB ObjectId safely
    const objectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : null;

    // 1. Fetch Recent Orders
    // We search by ID OR Email to ensure we catch the data
    const query = {
      $or: [
        { user: userId },
        { user: objectId },
        { email: userEmail }
      ]
    };

    const recentOrders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Aggregate Lifetime Stats
    // We use the same OR logic inside the match stage
    const stats = await Order.aggregate([
      { 
        $match: { 
          $or: [
            { user: userId },
            { user: objectId },
            { email: userEmail }
          ],
          status: { $ne: "Cancelled" } 
        } 
      },
      {
        $group: {
          _id: null,
          lifetimeSpend: { $sum: "$totalAmount" },
          totalOrdersCount: { $count: {} },
        },
      },
    ]);

    const summary = stats[0] || { lifetimeSpend: 0, totalOrdersCount: 0 };

    return new Response(JSON.stringify({
      orders: recentOrders,
      summary: summary
    }), { status: 200 });

  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR:", error);
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}