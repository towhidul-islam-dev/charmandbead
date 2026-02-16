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
  image: { 
    type: String,
    default: "" 
  },
  // 🟢 NEW FIELDS ADDED
  isNewArrival: {
    type: Boolean,
    default: false
  },
  moq: {
    type: Number,
    default: 1,
    min: [1, "MOQ cannot be less than 1"]
  }
}, { timestamps: true });

// 🟢 Pre-save middleware to auto-generate slug from name
CategorySchema.pre('validate', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens/spaces
      .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with a single hyphen
      .replace(/^-+|-+$/g, '');  // Trim hyphens from start and end
  }
  next();
});

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);