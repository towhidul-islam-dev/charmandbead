import mongoose from 'mongoose';

// FAQ Schema: Remains the same
const FAQSchema = new mongoose.Schema({
  question_en: { type: String, required: true },
  question_bn: { type: String, required: true },
  answer_en: { type: String, required: true },
  answer_bn: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Policy & Terms Schema: UPDATED (FAQ-style logic)
const PolicySchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
  },
  content_en: { 
    type: String, 
    default: "" // 🟢 Changed from 'required: true' to 'default: ""'
  },
  content_bn: { 
    type: String, 
    default: "" // 🟢 This allows you to save even if a tab is empty
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
export const Policy = mongoose.models.Policy || mongoose.model('Policy', PolicySchema);