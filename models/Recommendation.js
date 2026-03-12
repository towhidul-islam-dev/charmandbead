import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema({
  imageUrl: { 
    type: String, 
    required: [true, "Image URL is required"] 
  },
  userName: { 
    type: String, 
    default: "Anonymous" 
  },
  notes: [
    {
      body: { type: String, trim: true },
      userName: { type: String, default: "Anonymous" },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  aiAnalysis: {
    category: { type: String, default: "Uncategorized" },
    style: { type: String, default: "Trend" },
    tags: [String],
    // NEW: Standardized ID for visual grouping (e.g., "FLORAL-VASE")
    visualFingerprint: { 
      type: String, 
      trim: true 
    },
  },
  votes: { 
    type: Number, 
    default: 1 
  },
  votedBy: {
    type: [String], 
    default: [] 
  },
  status: {
    type: String,
    enum: ["Pending", "Sourcing", "Coming Soon", "Stocked"],
    default: "Pending",
  },
}, { 
  timestamps: true 
});

// Added index for visualFingerprint to prevent slow queries as your Lab grows
RecommendationSchema.index({ "aiAnalysis.visualFingerprint": 1 });
RecommendationSchema.index({ votes: -1, status: 1 });
RecommendationSchema.index({ userName: 1 });

export default mongoose.models.Recommendation ||
  mongoose.model("Recommendation", RecommendationSchema);