import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  pendingBalance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

export const Wallet = mongoose.model('Wallet', walletSchema);

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['PAYMENT', 'COMMISSION', 'REFUND', 'PAYOUT', 'ADJUSTMENT'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED', 'ON_HOLD'], required: true },
  referenceId: { type: String }, // orderId, payoutId etc.
  description: { type: String },
  holdingReleaseDate: { type: Date }, // For 24-hour holding period
  createdAt: { type: Date, default: Date.now }
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
