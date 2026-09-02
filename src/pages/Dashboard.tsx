import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  Wallet as WalletIcon, 
  Clock, 
  ShoppingBag, 
  Users, 
  Send, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("/api/user/dashboard/summary");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const wallet = data?.wallet || { availableBalance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 };
  const kycStatus = data?.kycStatus || user?.kycStatus || "NOT_STARTED";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome back, {user?.fullName || user?.username}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Live Portal
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            User ID: <span className="font-mono text-gray-700 dark:text-gray-300 font-medium">{user?.id || "SPY-USR"}</span> &bull; Referral Code: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{user?.referralCode || user?.username?.toUpperCase()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore VIP Bots
          </Link>
          <Link
            to="/dashboard/wallet"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm transition-all flex items-center gap-2"
          >
            <WalletIcon className="w-4 h-4 text-emerald-500" />
            Request Payout
          </Link>
        </div>
      </div>

      {/* KYC Alert if not verified */}
      {kycStatus !== "VERIFIED" && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                KYC Verification Status: {kycStatus.replace("_", " ")}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Complete your PAN & bank account verification to enable Razorpay Route bank payouts.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/kyc"
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            {kycStatus === "UNDER_REVIEW" ? "Check Status" : "Complete KYC"}
          </Link>
        </div>
      )}

      {/* Financial & Membership Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Available Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-gray-950 dark:text-white">
              ₹{Number(wallet.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for bank payout
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500">
            <span>Withdrawn: ₹{Number(wallet.totalWithdrawn || 0).toLocaleString("en-IN")}</span>
            <Link to="/dashboard/wallet" className="text-indigo-600 font-medium hover:underline flex items-center gap-0.5">
              Withdraw <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending Balance (24h Hold)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-gray-950 dark:text-white">
              ₹{Number(wallet.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Under 24h compliance verification
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500">
            <span>Total Earned: ₹{Number(wallet.totalEarned || 0).toLocaleString("en-IN")}</span>
            <span className="text-gray-400">Auto-clears</span>
          </div>
        </div>

        {/* Memberships & Orders */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active VIP Memberships
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-gray-950 dark:text-white">
              {data?.activeMembershipsCount || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Telegram channels synchronized
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500">
            <span>Total Orders: {data?.totalOrdersCount || 0}</span>
            <Link to="/dashboard/membership" className="text-indigo-600 font-medium hover:underline flex items-center gap-0.5">
              View Channels <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Telegram Channels & Products */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              My Active VIP Telegram Channels
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Instant access links generated automatically upon verified Razorpay payment.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {data?.recentMemberships && data.recentMemberships.length > 0 ? (
            data.recentMemberships.map((mem: any) => {
              const daysLeft = Math.ceil((new Date(mem.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={mem._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {mem.productName || mem.productId?.name || "SPY VIP Telegram Bot"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Expires: {new Date(mem.expiryDate).toLocaleDateString()} &bull; 
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 ml-1">
                          {daysLeft > 0 ? `${daysLeft} days remaining` : "Expired"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {mem.inviteLink ? (
                      <a
                        href={mem.inviteLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        Join Telegram VIP <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Joined</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <Send className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No active memberships yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Explore our automated options trading signals, crypto alpha setups, and PineScript bots to get started.
              </p>
              <Link
                to="/products"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700"
              >
                Browse VIP Bots
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Referral Quick Promo Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Earn up to 25% Lifetime Commissions</span>
          </div>
          <h3 className="text-xl font-bold">Refer fellow traders & build recurring earnings</h3>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Every qualifying purchase made using your unique referral code credits instant commission to your wallet.
          </p>
        </div>
        <Link
          to="/dashboard/referrals"
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-sm hover:bg-gray-100 transition-colors shrink-0 text-center"
        >
          View Referral Program
        </Link>
      </div>
    </div>
  );
}
