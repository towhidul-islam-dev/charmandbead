import mongoose from "mongoose";

const SliderSchema = new mongoose.Schema(
  {
    badge: { type: String, default: "" },
    enTitle: { type: String, required: true },
    bnTitle: { type: String, required: true },
    enSubtitle: { type: String, required: true },
    bnSubtitle: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Slider || mongoose.model("Slider", SliderSchema);