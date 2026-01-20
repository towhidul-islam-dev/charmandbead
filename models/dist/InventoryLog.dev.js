"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var InventoryLogSchema = new _mongoose["default"].Schema({
  productId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  variantKey: String,
  // e.g., "Red-XL"
  change: Number,
  // e.g., +50 or -12
  reason: {
    type: String,
    "enum": ['Restock', 'Sale', 'Adjustment', 'Return'],
    "default": 'Restock'
  },
  performedBy: String,
  // Admin email or "System/Sale"
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

var _default = _mongoose["default"].models.InventoryLog || _mongoose["default"].model("InventoryLog", InventoryLogSchema);

exports["default"] = _default;