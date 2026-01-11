// models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: [true, "Please provide a description"] 
  },
  imageUrl: { 
    type: String, 
    required: [true, "Please provide an image URL"] 
  },
  isFeatured: { type: Boolean, default: false },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// This line is the "Default Export" the error is looking for
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;