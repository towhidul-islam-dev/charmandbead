"use server";
import dbConnect from "@/lib/mongodb";
import NotifyMe from "@/models/NotifyMe";
import Product from "@/models/Product";

export async function getNotificationAnalytics() {
  try {
    await dbConnect();
    
    // 1. Aggregate notifications to count requests per product/variant
    const analytics = await NotifyMe.aggregate([
      { $match: { status: "Pending" } },
      {
        $group: {
          _id: { productId: "$productId", variantKey: "$variantKey" },
          count: { $sum: 1 },
          emails: { $addToSet: "$email" } // $addToSet ensures unique emails only
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 2. Efficiently populate product details
    const populatedAnalytics = await Promise.all(analytics.map(async (item) => {
      try {
        const product = await Product.findById(item._id.productId).select("name imageUrl");
        return {
          ...item,
          productName: product?.name || "Deleted Product",
          productImage: product?.imageUrl || "/placeholder.png"
        };
      } catch (err) {
        return {
          ...item,
          productName: "Error Loading Product",
          productImage: "/placeholder.png"
        };
      }
    }));

    return { 
      success: true, 
      data: populatedAnalytics,
      totalPendingRequests: populatedAnalytics.reduce((acc, curr) => acc + curr.count, 0)
    };
  } catch (error) {
    console.error("ADMIN_NOTIFY_ERROR:", error);
    return { success: false, message: "Failed to fetch analytics" };
  }
}