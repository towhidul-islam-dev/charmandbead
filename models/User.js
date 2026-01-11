import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true, // 💡 Added: Ensures email is always stored in lowercase
    trim: true,      // 💡 Added: Removes accidental spaces
    match: [/.+@.+\..+/, 'Must use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // 💡 Correct: This hides password from normal API responses
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  addresses: [{
    label: String,
    fullName: String,
    phone: String,
    street: String,
    city: String,
    isDefault: { type: Boolean, default: false }
  }],
}, { timestamps: true });

// PRE-SAVE HOOK: Hash the password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
    // ⚠️ IMPORTANT: This method only works if 'password' was included in the query
    if (!this.password) {
        throw new Error("Password field not selected in query");
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);