import mongoose from "mongoose";

const InventoryLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  variantKey: String, // e.g., "Red-XL"
  change: Number,     // e.g., +50 or -12
  reason: { type: String, enum: ['Restock', 'Sale', 'Adjustment', 'Return'], default: 'Restock' },
  performedBy: String, // Admin email or "System/Sale"
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.InventoryLog || mongoose.model("InventoryLog", InventoryLogSchema);