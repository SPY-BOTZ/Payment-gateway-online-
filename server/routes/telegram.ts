import express from 'express';
import axios from 'axios';
import { User } from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Webhook endpoint for Telegram
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    if (update.message && update.message.text) {
      const text = update.message.text;
      const chatId = update.message.chat.id;
      
      // Look for /start command
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          const userId = parts[1];
          
          // Verify user exists and link telegramChatId
          const user = await User.findById(userId);
          
          if (user) {
            user.telegramChatId = chatId.toString();
            await user.save();
            
            // Reply to user
            if (TELEGRAM_BOT_TOKEN) {
              await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Welcome ${user.fullName}! Your Telegram account has been successfully linked. You will now receive updates here.`
              }).catch(e => console.error("Error sending Telegram message:", e.message));
            }
          } else {
            if (TELEGRAM_BOT_TOKEN) {
               await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `Error: Invalid activation token or user not found.`
              }).catch(e => console.error("Error sending Telegram message:", e.message));
            }
          }
        } else {
          if (TELEGRAM_BOT_TOKEN) {
             await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              chat_id: chatId,
              text: `Welcome! Please start the bot using the link provided in your dashboard to link your account.`
            }).catch(e => console.error("Error sending Telegram message:", e.message));
          }
        }
      }
    }
    
    // Always return 200 OK to acknowledge Telegram
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
