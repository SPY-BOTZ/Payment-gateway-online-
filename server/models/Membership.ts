import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

export const Membership = mongoose.model('Membership', membershipSchema);

const telegramInviteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  inviteLink: { type: String, required: true },
  channelId: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'USED', 'EXPIRED', 'REVOKED'], default: 'PENDING' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const TelegramInvite = mongoose.model('TelegramInvite', telegramInviteSchema);
