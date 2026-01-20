import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product"; // 👈 CRITICAL: Must be imported to use .populate()
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { NextResponse } from "next/server";

// 1. GET User's Wishlist
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json([], { status: 200 }); // Return empty array instead of 401 for cleaner UI handling
    }

    // Find user and "populate" the wishlist to get full product details
    const user = await User.findOne({ email: session.user.email }).populate("wishlist");
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return the populated products array
    return NextResponse.json(user.wishlist || []);
  } catch (error) {
    console.error("GET Wishlist Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. TOGGLE Item in Wishlist (Add/Remove)
export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if product is already in wishlist
    // Note: Mongoose 'pull' and 'push' handle ObjectId conversion automatically
    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist.pull(productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    return NextResponse.json({ 
      message: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      wishlist: user.wishlist 
    });
  } catch (error) {
    console.error("POST Wishlist Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}