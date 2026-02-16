import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Category name is required"],
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  image: { type: String } // Added this so your Category Manager can display icons/images
}, { timestamps: true });

// 🟢 Pre-save middleware to auto-generate slug from name
CategorySchema.pre('validate', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});
export default mongoose.models.Category || mongoose.model("Category", CategorySchema);