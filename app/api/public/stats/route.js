import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/db"; // Adjust this based on your Prisma/DB setup
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    // 1. Count completed orders (adjust 'status' string to match your DB)
    const totalOrders = await dbConnect.order.count({
      where: {
        status: "COMPLETED", 
      },
    });

    // 2. Count unique districts/states reached
    // This assumes your Order model has a 'district' or 'city' field
    const districts = await db.order.findMany({
      where: { status: "COMPLETED" },
      select: { district: true },
      distinct: ["district"],
    });

   return NextResponse.json({
  totalOrders: totalOrders || 0,
  activeStates: districts.length || 0,
  establishedYear: 2026 // 👈 Update this value to your new year
}, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch live stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}