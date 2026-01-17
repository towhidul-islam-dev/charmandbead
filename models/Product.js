// models/Product.js
import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  size: String,
  color: String,
  price: Number,
  stock: Number,
  imageUrl: String,
  minOrderQuantity: { type: Number, default: 1 }, // Default is 1 (Standard behavior)
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: String,
  price: Number,
  stock: Number,
  minOrderQuantity: { type: Number, default: 1 }, // Default for non-variant products
  isNewArrival: { type: Boolean, default: false },
  hasVariants: { type: Boolean, default: false },
  variants: [VariantSchema],
  isArchived: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);