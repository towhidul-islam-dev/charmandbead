"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// models/Product.js
var VariantSchema = new _mongoose["default"].Schema({
  size: String,
  color: String,
  price: Number,
  stock: Number,
  imageUrl: String,
  minOrderQuantity: {
    type: Number,
    "default": 1
  } // Default is 1 (Standard behavior)

});
var ProductSchema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  imageUrl: String,
  price: Number,
  stock: Number,
  minOrderQuantity: {
    type: Number,
    "default": 1
  },
  // Default for non-variant products
  isNewArrival: {
    type: Boolean,
    "default": false
  },
  hasVariants: {
    type: Boolean,
    "default": false
  },
  variants: [VariantSchema]
}, {
  timestamps: true
});

var _default = _mongoose["default"].models.Product || _mongoose["default"].model("Product", ProductSchema);

exports["default"] = _default;