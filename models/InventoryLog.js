import mongoose from "mongoose";

// We define the schema without the 'enum' property
const InventoryLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  variantKey: String, 
  sku: String,        
  change: Number,     
  reason: { 
    type: String, 
    default: 'Restock' 
  },
  performedBy: String, 
  createdAt: { type: Date, default: Date.now }
});

// 🟢 IMPORTANT: This logic clears the old model from memory if it exists, 
// then re-compiles it with the new, flexible schema.
if (mongoose.models.InventoryLog) {
  delete mongoose.models.InventoryLog;
}

export default mongoose.model("InventoryLog", InventoryLogSchema);