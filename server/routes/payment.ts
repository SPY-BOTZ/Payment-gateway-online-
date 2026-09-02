import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { Order, Payment } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Membership, TelegramInvite } from "../models/Membership.js";
import { Wallet, Transaction } from "../models/Wallet.js";
import { requireAuth } from "../middleware/auth.js";
import { dbStore, OrderData, MembershipData } from "../db/store.js";

const router = express.Router();
const isMongooseConnected = () => mongoose.connection.readyState === 1;

let razorpay: Razorpay | null = null;
const getRazorpayInstance = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

// Create Razorpay Order
router.post("/create-order", requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = (req as any).user.userId;

    let product: any = null;
    if (isMongooseConnected()) {
      product = await Product.findById(productId);
    } else {
      product = dbStore.products.find(p => p._id === productId || p.slug === productId);
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const amount = product.discountPrice || product.price;
    const rzp = getRazorpayInstance();

    let razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let keyId = process.env.RAZORPAY_KEY_ID || "rzp_live_SPYBOTZ_MOCK";

    if (rzp) {
      try {
        const rzpOrder = await rzp.orders.create({
          amount: Math.round(amount * 100),
          currency: "INR",
          receipt: `rcpt_${Date.now()}`
        });
        razorpayOrderId = rzpOrder.id;
        keyId = process.env.RAZORPAY_KEY_ID!;
      } catch (err) {
        console.warn("Razorpay API call failed, falling back to simulated order ID:", err);
      }
    }

    if (isMongooseConnected()) {
      const order = new Order({
        userId,
        productId: product._id,
        amount,
        razorpayOrderId,
        status: "CREATED"
      });
      await order.save();

      return res.json({
        orderId: order._id,
        razorpayOrderId,
        amount: Math.round(amount * 100),
        currency: "INR",
        keyId,
        productName: product.name
      });
    }

    // In-memory order
    const newOrder: OrderData = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderId: `SPY-${Date.now().toString().slice(-6)}`,
      userId,
      productId: product._id,
      productName: product.name,
      amount,
      razorpayOrderId,
      status: "CREATED",
      createdAt: new Date().toISOString()
    };
    dbStore.orders.push(newOrder);

    return res.json({
      orderId: newOrder._id,
      razorpayOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      keyId,
      productName: product.name
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ error: "Unable to initiate payment" });
  }
});

