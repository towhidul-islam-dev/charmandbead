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
          // 🟢 Ensure variantId is stored to track stock changes accurately
          variantId: mongoose.Schema.Types.ObjectId, 
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        sku: String, // 🟢 Added for better logging
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
    // 🟢 Critical Lock: Indexed for high-performance idempotency checks
    isStockReduced: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

OrderSchema.index({ createdAt: -1 });

OrderSchema.index({
  "shippingAddress.name": "text",
  "shippingAddress.phone": "text",
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);