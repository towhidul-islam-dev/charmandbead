import mongoose from "mongoose";

const HeroSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  link: { type: String, default: "/products" },
  title: { type: String, required: true },
  // 🟢 Added 'svg' and 'pdf' to support your new carousel logic
  format: { 
    type: String, 
    enum: ['image', 'pdf', 'svg'], 
    default: 'image' 
  }, 
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// 🟢 THE FIX: Explicitly name the collection "heroslides"
// This prevents Mongoose from creating a different collection by mistake.
export default mongoose.models.HeroSlide || 
               mongoose.model("HeroSlide", HeroSlideSchema, "heroslides");