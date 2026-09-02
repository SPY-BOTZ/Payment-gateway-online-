import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Send } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const botUsername = "SPY_Botz_Bot"; // Should ideally come from env, but can be hardcoded for UI placeholder

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & KYC</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
            <Send className="w-5 h-5 text-blue-500" />
            Telegram Integration
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.telegramChatId 
              ? "Your Telegram account is linked successfully. You will receive private invites and notifications directly." 
              : "Link your Telegram account to receive private invites, alerts, and priority support."}
          </p>
        </div>
        {!user?.telegramChatId ? (
          <a
            href={`https://t.me/${botUsername}?start=${user?._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Link Telegram Now
          </a>
        ) : (
          <span className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg font-bold flex items-center gap-2">
            Linked Successfully
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4">Personal Details</h2>
        <div className="space-y-3">
          <div>
            <span className="text-gray-500 w-24 inline-block">Username:</span>
            <span className="font-medium">{user?.username}</span>
          </div>
          <div>
            <span className="text-gray-500 w-24 inline-block">Role:</span>
            <span className="font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/50 flex gap-4">
        <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0" />
        <div>
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-500 mb-2">KYC Not Completed</h2>
            <p className="text-amber-700 dark:text-amber-400 text-sm mb-4">
                You need to complete KYC verification (PAN, Aadhaar, Bank Details) before you can receive payouts.
            </p>
            <button className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
                Start KYC Verification
            </button>
        </div>
      </div>
    </div>
  );
}
