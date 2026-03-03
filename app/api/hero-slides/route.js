import dbConnect from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get("admin") === "true";

    // Matches active slides OR slides created before we added the isActive field
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
    
    // Validation
    if (!body.image || !body.title) {
      return NextResponse.json({ error: "Image and Title are required" }, { status: 400 });
    }

    // Creating the document
    const slide = await HeroSlide.create({
      title: body.title,
      link: body.link,
      image: body.image,
      priority: Number(body.priority) || 0,
      format: body.format || "image",
      isActive: true 
    });

    console.log("✅ SAVED SLIDE TO DB:", slide); // Check your terminal for this!

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error("❌ MONGODB SAVE ERROR:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to save to DB" 
    }, { status: 500 });
  }
}