"use server";

import dbConnect from "@/lib/mongodb";
import Slider from "@/models/Slider";
import { revalidatePath } from "next/cache";

// Fetch all slides for the frontend component
export async function getSlides() {
  try {
    await dbConnect();
    const slides = await Slider.find({ isActive: { $ne: false } }).sort({ order: 1 });
    return { success: true, slides: JSON.parse(JSON.stringify(slides)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 🟢 Fixed: Changed signature from (prevState, formData) to (formData)
export async function createSlide(formData) {
  try {
    await dbConnect();
    
    const enTitle = formData.get("enTitle");
    const bnTitle = formData.get("bnTitle");
    const enSubtitle = formData.get("enSubtitle");
    const bnSubtitle = formData.get("bnSubtitle");
    const badge = formData.get("badge");

    await Slider.create({
      enTitle,
      bnTitle,
      enSubtitle,
      bnSubtitle,
      badge,
      isActive: true,
    });

    // Instantly revalidate both admin and homepage caches
    revalidatePath("/admin/sliders");
    revalidatePath("/");

    return { success: true, message: "Slide created successfully!" };
  } catch (error) {
    console.error("Error saving slide:", error); // 🟢 Added log to catch future issues in terminal
    return { success: false, error: error.message };
  }
}

// Delete a slide from the admin panel
export async function deleteSlide(slideId) {
  try {
    await dbConnect();
    await Slider.findByIdAndDelete(slideId);
    
    revalidatePath("/admin/sliders");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting slide:", error);
    return { success: false, error: error.message };
  }
}
export async function updateSlide(formData) {
  try {
    await dbConnect();
    
    const id = formData.get("id");
    const badge = formData.get("badge");
    const enTitle = formData.get("enTitle");
    const bnTitle = formData.get("bnTitle");
    const enSubtitle = formData.get("enSubtitle");
    const bnSubtitle = formData.get("bnSubtitle");

    await Slide.findByIdAndUpdate(id, {
      badge,
      enTitle,
      bnTitle,
      enSubtitle,
      bnSubtitle,
    });

    revalidatePath("/admin/sliders");
    revalidatePath("/"); // If the slider shows on the public home page
    return { success: true };
  } catch (error) {
    console.error("Failed to update slide:", error);
    return { success: false, error: error.message };
  }
}