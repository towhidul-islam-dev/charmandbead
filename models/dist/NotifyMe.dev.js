"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var NotifyMeSchema = new _mongoose["default"].Schema({
  user: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  email: {
    type: String,
    required: true
  },
  productId: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  variantKey: {
    type: String
  },
  // e.g., "Red-XL"
  status: {
    type: String,
    "enum": ["Pending", "Notified"],
    "default": "Pending"
  }
}, {
  timestamps: true
});

var _default = _mongoose["default"].models.NotifyMe || _mongoose["default"].model("NotifyMe", NotifyMeSchema);

exports["default"] = _default;