import axios from 'axios';
import { User } from '../models/User.js';

export const sendTelegramNotification = async (userId: string, message: string) => {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) return false;

    let user;
    try {
        // Try to find user in DB if mongoose is connected
        user = await User.findById(userId);
    } catch(e) {
        // Mongoose might not be connected or invalid id
        return false;
    }

    if (user && user.telegramChatId) {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: user.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      });
      return true;
    }
    return false;
  } catch (error: any) {
    console.error("Failed to send telegram notification:", error.message || error);
    return false;
  }
};
