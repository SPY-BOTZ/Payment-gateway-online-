import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { 
  Wallet as WalletIcon, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  HelpCircle,
  Download
} from "lucide-react";

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Payout Form Modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutError, setPayoutError] = useState("");
  const [payoutSuccess, setPayoutSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWalletData = async () => {
    try {
      const [wRes, pRes, kRes, purRes] = await Promise.all([
        axios.get("/api/user/wallet").catch(() => ({ data: { wallet: {}, transactions: [] } })),
        axios.get("/api/user/payouts").catch(() => ({ data: { payouts: [] } })),
        axios.get("/api/user/kyc").catch(() => ({ data: { kyc: null } })),
        axios.get("/api/user/purchases").catch(() => ({ data: { purchases: [] } }))
      ]);
      setWallet(wRes.data.wallet);
      setTransactions(wRes.data.transactions || []);
      setPayouts(pRes.data.payouts || []);
      setKyc(kRes.data.kyc);
      setPurchases(purRes.data.purchases || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError("");
    setPayoutSuccess("");

    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 500) {
      setPayoutError("Minimum withdrawal amount is ₹500.");
      return;
    }

    if (amt > (wallet?.availableBalance || 0)) {
      setPayoutError("Withdrawal amount exceeds your current Available Balance.");
      return;
    }

    if (kyc?.status !== "VERIFIED") {
      setPayoutError("KYC & Bank Account must be VERIFIED before withdrawing. Please visit the KYC tab.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post("/api/user/payouts/request", { amount: amt });
      setPayoutSuccess(res.data.message || "Payout requested successfully!");
      setWithdrawAmount("");
      fetchWalletData();
      setTimeout(() => setShowPayoutModal(false), 2000);
    } catch (err: any) {
      setPayoutError(err.response?.data?.error || "Failed to initiate payout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const available = wallet?.availableBalance || 0;
  const pending = wallet?.pendingBalance || 0;
  const earned = wallet?.totalEarned || 0;
  const withdrawn = wallet?.totalWithdrawn || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Wallet & Financial Ledger
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Immutable transaction history, commission balances, and bank settlement requests.
          </p>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Request Bank Payout
        </button>
      </div>

      {/* Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Available Balance</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-gray-950 dark:text-white">
            ₹{available.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Eligible for instant withdrawal</p>
        </div>

        {/* Pending 24h Holding */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending (24h Hold)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-gray-950 dark:text-white">
            ₹{pending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Held for risk/compliance review</p>
        </div>

        {/* Total Earned */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Earned</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-gray-950 dark:text-white">
            ₹{earned.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-1">Commissions & rewards</p>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Withdrawn</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-gray-950 dark:text-white">
            ₹{withdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-1">Settled to your verified bank</p>
        </div>
      </div>

      {/* 24-Hour Policy Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
          <span className="font-bold">24-Hour Holding Period & Settlement Policy: </span>
          All referral commissions initially enter your <span className="font-semibold">Pending Balance</span>. After exactly 24 hours of anti-fraud and chargeback verification, the amount automatically transfers into your <span className="font-semibold">Available Balance</span>. Expected payout timing depends on verification, payment-provider processing and banking/settlement conditions.
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Transaction Ledger (Append-Only)
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {transactions.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Release / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        tx.type === "COMMISSION" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                        tx.type === "PAYOUT" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                      {tx.description || "System transaction"}
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      <span className={tx.type === "PAYOUT" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}>
                        {tx.type === "PAYOUT" ? "-" : "+"}₹{Number(tx.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === "SUCCESS" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" :
                        tx.status === "PENDING" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
                        tx.status === "PROCESSING" ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {tx.holdingReleaseDate && tx.status === "PENDING" ? (
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Clears {new Date(tx.holdingReleaseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        new Date(tx.createdAt).toLocaleDateString()
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No transactions recorded in wallet ledger yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Purchases & Downloads */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Purchase History & Downloads
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {purchases.length > 0 ? (
                purchases.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                      {p.productName}
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                        p.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right flex justify-end gap-2">
                      {p.inviteLink && p.status === "PAID" && (
                        <a 
                          href={p.inviteLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 font-bold transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
                          Join Channel
                        </a>
                      )}
                      {p.downloadUrl && p.status === "PAID" && (
                        <a 
                          href={p.downloadUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      )}
                      {!p.downloadUrl && !p.inviteLink && (
                        <span className="text-gray-400 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                    No purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Payout Requests & Bank Transfers
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Payout ID</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Bank Account</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Requested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payouts.length > 0 ? (
                payouts.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {p.payoutId}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                      {p.bankAccountMasked} ({p.ifscCode})
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" :
                        p.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                        p.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                    No payouts requested yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Request Bank Payout
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Funds are transferred to your verified bank account via Razorpay Route.
            </p>

            {/* KYC Check notification inside modal */}
            {kyc?.status !== "VERIFIED" ? (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  KYC Verification Required
                </div>
                <p>
                  You must complete PAN & Bank Account verification in compliance with financial regulations before initiating withdrawals.
                </p>
                <Link
                  to="/dashboard/kyc"
                  onClick={() => setShowPayoutModal(false)}
                  className="inline-block mt-2 font-bold underline text-amber-900 dark:text-amber-100"
                >
                  Go to KYC Verification &rarr;
                </Link>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Destination Account</span>
                  <span className="font-semibold text-emerald-600">Verified</span>
                </div>
                <div className="mt-1 font-bold text-gray-900 dark:text-white">
                  {kyc.accountHolderName}
                </div>
                <div className="text-gray-500 font-mono text-[11px]">
                  {kyc.bankAccountMasked} &bull; IFSC: {kyc.ifscCode}
                </div>
              </div>
            )}

            {payoutError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
                {payoutError}
              </div>
            )}
            {payoutSuccess && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                {payoutSuccess}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    min="500"
                    max={available}
                    step="1"
                    placeholder="500"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    disabled={kyc?.status !== "VERIFIED"}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>Min: ₹500</span>
                  <span>Available: ₹{available.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || kyc?.status !== "VERIFIED" || available < 500}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Initiating..." : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
