"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var HeroSlideSchema = new _mongoose["default"].Schema({
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    "default": "/products"
  },
  title: {
    type: String,
    required: true
  },
  // 🟢 Added 'svg' and 'pdf' to support your new carousel logic
  format: {
    type: String,
    "enum": ['image', 'pdf', 'svg'],
    "default": 'image'
  },
  priority: {
    type: Number,
    "default": 0
  },
  isActive: {
    type: Boolean,
    "default": true
  }
}, {
  timestamps: true
}); // 🟢 THE FIX: Explicitly name the collection "heroslides"
// This prevents Mongoose from creating a different collection by mistake.

var _default = _mongoose["default"].models.HeroSlide || _mongoose["default"].model("HeroSlide", HeroSlideSchema, "heroslides");

exports["default"] = _default;