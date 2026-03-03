import dbConnect from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";
import { NextResponse } from "next/server";

// FETCH SLIDES (Used by the Carousel)
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const isAdmin = searchParams.get("admin") === "true";

  // If it's the homepage, only fetch { isActive: true }
  const query = isAdmin ? {} : { isActive: true };
  
  const slides = await HeroSlide.find(query).sort({ priority: -1 });
  return NextResponse.json(slides);
}
// SAVE NEW SLIDE (Used by the Admin Form)
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const slide = await HeroSlide.create(body);
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save slide" }, { status: 500 });
  }
}