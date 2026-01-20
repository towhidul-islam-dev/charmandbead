'use server'

import connectDB from "@/lib/mongodb"; 
import Review from "@/models/Review";
import { revalidatePath } from "next/cache";

/**
 * 1. Create a Review
 */
export async function createReview(formData) {
  try {
    await connectDB();
    
    // Support both FormData (from Admin) and Plain Objects (from User Dashboard)
    const isForm = formData instanceof FormData;
    const description = isForm ? formData.get('description') : formData.description;
    const imageUrl = isForm ? formData.get('imageUrl') : formData.imageUrl;
    const rating = isForm ? formData.get('rating') : formData.rating;
    const isFeatured = isForm ? formData.get('isFeatured') === 'true' : formData.isFeatured;

    if (!imageUrl || !description) {
        return { success: false, error: "Image and description are required." };
    }

    const newReview = await Review.create({
      description,
      imageUrl,
      rating: Number(rating) || 5, // Default to 5 if not provided
      isFeatured: isFeatured || false
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/'); 

    return { 
        success: true, 
        message: "Review posted successfully!", 
        review: JSON.parse(JSON.stringify(newReview)) 
    };
  } catch (error) {
    console.error("❌ DB Create Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Get All Reviews
 */
export async function getAllReviews() {
  try {
    await connectDB();
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    return { 
        success: true, 
        reviews: JSON.parse(JSON.stringify(reviews)) 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 3. Delete a Review
 * Explicitly exported to fix build error
 */
export async function deleteReview(id) {
  try {
    await connectDB();
    const result = await Review.findByIdAndDelete(id);
    
    if (!result) return { success: false, error: "Review not found" };

    revalidatePath('/admin/reviews');
    revalidatePath('/'); 
    
    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    return { success: false, error: "Failed to delete review" };
  }
}

/**
 * 4. Update Review
 */
export async function updateReview(id, updateData) {
  try {
    await connectDB();
    await Review.findByIdAndUpdate(id, updateData, { new: true });

    revalidatePath('/');
    revalidatePath('/admin/reviews');

    return { success: true, message: "Review updated successfully" };
  } catch (error) {
    return { success: false, error: "Failed to update review" };
  }
}

/**
 * 5. Get Featured Reviews
 */
export async function getFeaturedReviews() {
  try {
    await connectDB();
    const reviews = await Review.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return { 
        success: true, 
        reviews: JSON.parse(JSON.stringify(reviews)) 
    };
  } catch (error) {
    return { success: false, reviews: [], error: error.message };
  }
}