import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ image: null });

    await dbConnect();
    const user = await User.findOne({ email }).select("image");
    
    return NextResponse.json({ image: user?.image || null });
}