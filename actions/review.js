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
    
    const description = formData.get('description');
    const imageUrl = formData.get('imageUrl');
    const isFeatured = formData.get('isFeatured') === 'true';

    await Review.create({
      description,
      imageUrl,
      isFeatured
    });

    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');
    revalidatePath('/'); 

    return { success: true, message: "Review posted successfully!" };
  } catch (error) {
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
 */
export async function deleteReview(id) {
  try {
    await connectDB();
    await Review.findByIdAndDelete(id);
    
    revalidatePath('/admin/reviews');
    revalidatePath('/reviews');
    revalidatePath('/'); 
    
    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    return { success: false, error: "Failed to delete review" };
  }
}

/**
 * 4. Get Featured Reviews (THE MISSING PIECE)
 * This fetches ONLY reviews where isFeatured is true.
 */
export async function getFeaturedReviews() {
  try {
    await connectDB();
    // We only fetch the top 6 featured reviews for the homepage
    const reviews = await Review.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(6).lean();
    return { 
        success: true, 
        reviews: JSON.parse(JSON.stringify(reviews)) 
    };
  } catch (error) {
    return { success: false, reviews: [], error: error.message };
  }
}