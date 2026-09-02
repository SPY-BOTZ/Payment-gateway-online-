import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  image: { type: String },
  category: { type: String },
  telegramChannelId: { type: String },
  membershipDurationDays: { type: Number },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  stock: { type: Number },
  commissionPercentage: { type: Number, default: 0 },
  terms: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Product = mongoose.model('Product', productSchema);
