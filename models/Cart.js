import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: String, default: null },
    uniqueKey: { type: String, required: true },
    name: { type: String, required: true },
    variantName: { type: String, default: "" },
    basePrice: { type: Number, required: true },
    price: { type: Number, required: true },
    pricingTiers: { type: Array, default: [] },
    imageUrl: { type: String, default: "" },
    size: { type: String, default: "N/A" },
    color: { type: String, default: "Default" },
    minOrderQuantity: { type: Number, default: 1 },
    stock: { type: Number, default: 0 },
    quantity: { 
      type: Number, 
      required: true, 
      min: [1, "Quantity cannot be less than 1"] 
    },
    sku: { type: String, default: "N/A" },
  },
  { _id: false } // Prevents Mongoose from generating redundant subdocument IDs
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);