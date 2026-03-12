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
    // NEW: Standardized ID for visual grouping (e.g., "FLORAL-VASE")
    visualFingerprint: {
      type: String,
      trim: true
    }
  },
  votes: {
    type: Number,
    "default": 1
  },
  votedBy: {
    type: [String],
    "default": []
  },
  status: {
    type: String,
    "enum": ["Pending", "Sourcing", "Coming Soon", "Stocked"],
    "default": "Pending"
  }
}, {
  timestamps: true
}); // Added index for visualFingerprint to prevent slow queries as your Lab grows

RecommendationSchema.index({
  "aiAnalysis.visualFingerprint": 1
});
RecommendationSchema.index({
  votes: -1,
  status: 1
});
RecommendationSchema.index({
  userName: 1
});

var _default = _mongoose["default"].models.Recommendation || _mongoose["default"].model("Recommendation", RecommendationSchema);

exports["default"] = _default;