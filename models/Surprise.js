import mongoose from "mongoose";

const SurpriseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  description: String,
  discountType: { 
    type: String, 
    enum: ["percentage", "fixed", "shipping"], 
    default: "percentage" 
  },
  value: { type: Number, required: true }, // e.g., 10 for 10%
  probability: { type: Number, default: 10, min: 0, max: 100 }, // % chance to win
  minPurchase: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Surprise || mongoose.model("Surprise", SurpriseSchema);