import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order"; // Ensure you have an Order model
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const orders = await Order.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}