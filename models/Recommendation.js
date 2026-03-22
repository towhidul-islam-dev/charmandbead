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
    // Standardized ID for visual grouping (e.g., "FLORAL-VASE")
    visualFingerprint: { 
      type: String, 
      trim: true 
    },
  },
  // 🧬 COUNTERS
  votes: { 
    type: Number, 
    default: 1 // Renamed to "Marks" in UI
  },
  skips: { 
    type: Number, 
    default: 0 
  },
  // 🔒 IDENTITY TRACKING
  votedBy: {
    type: [String], // Stores IPs or UserIDs to prevent duplicate interaction
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

// INDEXES
// Added index for skips to identify low-performing trends for AI cleanup
RecommendationSchema.index({ "aiAnalysis.visualFingerprint": 1 });
RecommendationSchema.index({ votes: -1, status: 1 });
RecommendationSchema.index({ skips: -1 }); 
RecommendationSchema.index({ userName: 1 });

export default mongoose.models.Recommendation ||
  mongoose.model("Recommendation", RecommendationSchema);