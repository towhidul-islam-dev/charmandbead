import mongoose from "mongoose";

const HeroSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  link: { type: String, default: "/products" },
  title: { type: String, required: true },
  format: { type: String, enum: ['image', 'pdf', 'svg'], default: 'image' }, // 🟢 NEW
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.HeroSlide || mongoose.model("HeroSlide", HeroSlideSchema);