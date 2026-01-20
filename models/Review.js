import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: [true, "Please provide a description"] 
  },
  rating: { 
    type: Number, 
    default: 5 
  },
  imageUrl: { 
    type: String, 
    required: [true, "Please provide an image URL"] 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;