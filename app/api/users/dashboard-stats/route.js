import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    await dbConnect();
    const userId = session.user.id;
    const userEmail = session.user.email;

    // 🟢 NEW: Get date range from URL query (e.g., ?range=month)
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range"); 

    const objectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : null;

    // Base query for the user
    let queryConditions = [
      { user: userId },
      { email: userEmail }
    ];
    if (objectId) queryConditions.push({ user: objectId });

    // 🟢 DATE FILTER LOGIC
    let dateFilter = {};
    if (range && range !== "lifetime") {
      const now = new Date();
      const startDate = new Date();

      if (range === "today") startDate.setHours(0, 0, 0, 0);
      else if (range === "week") startDate.setDate(now.getDate() - 7);
      else if (range === "month") startDate.setMonth(now.getMonth() - 1);
      else if (range === "year") startDate.setFullYear(now.getFullYear() - 1);

      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Combine user query with date filter
    const finalQuery = { 
      $and: [
        { $or: queryConditions },
        dateFilter
      ]
    };

    // 1. Fetch Recent Orders (Always shows latest 10, regardless of date filter for UX)
    const recentOrders = await Order.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Aggregate Stats with Date Awareness
    const stats = await Order.aggregate([
      { 
        $match: finalQuery 
      },
      {
        $group: {
          _id: null,
          lifetimeSpend: { 
            $sum: { 
              $cond: [{ $ne: ["$status", "Cancelled"] }, "$totalAmount", 0] 
            } 
          },
          totalOrdersCount: { 
            $sum: { 
              $cond: [{ $ne: ["$status", "Cancelled"] }, 1, 0] 
            } 
          },
          cancelledOrdersCount: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] 
            } 
          },
        },
      },
    ]);

    const summary = stats[0] || { 
      lifetimeSpend: 0, 
      totalOrdersCount: 0, 
      cancelledOrdersCount: 0 
    };

    return new Response(JSON.stringify({
      orders: recentOrders,
      summary: summary
    }), { status: 200 });

  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR:", error);
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}