import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { dbStore } from "../db/store.js";

const router = express.Router();

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
  res.json({ success: true, message: `KYC ${status}` });
});

export default router;
