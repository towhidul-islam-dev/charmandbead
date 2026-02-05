"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var NotificationSchema = new _mongoose["default"].Schema({
  // 🟢 If null or "GLOBAL", everyone sees it. Otherwise, it's tied to a User ID.
  recipientId: {
    type: String,
    "default": "GLOBAL",
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    "enum": ['payment', 'arrival', 'order', 'info', 'error'],
    "default": 'info'
  },
  isRead: {
    type: Boolean,
    "default": false
  },
  link: {
    type: String
  },
  // Optional: Link to the order or product page
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

var _default = _mongoose["default"].models.Notification || _mongoose["default"].model("Notification", NotificationSchema);

exports["default"] = _default;