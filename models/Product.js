import mongoose from "mongoose";

// Pricing Tier Sub-schema
const PricingTierSchema = new mongoose.Schema({
  minQuantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
});

const VariantSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  sku: { type: String, sparse: true },
  size: String,
  color: String,
  price: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  isOnSale: { type: Boolean, default: false },
  stock: { type: Number, default: 0, min: 0 },
  imageUrl: String,
  minOrderQuantity: { type: Number, default: 1 },
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
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
    categoryName: { type: String, trim: true, default: "Uncategorized" },
    subCategoryName: { type: String, trim: true, default: "" },

    sku: { type: String, sparse: true },
    imageUrl: String,
    gallery: { type: [String], default: [] },

    // Base Product Fields
    price: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    isOnSale: { type: Boolean, default: false },

    // Wholesale Tiers
    pricingTiers: { type: [PricingTierSchema], default: [] },

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
  }
);

const generateSKU = (name, color, size, index = 0) => {
  const p = name.substring(0, 3).toUpperCase().replace(/\s/g, "");
  const c = (color || "XX").substring(0, 2).toUpperCase().replace(/\s/g, "");
  const s = (size || "NA").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `${p}-${c}-${s}-${index + 1}`;
};

// PRE-SAVE Logic
ProductSchema.pre("save", async function () {
  if (this.hasVariants && this.variants?.length > 0) {
    this.variants.forEach((v, idx) => {
      if (!v.sku) v.sku = generateSKU(this.name, v.color, v.size, idx);
    });

    this.stock = this.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

    const validPrices = this.variants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
    const activePrices = this.variants
      .map((v) => (v.isOnSale && v.discountPrice > 0 ? Number(v.discountPrice) : Number(v.price) || 0))
      .filter((p) => p > 0);

    if (validPrices.length > 0) {
      this.price = Math.min(...validPrices);
    }
    if (activePrices.length > 0) {
      this.discountPrice = Math.min(...activePrices);
    }

    this.isOnSale = this.variants.some((v) => v.isOnSale);
    this.minOrderQuantity = this.variants[0]?.minOrderQuantity || 1;
  } else {
    if (!this.sku) this.sku = generateSKU(this.name, "ST", "ND");

    if (this.pricingTiers?.length > 0) {
      const minTierQty = Math.min(...this.pricingTiers.map((t) => Number(t.minQuantity) || 1));
      if (minTierQty < this.minOrderQuantity) this.minOrderQuantity = minTierQty;
    }
  }
});

// PRE-UPDATE Logic
ProductSchema.pre(["findOneAndUpdate", "updateOne"], function () {
  const update = this.getUpdate();
  const data = update.$set || update;

  if (data.variants && data.variants.length > 0) {
    data.stock = data.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

    const originalPrices = data.variants.map((v) => Number(v.price)).filter((p) => p > 0);
    if (originalPrices.length > 0) data.price = Math.min(...originalPrices);

    const salePrices = data.variants
      .map((v) => (v.isOnSale && v.discountPrice > 0 ? Number(v.discountPrice) : Number(v.price)))
      .filter((p) => p > 0);

    if (salePrices.length > 0) {
      data.discountPrice = Math.min(...salePrices);
      data.isOnSale = data.variants.some((v) => v.isOnSale);
    }

    data.minOrderQuantity = data.variants[0]?.minOrderQuantity || 1;
  } else if (data.pricingTiers && data.pricingTiers.length > 0) {
    const minTierQty = Math.min(...data.pricingTiers.map((t) => Number(t.minQuantity) || 1));
    if (data.minOrderQuantity > minTierQty) {
      data.minOrderQuantity = minTierQty;
    }
  }
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);