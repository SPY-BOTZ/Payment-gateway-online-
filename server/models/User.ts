import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telegramId: { type: String },
  telegramChatId: { type: String },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT'], default: 'USER' },
  kycStatus: { type: String, enum: ['NOT_STARTED', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'], default: 'NOT_STARTED' },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subscriptionExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
