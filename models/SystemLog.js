import mongoose from "mongoose";

const SystemLogSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // e.g., "last_smart_merge"
  value: String,                       // The ISO timestamp
  details: String                      // e.g., "Merged 5 items"
});

export default mongoose.models.SystemLog || mongoose.model("SystemLog", SystemLogSchema);