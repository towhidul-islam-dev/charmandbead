"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// We define the schema without the 'enum' property
var InventoryLogSchema = new _mongoose["default"].Schema({
  productId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  variantKey: String,
  sku: String,
  change: Number,
  reason: {
    type: String,
    "default": 'Restock'
  },
  performedBy: String,
  createdAt: {
    type: Date,
    "default": Date.now
  }
}); // 🟢 IMPORTANT: This logic clears the old model from memory if it exists, 
// then re-compiles it with the new, flexible schema.

if (_mongoose["default"].models.InventoryLog) {
  delete _mongoose["default"].models.InventoryLog;
}

var _default = _mongoose["default"].model("InventoryLog", InventoryLogSchema);

exports["default"] = _default;