"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var CartItemSchema = new _mongoose["default"].Schema({
  productId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  variantId: {
    type: String,
    "default": null
  },
  uniqueKey: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  variantName: {
    type: String,
    "default": ""
  },
  basePrice: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  pricingTiers: {
    type: Array,
    "default": []
  },
  imageUrl: {
    type: String,
    "default": ""
  },
  size: {
    type: String,
    "default": "N/A"
  },
  color: {
    type: String,
    "default": "Default"
  },
  minOrderQuantity: {
    type: Number,
    "default": 1
  },
  stock: {
    type: Number,
    "default": 0
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"]
  },
  note: {
    type: String,
    "default": "",
    trim: true
  },
  sku: {
    type: String,
    "default": "N/A"
  }
}, {
  _id: false
});
var CartSchema = new _mongoose["default"].Schema({
  userId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [CartItemSchema]
}, {
  timestamps: true
});

var _default = _mongoose["default"].models.Cart || _mongoose["default"].model("Cart", CartSchema);

exports["default"] = _default;