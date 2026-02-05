import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  // 🟢 If null or "GLOBAL", everyone sees it. Otherwise, it's tied to a User ID.
  recipientId: { 
    type: String, 
    default: "GLOBAL",
    index: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['payment', 'arrival', 'order', 'info', 'error'], 
    default: 'info' 
  },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // Optional: Link to the order or product page
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);