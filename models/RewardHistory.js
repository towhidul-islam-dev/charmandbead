import mongoose from 'mongoose';

const RewardHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Optimized for fast lookups
  },
  giftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Surprise' },
  title: String,
  code: String,
  value: Number,
  discountType: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.RewardHistory || mongoose.model('RewardHistory', RewardHistorySchema);