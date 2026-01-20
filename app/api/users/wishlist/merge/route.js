import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    // 1. Safety Check
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productIds } = await req.json();

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ message: "Invalid product data" }, { status: 400 });
    }

    // 2. Efficiently Merge
    // $addToSet ensures no duplicates are created
    // $each allows us to push an entire array of IDs at once
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $addToSet: { 
          wishlist: { $each: productIds } 
        } 
      },
      { new: true }
    );

    return NextResponse.json({ 
      message: "Wishlist merged successfully", 
      count: updatedUser.wishlist.length 
    });

  } catch (error) {
    console.error("Merge Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}