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
      size: String,
      // 🟢 Ensure variantId is stored to track stock changes accurately
      variantId: _mongoose["default"].Schema.Types.ObjectId
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    sku: String // 🟢 Added for better logging

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
  }],
  // 🟢 Critical Lock: Indexed for high-performance idempotency checks
  isStockReduced: {
    type: Boolean,
    "default": false,
    index: true
  }
}, {
  timestamps: true
});
OrderSchema.index({
  createdAt: -1
});
OrderSchema.index({
  "shippingAddress.name": "text",
  "shippingAddress.phone": "text"
});

var _default = _mongoose["default"].models.Order || _mongoose["default"].model("Order", OrderSchema);

exports["default"] = _default;