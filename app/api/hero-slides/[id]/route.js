import dbConnect from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// 🟢 Configure Cloudinary for Server-Side Deletion
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- TOGGLE ACTIVE STATUS (PATCH) ---
export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { isActive } = await req.json();

    const updatedSlide = await HeroSlide.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedSlide) return NextResponse.json({ error: "Slide not found" }, { status: 404 });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

// --- FULL DELETE (DELETE) ---
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    // 1. Find the slide record to get the image URL
    const slide = await HeroSlide.findById(id);
    if (!slide) return NextResponse.json({ error: "Slide not found" }, { status: 404 });

    // 2. Extract the Public ID for Cloudinary
    // This logic takes the URL and finds the folder/filename needed for deletion
    try {
      const urlParts = slide.image.split("/");
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const [publicIdWithoutExtension] = fileNameWithExtension.split(".");
      
      // If you are using folders in Cloudinary (recommended), use this:
      const folder = urlParts[urlParts.length - 2];
      const publicId = `${folder}/${publicIdWithoutExtension}`;

      // Delete from Cloudinary
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudErr) {
      console.error("Cloudinary Deletion Error (File might not exist):", cloudErr);
      // We continue to delete from DB even if Cloudinary file is already gone
    }

    // 3. Delete from MongoDB
    await HeroSlide.findByIdAndDelete(id);

    return NextResponse.json({ message: "Successfully removed from Storage and Database" });
  } catch (error) {
    console.error("Critical Delete Error:", error);
    return NextResponse.json({ error: "Server error during deletion" }, { status: 500 });
  }
}