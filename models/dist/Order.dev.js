"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var OrderSchema = new _mongoose["default"].Schema({
  user: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    product: {
      type: _mongoose["default"].Schema.Types.ObjectId,
      ref: "Product"
    },
    productName: String,
    variant: {
      name: String,
      image: String,
      size: String
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  deliveryCharge: {
    type: Number,
    "default": 0
  },
  // 💡 Added this field
  paidAmount: {
    type: Number,
    "default": 0
  },
  dueAmount: {
    type: Number,
    "default": 0
  },
  shippingAddress: Object,
  status: {
    type: String,
    "enum": ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    "default": "Pending"
  },
  paymentStatus: {
    type: String,
    "enum": ["Unpaid", "Partially Paid", "Paid"],
    "default": "Unpaid"
  },
  tran_id: {
    type: String,
    unique: true,
    sparse: true
  },
  trackingNumber: {
    type: String,
    "default": ""
  },
  notifications: [{
    message: String,
    status: String,
    createdAt: {
      type: Date,
      "default": Date.now
    },
    isRead: {
      type: Boolean,
      "default": false
    }
  }]
}, {
  timestamps: true
});

var _default = _mongoose["default"].models.Order || _mongoose["default"].model("Order", OrderSchema);

exports["default"] = _default;