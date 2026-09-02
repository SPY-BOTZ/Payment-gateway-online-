import express from "express";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payment.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import telegramRoutes from "./routes/telegram.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/payment", paymentRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/telegram", telegramRoutes);

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "SPY Botz - All-in-One Payment, Membership, Referral & Telegram Automation Platform",
    timestamp: new Date().toISOString()
  });
});

export default router;
