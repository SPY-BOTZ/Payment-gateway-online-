import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export const sendTelegramMessage = async (chatId: string, text: string) => {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
};

export const kickTelegramUser = async (chatId: string, userId: string) => {
  try {
    await axios.post(`${TELEGRAM_API}/banChatMember`, {
      chat_id: chatId,
      user_id: userId
    });
    // Unban immediately so they can rejoin later using a valid link if they renew
    await axios.post(`${TELEGRAM_API}/unbanChatMember`, {
      chat_id: chatId,
      user_id: userId
    });
  } catch (error) {
    console.error('Error kicking Telegram user:', error);
  }
};
