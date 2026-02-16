import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  sku: { type: String, sparse: true },
  size: String,
  color: String,
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 }, 
  imageUrl: String,
  minOrderQuantity: { type: Number, default: 1 },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  // 🟢 STEP 1 CHANGE: Store IDs instead of Names for Dynamic Filtering
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true 
  },
  subCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    index: true,
    default: null 
  },

  sku: { type: String, sparse: true }, 
  imageUrl: String,
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0, min: 0 }, 
  minOrderQuantity: { type: Number, default: 1 }, // Maintain MOQ functionality
  isNewArrival: { type: Boolean, default: false }, // Maintain New Arrival status
  hasVariants: { type: Boolean, default: false },
  variants: [VariantSchema],
  isArchived: { type: Boolean, default: false },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const generateSKU = (name, color, size) => {
  const p = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const c = (color || "XX").substring(0, 2).toUpperCase().replace(/\s/g, '');
  const s = (size || "NA").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `${p}-${c}-${s}-${Math.floor(100 + Math.random() * 900)}`;
};

// 🟢 PRE-SAVE MIDDLEWARE
ProductSchema.pre('save', async function() {
  if (this.hasVariants && this.variants?.length > 0) {
    this.variants.forEach(v => {
      if (!v.sku) v.sku = generateSKU(this.name, v.color, v.size);
    });
    this.stock = this.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  } else if (!this.sku) {
    this.sku = generateSKU(this.name, "ST", "ND");
  }
});

// 🟢 PRE-UPDATE MIDDLEWARE
ProductSchema.pre(['findOneAndUpdate', 'updateOne'], async function() {
  const update = this.getUpdate();
  if (update.variants || (update.$set && update.$set.variants)) {
    const variants = update.variants || update.$set.variants;
    const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    if (update.$set) {
      update.$set.stock = totalStock;
    } else {
      update.stock = totalStock;
    }
  }
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);