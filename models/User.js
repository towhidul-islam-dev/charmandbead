import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // 🟢 PASSWORD RESET FIELDS
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    resetTokenSentAt: { type: Date, default: null },
    // 🟢 2FA / OTP FIELDS
    otpCode: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    addresses: [
      {
        label: String,
        fullName: String,
        phone: String,
        street: String,
        city: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    isVIP: { type: Boolean, default: false },
    vipDiscount: { type: Number, default: 5 },
  },
  { timestamps: true },
);

// Pre-save hook (already correct in your code)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
