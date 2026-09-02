import cron from 'node-cron';
import axios from 'axios';
import { User } from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

export const initCronJobs = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running subscription expiry check...');
    
    try {
      const now = new Date();
      // Find users whose subscription has expired, and still have a linked telegramChatId
      const expiredUsers = await User.find({
        subscriptionExpiry: { $lt: now },
        telegramChatId: { $exists: true, $ne: null }
      });

      if (expiredUsers.length === 0) {
        console.log('[CRON] No expired users found.');
        return;
      }

      console.log(`[CRON] Found ${expiredUsers.length} expired users. Revoking access...`);

      for (const user of expiredUsers) {
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID && user.telegramChatId) {
          try {
            // Unban allows them to rejoin later if they purchase again.
            // Ban them first to remove them from the channel.
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/banChatMember`, {
              chat_id: TELEGRAM_CHANNEL_ID,
              user_id: user.telegramChatId,
              revoke_messages: false
            });

            // Immediately unban so they can be re-invited later
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/unbanChatMember`, {
              chat_id: TELEGRAM_CHANNEL_ID,
              user_id: user.telegramChatId,
              only_if_banned: true
            });

            // Notify user
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              chat_id: user.telegramChatId,
              text: `⚠️ Your premium subscription has expired. You have been removed from the VIP channel. Please renew from your dashboard to regain access.`
            });

            console.log(`[CRON] Revoked access for user ${user.email} (${user.telegramChatId})`);
          } catch (apiError: any) {
            console.error(`[CRON] Failed to remove user ${user.email} from Telegram:`, apiError.response?.data || apiError.message);
          }
        }

        // We can either nullify telegramChatId or just clear subscriptionExpiry so we don't process them again.
        // Clearing subscriptionExpiry is safer so we don't re-kick them repeatedly.
        user.subscriptionExpiry = undefined;
        await user.save();
      }
    } catch (error) {
      console.error('[CRON] Error checking subscriptions:', error);
    }
  });

  console.log('Cron jobs initialized successfully.');
};
