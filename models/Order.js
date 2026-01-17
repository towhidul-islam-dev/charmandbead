import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // 1. Indexing User: Critical for 'getUserOrders' and VIP syncing
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        variant: {
          name: String,
          image: String,
          size: String,
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    deliveryCharge: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    shippingAddress: Object,
    // 2. Indexing Status: Critical for the Admin Dashboard filters
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true
    },
    paymentStatus: { 
      type: String, 
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid" 
    },
    tran_id: { type: String, unique: true, sparse: true },
    trackingNumber: { type: String, default: "" },
    
    notifications: [
      {
        message: String,
        status: String,
        createdAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
      }
    ],
  },
  { timestamps: true }
);

// 3. Compound Index: Accelerates the "Sort by Newest" logic used in your getAllOrders
OrderSchema.index({ createdAt: -1 });

// 4. Text Index: If you want to make search even faster for names/phones (Optional but recommended)
OrderSchema.index({ "shippingAddress.name": "text", "shippingAddress.phone": "text" });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);