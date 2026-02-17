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

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    // 🟢 IDs for Relationships
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
      default: null,
    },
    // 🟢 NAMES for UI (So ProductCard can show them easily)
    categoryName: { type: String, trim: true, default: "Uncategorized" },
    subCategoryName: { type: String, trim: true, default: "" },

    sku: { type: String, sparse: true },
    imageUrl: String,
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    minOrderQuantity: { type: Number, default: 1 },
    isNewArrival: { type: Boolean, default: false },
    hasVariants: { type: Boolean, default: false },
    variants: [VariantSchema],
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const generateSKU = (name, color, size) => {
  const p = name.substring(0, 3).toUpperCase().replace(/\s/g, "");
  const c = (color || "XX").substring(0, 2).toUpperCase().replace(/\s/g, "");
  const s = (size || "NA").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `${p}-${c}-${s}-${Math.floor(100 + Math.random() * 900)}`;
};

// 🟢 PRE-SAVE (For New Products)
ProductSchema.pre("save", async function () {
  if (this.hasVariants && this.variants?.length > 0) {
    this.variants.forEach((v) => {
      if (!v.sku) v.sku = generateSKU(this.name, v.color, v.size);
    });
    this.stock = this.variants.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0,
    );
    this.price = this.price || Math.min(...this.variants.map((v) => v.price));
    this.minOrderQuantity = this.variants[0].minOrderQuantity || 1;
  } else if (!this.sku) {
    this.sku = generateSKU(this.name, "ST", "ND");
  }
});

// 🟢 PRE-UPDATE (For findByIdAndUpdate)
ProductSchema.pre(["findOneAndUpdate", "updateOne"], function () {
  const update = this.getUpdate();
  const data = update.$set || update;

  if (data.variants && data.variants.length > 0) {
    // Sync Stock
    data.stock = data.variants.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0,
    );

    // Sync Price (Lowest)
    const prices = data.variants
      .map((v) => Number(v.price))
      .filter((p) => p > 0);
    if (prices.length > 0) data.price = Math.min(...prices);

    // Sync MOQ
    data.minOrderQuantity = data.variants[0].minOrderQuantity || 1;
  }
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
