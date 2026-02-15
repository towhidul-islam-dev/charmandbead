import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  } // Null means it's a top-level category (e.g., "Beads")
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);