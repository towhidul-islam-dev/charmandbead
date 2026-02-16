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
  
  // 🟢 IDs for Dynamic Filtering & Relational Integrity
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

// Helper for SKU generation
const generateSKU = (name, color, size) => {
  const p = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
  const c = (color || "XX").substring(0, 2).toUpperCase().replace(/\s/g, '');
  const s = (size || "NA").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `${p}-${c}-${s}-${Math.floor(100 + Math.random() * 900)}`;
};

// 🟢 PRE-SAVE MIDDLEWARE
// Handles new product creation
ProductSchema.pre('save', async function() {
  if (this.hasVariants && this.variants?.length > 0) {
    this.variants.forEach(v => {
      if (!v.sku) v.sku = generateSKU(this.name, v.color, v.size);
    });
    // Sync total stock from variants
    this.stock = this.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    // Inherit price from first variant if root price is 0
    if (this.price === 0) this.price = this.variants[0].price;
    // Inherit MOQ from first variant
    this.minOrderQuantity = this.variants[0].minOrderQuantity || 1;
  } else if (!this.sku) {
    this.sku = generateSKU(this.name, "ST", "ND");
  }
});

// 🟢 PRE-UPDATE MIDDLEWARE
// Ensures that stock/pricing calculations happen during findByIdAndUpdate
ProductSchema.pre(['findOneAndUpdate', 'updateOne'], async function() {
  const update = this.getUpdate();
  const setUpdate = update.$set || update; // Handles both direct updates and $set usage

  if (setUpdate.variants && setUpdate.variants.length > 0) {
    const variants = setUpdate.variants;
    
    // 1. Calculate Total Stock
    setUpdate.stock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    
    // 2. Set Price to minimum variant price if not explicitly provided
    if (!setUpdate.price) {
        const prices = variants.map(v => Number(v.price)).filter(p => p > 0);
        setUpdate.price = prices.length > 0 ? Math.min(...prices) : 0;
    }

    // 3. Sync MOQ to root for catalog display
    setUpdate.minOrderQuantity = variants[0].minOrderQuantity || 1;
  }
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);