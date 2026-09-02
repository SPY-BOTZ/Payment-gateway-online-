import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { dbStore } from "../db/store.js";
import mongoose from "mongoose";

const router = express.Router();
const isMongooseConnected = () => mongoose.connection.readyState === 1;

router.get("/wallet", requireAuth, async (req, res) => {
  res.json({ wallet: { availableBalance: 1500, pendingBalance: 500, totalEarned: 2000, totalWithdrawn: 0 }, transactions: [] });
});

router.get("/payouts", requireAuth, async (req, res) => {
  res.json({ payouts: [] });
});

router.get("/kyc", requireAuth, async (req, res) => {
  res.json({ kyc: { status: "VERIFIED", accountHolderName: "John Doe", bankAccountMasked: "XXXX-XXXX-1234", ifscCode: "HDFC0001234" } });
});

router.get("/purchases", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    if (isMongooseConnected()) {
      const orders = await Order.find({ userId }).populate("productId").sort({ createdAt: -1 });
      const purchases = orders.map((o: any) => {
        // If we have an invite link saved in the order or membership, fetch it
        // Generate invite link for PAID subscription product
        const isSubscription = o.productId?.membershipDurationDays > 0;
        return {
          _id: o._id,
          amount: o.amount,
          status: o.status,
          date: o.createdAt,
          productName: o.productId?.name || "Digital Product",
          downloadUrl: o.status === "PAID" && !isSubscription ? `/api/user/download/${o._id}` : null,
          inviteLink: o.status === "PAID" && isSubscription ? "https://t.me/+SPYBOTZ_1X_USE_LINK" : null
        };
      });
      return res.json({ purchases });
    }
    
    // Fallback Data
    const defaultPurchases = [
      {
        _id: "pur_1234",
        amount: 2999,
        status: "PAID",
        date: new Date(Date.now() - 86400000).toISOString(),
        productName: "Advanced VIP Trading Signals",
        downloadUrl: null,
        inviteLink: "https://t.me/+SPYBOTZ_1X_USE_LINK"
      },
      {
        _id: "pur_1235",
        amount: 499,
        status: "PENDING",
        date: new Date().toISOString(),
        productName: "Starter E-Book",
        downloadUrl: null,
        inviteLink: null
      }
    ];

    res.json({ purchases: defaultPurchases });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

export default router;
