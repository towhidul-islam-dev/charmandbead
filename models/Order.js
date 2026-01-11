import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    deliveryCharge: { type: Number, default: 0 }, // 💡 Added this field
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    shippingAddress: Object,
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
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

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);