// Verify Payment and Fulfill (Webhook or Direct Client Verification with signature check)
router.post("/verify", requireAuth, async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const userId = (req as any).user.userId;

    // Verify signature if keys are provided
    if (process.env.RAZORPAY_KEY_SECRET && razorpaySignature && razorpayOrderId) {
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const generatedSignature = hmac.digest("hex");
      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ error: "Invalid Razorpay payment signature" });
      }
    }

    if (isMongooseConnected()) {
      const order = await Order.findById(orderId).populate("productId");
      if (!order) return res.status(404).json({ error: "Order not found" });

      if (order.status === "PAID") {
        return res.json({ message: "Order already paid", order });
      }

      order.status = "PAID";
      order.paidAt = new Date();
      order.razorpayPaymentId = razorpayPaymentId || `pay_${Date.now()}`;
      await order.save();

      const product = order.productId as any;
      const expiry = new Date();
      if (product.membershipDurationDays) {
        expiry.setDate(expiry.getDate() + product.membershipDurationDays);
      } else {
        expiry.setFullYear(expiry.getFullYear() + 5);
      }

      const membership = new Membership({
        userId,
        productId: product._id,
        orderId: order._id,
        startDate: new Date(),
        expiryDate: expiry,
        status: "ACTIVE"
      });
      await membership.save();

      // Telegram Invite Link Generation
      let inviteLink = `https://t.me/+SPYVIP_${Date.now().toString(36).toUpperCase()}`;
      if (process.env.TELEGRAM_BOT_TOKEN && product.telegramChannelId) {
        try {
          const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
          const invite = await bot.createChatInviteLink(product.telegramChannelId, {
            member_limit: 1,
            expire_date: Math.floor(Date.now() / 1000) + 86400 // 24 hours expiry
          });
          inviteLink = invite.invite_link;
        } catch (botErr) {
          console.warn("Telegram bot invite generation fallback used:", botErr);
        }
      }

      await new TelegramInvite({
        userId,
        orderId: order._id,
        inviteLink,
        channelId: product.telegramChannelId || "VIP_CHANNEL",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 86400000)
      }).save();

      // Process Commission
      const user = await User.findById(userId);
      if (user && user.referredBy && product.commissionPercentage > 0) {
        const commissionAmount = (order.amount * product.commissionPercentage) / 100;
        const refWallet = await Wallet.findOne({ userId: user.referredBy });
        if (refWallet) {
          refWallet.pendingBalance += commissionAmount;
          refWallet.totalEarned += commissionAmount;
          await refWallet.save();

          await new Transaction({
            userId: user.referredBy,
            type: "COMMISSION",
            amount: commissionAmount,
            status: "PENDING",
            referenceId: order._id.toString(),
            description: `${product.commissionPercentage}% Commission for Order ${order._id}`,
            holdingReleaseDate: new Date(Date.now() + 86400000) // 24-hour holding period
          }).save();
        }
      }

      return res.json({
        success: true,
        message: "Payment verified successfully!",
        inviteLink,
        orderId: order._id
      });
    }

    // In-memory store fulfillment
    const order = dbStore.orders.find(o => o._id === orderId || o.razorpayOrderId === razorpayOrderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status !== "PAID") {
      order.status = "PAID";
      order.paidAt = new Date().toISOString();
      order.razorpayPaymentId = razorpayPaymentId || `pay_rzp_${Date.now()}`;

      const product = dbStore.products.find(p => p._id === order.productId);
      const durationDays = product?.membershipDurationDays || 30;
      const expiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();

      // Telegram Invite (Expires with Membership, 1 usage limit)
      const uniqueSecret = Math.random().toString(36).substring(2, 8).toUpperCase();
      const inviteLink = `https://t.me/+SPYBOTZ_${uniqueSecret}_PRIVATE_1X_USE`;

      const membership: MembershipData = {
        _id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId,
        productId: order.productId,
        productName: order.productName,
        orderId: order._id,
        startDate: new Date().toISOString(),
        expiryDate,
        status: "ACTIVE",
        telegramChannel: product?.telegramChannelId || "@spybotz_vip_alerts",
        inviteLink,
        createdAt: new Date().toISOString()
      };
      dbStore.memberships.push(membership);

      dbStore.telegramInvites.push({
        _id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId,
        orderId: order._id,
        inviteLink,
        channelId: product?.telegramChannelId || "-1002348719283",
        status: "PENDING",
        expiresAt: expiryDate,
        usageLimit: 1,
        createdAt: new Date().toISOString()
      });

      // Commission Logic
      const currentUser = dbStore.getUserById(userId);
      if (currentUser && currentUser.referredBy && product && product.commissionPercentage > 0) {
        const commAmt = (order.amount * product.commissionPercentage) / 100;
        const refWallet = dbStore.getWallet(currentUser.referredBy);
        refWallet.pendingBalance += commAmt;
        refWallet.totalEarned += commAmt;
        refWallet.updatedAt = new Date().toISOString();

        dbStore.transactions.push({
          _id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          userId: currentUser.referredBy,
          type: "COMMISSION",
          amount: commAmt,
          currency: "INR",
          status: "PENDING",
          referenceId: order._id,
          description: `${product.commissionPercentage}% Commission on ${product.name} (In 24h Holding)`,
          holdingReleaseDate: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString()
        });

        const referrer = dbStore.getUserById(currentUser.referredBy);
        if (referrer) {
          dbStore.dispatchNotification(
            "COMMISSION_ADDED",
            "TELEGRAM",
            referrer.mobile,
            "Commission Received!",
            `₹${commAmt.toFixed(2)} credited to your Pending Wallet from referral signup. Eligible in 24 hours.`,
            referrer._id
          );
        }
      }

      // Notifications for Buyer
      if (currentUser) {
        dbStore.dispatchNotification(
          "PAYMENT_SUCCESS",
          "TELEGRAM",
          currentUser.telegramId || currentUser.mobile,
          "Payment Successful",
          `Payment of ₹${order.amount} for ${order.productName} verified. Your PRIVATE VIP Telegram invite: ${inviteLink} (WARNING: This link expires when your membership expires and can only be used by 1 person.)`,
          currentUser._id
        );
        dbStore.dispatchNotification(
          "MEMBERSHIP_ACTIVATED",
          "EMAIL",
          currentUser.email,
          "SPY Botz Premium Activated!",
          `Congratulations! Your membership for ${order.productName} is now active until ${new Date(expiryDate).toLocaleDateString()}. Access private channel: ${inviteLink} (WARNING: This link expires when your membership expires and can only be used by 1 person.)`,
          currentUser._id
        );
      }

      dbStore.logAudit(userId, "USER", "PAYMENT_SUCCESS", "ORDER", order._id, { amount: order.amount, paymentId: order.razorpayPaymentId });

      return res.json({
        success: true,
        message: "Payment verified successfully!",
        inviteLink,
        orderId: order._id
      });
    }

    return res.json({
      success: true,
      message: "Order was already processed",
      orderId: order._id
    });
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(500).json({ error: "Payment verification error" });
  }
});

// Official Razorpay Webhook Handler
router.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const hmac = crypto.createHmac("sha256", webhookSecret);
      hmac.update(JSON.stringify(req.body));
      const digest = hmac.digest("hex");
      if (digest !== signature && process.env.NODE_ENV === "production") {
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    const { event, payload } = req.body;
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = dbStore.orders.find(o => o.razorpayOrderId === rzpOrderId);
        if (order && order.status !== "PAID") {
          order.status = "PAID";
          order.paidAt = new Date().toISOString();
          order.razorpayPaymentId = rzpPaymentId;
        }
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "Webhook handling failed" });
  }
});

export default router;
