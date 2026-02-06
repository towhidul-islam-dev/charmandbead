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
          // 🟢 Stored as ID but serialized to String for the UI
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
    tran_id: { type: String, unique: true, sparse: true },
    trackingNumber: { type: String, default: "" },

    notifications: [
      {
        message: String,
        status: String,
        createdAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
      },
    ],
    // 🟢 Critical Lock for Stock Idempotency
    isStockReduced: { type: Boolean, default: false, index: true },
  },
  { 
    timestamps: true,
    // Ensure virtuals like 'id' are included when sending to frontend
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
);

// --- SEARCH INDEXES ---
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({
  "shippingAddress.name": "text",
  "shippingAddress.phone": "text",
});

// --- 🛡️ NEXT.JS 16 SERIALIZATION FIX ---
// This automatically converts ObjectIds to Strings whenever the data is sent to a Client Component
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
    // Clean up internal Mongoose versioning
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);