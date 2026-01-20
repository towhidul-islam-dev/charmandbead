"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ReviewSchema = new _mongoose["default"].Schema({
  description: {
    type: String,
    required: [true, "Please provide a description"]
  },
  rating: {
    type: Number,
    "default": 5
  },
  imageUrl: {
    type: String,
    required: [true, "Please provide an image URL"]
  },
  isFeatured: {
    type: Boolean,
    "default": false
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

var Review = _mongoose["default"].models.Review || _mongoose["default"].model('Review', ReviewSchema);

var _default = Review;
exports["default"] = _default;