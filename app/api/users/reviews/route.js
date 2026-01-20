import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "You must be logged in" }, { status: 401 });
    }

    const body = await req.json();
    const { description, imageUrl, rating } = body;

    // 💡 We only create fields that exist in your Review Schema
    const newReview = await Review.create({
      description: description, // The comment
      imageUrl: imageUrl,       // The product image URL
      rating: rating,           // Make sure you added this to your models/Review.js
      isFeatured: false,        // Default for admin approval
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Review Save Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}