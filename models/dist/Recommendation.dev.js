"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var RecommendationSchema = new _mongoose["default"].Schema({
  imageUrl: {
    type: String,
    required: [true, "Image URL is required"]
  },
  userName: {
    type: String,
    "default": "Anonymous"
  },
  notes: [{
    body: {
      type: String,
      trim: true
    },
    userName: {
      type: String,
      "default": "Anonymous"
    },
    createdAt: {
      type: Date,
      "default": Date.now
    }
  }],
  aiAnalysis: {
    category: {
      type: String,
      "default": "Uncategorized"
    },
    style: {
      type: String,
      "default": "Trend"
    },
    tags: [String],
    // Standardized ID for visual grouping (e.g., "FLORAL-VASE")
    visualFingerprint: {
      type: String,
      trim: true
    }
  },
  // 🧬 COUNTERS
  votes: {
    type: Number,
    "default": 1 // Renamed to "Marks" in UI

  },
  skips: {
    type: Number,
    "default": 0
  },
  // 🔒 IDENTITY TRACKING
  votedBy: {
    type: [String],
    // Stores IPs or UserIDs to prevent duplicate interaction
    "default": []
  },
  status: {
    type: String,
    "enum": ["Pending", "Sourcing", "Coming Soon", "Stocked"],
    "default": "Pending"
  }
}, {
  timestamps: true
}); // INDEXES
// Added index for skips to identify low-performing trends for AI cleanup

RecommendationSchema.index({
  "aiAnalysis.visualFingerprint": 1
});
RecommendationSchema.index({
  votes: -1,
  status: 1
});
RecommendationSchema.index({
  skips: -1
});
RecommendationSchema.index({
  userName: 1
});

var _default = _mongoose["default"].models.Recommendation || _mongoose["default"].model("Recommendation", RecommendationSchema);

exports["default"] = _default;