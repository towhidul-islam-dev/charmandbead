import dbConnect from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";

    // 🟢 THE FIX: 
    // For non-admins, we find slides where isActive is true 
    // OR where isActive does not exist (for old data)
    const query = isAdmin 
      ? {} 
      : { $or: [{ isActive: true }, { isActive: { $exists: false } }] };

    const slides = await HeroSlide.find(query).sort({ priority: -1 });
    
    return NextResponse.json(slides);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Explicitly check for required fields to prevent empty saves
    if (!body.image || !body.title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slide = await HeroSlide.create({
      title: body.title,
      link: body.link,
      image: body.image,
      priority: Number(body.priority) || 0,
      format: body.format || "image",
      isActive: true // Force new banners to be active
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error("SAVE ERROR:", error);
    return NextResponse.json({ error: "Failed to save to DB" }, { status: 500 });
  }
}