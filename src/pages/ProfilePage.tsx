import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & KYC</h1>
      
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
