"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var SurpriseSchema = new _mongoose["default"].Schema({
  title: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true
  },
  description: String,
  discountType: {
    type: String,
    "enum": ["percentage", "fixed", "shipping"],
    "default": "percentage"
  },
  value: {
    type: Number,
    required: true
  },
  // e.g., 10 for 10%
  probability: {
    type: Number,
    "default": 10,
    min: 0,
    max: 100
  },
  // % chance to win
  minPurchase: {
    type: Number,
    "default": 0
  },
  isActive: {
    type: Boolean,
    "default": false
  },
  usageCount: {
    type: Number,
    "default": 0
  }
}, {
  timestamps: true
});

var _default = _mongoose["default"].models.Surprise || _mongoose["default"].model("Surprise", SurpriseSchema);

exports["default"] = _default;