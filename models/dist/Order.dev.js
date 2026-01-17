"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var OrderSchema = new _mongoose["default"].Schema({
  // 1. Indexing User: Critical for 'getUserOrders' and VIP syncing
  user: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
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
  paidAmount: {
    type: Number,
    "default": 0
  },
  dueAmount: {
    type: Number,
    "default": 0
  },
  shippingAddress: Object,
  // 2. Indexing Status: Critical for the Admin Dashboard filters
  status: {
    type: String,
    "enum": ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    "default": "Pending",
    index: true
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
}); // 3. Compound Index: Accelerates the "Sort by Newest" logic used in your getAllOrders

OrderSchema.index({
  createdAt: -1
}); // 4. Text Index: If you want to make search even faster for names/phones (Optional but recommended)

OrderSchema.index({
  "shippingAddress.name": "text",
  "shippingAddress.phone": "text"
});

var _default = _mongoose["default"].models.Order || _mongoose["default"].model("Order", OrderSchema);

exports["default"] = _default;