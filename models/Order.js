import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        variant: {
          name: String,
          image: String,
          size: String,
          variantId: mongoose.Schema.Types.ObjectId, 
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        sku: String, 
      },
    ],
    totalAmount: Number,
    deliveryCharge: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    
    // 🟢 Financial Ledger Support
    mobileBankingFee: { type: Number, default: 0 }, // To store gateway processing fees
    
    shippingAddress: Object,
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid",
    },

    // --- 💳 EXTENDED PAYMENT SOURCE TRACKING ---
    paymentMethod: { 
      type: String, 
      enum: [
        "bKash", "Nagad", "Rocket", "Upay", 
        "Card", "Bank Transfer", "COD", "Other"
      ],
      default: "COD",
      index: true 
    },
    
    // The Unique Transaction ID from Gateway
    tran_id: { type: String, unique: true, sparse: true },

    paymentDetails: {
      source: String,           // Phone number (MFS) or Account Number (Bank)
      cardType: String,         // Visa, Mastercard, AMEX (if Card)
      cardIssuer: String,       // City Bank, EBL, etc.
      bankApp: String,          // City Touch, EBL Skybank, etc.
      gatewayResponse: Object,  // Raw JSON from SSLCommerz/AmarPay
    },

    trackingNumber: { type: String, default: "" },

    notifications: [
      {
        message: String,
        status: String,
        createdAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
      },
    ],
    isStockReduced: { type: Boolean, default: false, index: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
);

// --- SEARCH INDEXES ---
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({
  "shippingAddress.name": "text",
  "shippingAddress.phone": "text",
  "tran_id": "text",
  "paymentDetails.source": "text"
});

// --- 🛡️ NEXT.JS 16 SERIALIZATION FIX ---
OrderSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    if (ret.user) ret.user = ret.user.toString();
    
    if (ret.items) {
      ret.items = ret.items.map(item => ({
        ...item,
        _id: item._id?.toString(),
        product: item.product?.toString(),
        variant: item.variant ? {
          ...item.variant,
          variantId: item.variant.variantId?.toString()
        } : item.variant
      }));
    }
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);