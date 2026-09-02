import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { dbStore } from "../db/store.js";
import { sendTelegramNotification } from "../utils/telegramAlerts.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();
const isMongooseConnected = () => mongoose.connection.readyState === 1;

// Default system data
let defaultKycQueue = [
  { userId: "u123", username: "johndoe", fullName: "John Doe", bankAccountName: "HDFC Bank", bankAccountNumber: "XXXX1234", ifscCode: "HDFC0001234", submittedAt: new Date().toISOString() },
  { userId: "u124", username: "janedoe", fullName: "Jane Doe", bankAccountName: "ICICI Bank", bankAccountNumber: "XXXX5678", ifscCode: "ICIC0005678", submittedAt: new Date(Date.now() - 86400000).toISOString() }
];

let defaultUsers = [
  { id: "u1", username: "admin", email: "admin@spybotz.com", role: "ADMIN", createdAt: new Date(Date.now() - 864000000).toISOString() },
  { id: "u123", username: "johndoe", email: "john@example.com", role: "USER", createdAt: new Date(Date.now() - 186400000).toISOString() },
  { id: "u124", username: "janedoe", email: "jane@example.com", role: "USER", createdAt: new Date().toISOString() }
];

router.get("/kyc-queue", requireAuth, requireAdmin, async (req, res) => {
  res.json({ queue: defaultKycQueue });
});

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  res.json({ users: defaultUsers });
});

router.put("/kyc-status", requireAuth, requireAdmin, async (req, res) => {
  const { userId, status } = req.body;
  defaultKycQueue = defaultKycQueue.filter(k => k.userId !== userId);
  
  if (isMongooseConnected()) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.kycStatus = status;
        await user.save();
        
        await sendTelegramNotification(
          userId, 
          `🛡️ <b>KYC Update</b>\n\nYour KYC status has been updated to: <b>${status}</b>`
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  res.json({ success: true, message: `KYC ${status}` });
});

// Broadcast Product Updates / Announcements
router.post("/broadcast", requireAuth, requireAdmin, async (req, res) => {
  const { message } = req.body;
  let successCount = 0;
  
  if (isMongooseConnected()) {
    try {
      // Find all users who have linked their telegram
      const users = await User.find({ telegramChatId: { $exists: true, $ne: null } });
      
      // We shouldn't await sequentially in a real large app to avoid blocking, 
      // but for this example it's okay or we can use Promise.all.
      const sendPromises = users.map(user => 
        sendTelegramNotification(user._id.toString(), `📢 <b>Product Update / Announcement</b>\n\n${message}`)
          .then(success => { if (success) successCount++; })
      );
      
      await Promise.all(sendPromises);
    } catch (e) {
      console.error("Broadcast failed:", e);
      return res.status(500).json({ error: "Broadcast failed" });
    }
  }
  
  res.json({ success: true, message: `Broadcast sent to ${successCount} users.` });
});

export default router;
