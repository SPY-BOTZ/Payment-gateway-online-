import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import { User } from './models/User';
import { sendTelegramMessage } from './services/telegramService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Health Check Route (Koyeb is using this)
app.get('/', (req, res) => {
  res.send('Payment Gateway Online is running!');
});

// Telegram Webhook Route for /start <userId>
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const telegramUserId = update.message.from.id.toString();

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          const internalUserId = parts[1];
          // Link Telegram ID to User Account
          await User.findByIdAndUpdate(internalUserId, { telegramId: telegramUserId });
          await sendTelegramMessage(chatId, '✅ Your Telegram account has been successfully linked to your VIP Dashboard!');
        } else {
          await sendTelegramMessage(chatId, 'Welcome! Please use the link from your dashboard to connect your account.');
        }
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Server Error');
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
