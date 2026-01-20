import mongoose from "mongoose";

const NotifyMeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantKey: { type: String }, // e.g., "Red-XL"
  status: { type: String, enum: ["Pending", "Notified"], default: "Pending" },
}, { timestamps: true });

export default mongoose.models.NotifyMe || mongoose.model("NotifyMe", NotifyMeSchema);