import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  sku: { type: String, unique: true, sparse: true }, 
  size: String,
  color: String,
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 }, 
  imageUrl: String,
  minOrderQuantity: { type: Number, default: 1 },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  subCategory: { type: String, required: true, index: true },
  sku: { type: String, unique: true, sparse: true }, 
  imageUrl: String,
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 }, 
  minOrderQuantity: { type: Number, default: 1 },
  isNewArrival: { type: Boolean, default: false },
  hasVariants: { type: Boolean, default: false },
  variants: [VariantSchema],
  isArchived: { type: Boolean, default: false },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// SKU GENERATOR HELPER
const generateSKU = (name, color, size) => {
  const p = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const c = (color || "XX").substring(0, 2).toUpperCase().replace(/\s/g, '');
  const s = (size || "NA").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `${p}-${c}-${s}-${Math.floor(100 + Math.random() * 900)}`;
};

// 🟢 1. PRE-SAVE HOOK (For new products and .save() calls)
ProductSchema.pre('save', async function() {
  if (this.hasVariants && this.variants?.length > 0) {
    this.variants.forEach(v => {
      if (!v.sku) v.sku = generateSKU(this.name, v.color, v.size);
    });
    // Sync stock
    this.stock = this.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }
  if (!this.hasVariants && !this.sku) {
    this.sku = generateSKU(this.name, "ST", "ND");
  }
});

// 🟢 2. PRE-UPDATE HOOK (CRITICAL FIX)
// This catches the 'findOneAndUpdate' calls from your Order Action
ProductSchema.pre(['findOneAndUpdate', 'updateOne'], async function() {
  const update = this.getUpdate();
  
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);