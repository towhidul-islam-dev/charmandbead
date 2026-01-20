import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // Aggregation pipeline to find most wishlisted items
    const trendingData = await User.aggregate([
      { $unwind: "$wishlist" }, // Flatten the wishlist arrays from all users
      { $group: { _id: "$wishlist", count: { $sum: 1 } } }, // Count occurrences of each ID
      { $sort: { count: -1 } }, // Sort by most popular
      { $limit: 4 } // Get top 4
    ]);

    // Extract IDs and fetch full product details
    const productIds = trendingData.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}