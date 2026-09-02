import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, Building, CreditCard, User } from "lucide-react";

export default function KycPage() {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    ifscCode: ""
  });

  useEffect(() => {
    fetchKyc();
  }, []);

  const fetchKyc = async () => {
    try {
      const res = await axios.get("/api/user/kyc");
      if (res.data.kyc) {
        setKycStatus(res.data.kyc.status);
      } else {
        setKycStatus("UNVERIFIED");
      }
    } catch (err) {
      console.error(err);
      setKycStatus("UNVERIFIED");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/api/user/kyc", formData);
      alert("KYC details submitted for review.");
      setKycStatus("PENDING");
    } catch (err) {
      console.error(err);
      alert("Failed to submit KYC details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading KYC Details...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KYC & Bank Details</h1>
          <p className="text-gray-500">Verify your identity to enable automated payouts.</p>
        </div>
      </div>

      {kycStatus === "VERIFIED" ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">KYC Verified</h3>
            <p className="text-emerald-700 dark:text-emerald-300/80 mt-1">
              Your bank details have been verified by our compliance team. You are now eligible to receive automated payouts.
            </p>
          </div>
        </div>
      ) : kycStatus === "PENDING" ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Review Pending</h3>
            <p className="text-amber-700 dark:text-amber-300/80 mt-1">
              Your KYC details are currently under review by our admin team. This usually takes 24-48 hours.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Full Name (As per Bank)
              </label>
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all dark:text-white"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" /> Bank Name
              </label>
              <input
                required
                type="text"
                placeholder="HDFC Bank"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all dark:text-white"
                value={formData.bankAccountName}
                onChange={e => setFormData({ ...formData, bankAccountName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" /> Account Number
              </label>
              <input
                required
                type="text"
                placeholder="XXXXXXXX1234"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all dark:text-white"
                value={formData.bankAccountNumber}
                onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-400" /> IFSC Code
              </label>
              <input
                required
                type="text"
                placeholder="HDFC0001234"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all dark:text-white"
                value={formData.ifscCode}
                onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
              />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
             <p className="text-sm text-blue-800 dark:text-blue-300">
               Please ensure all details match your bank records exactly. Incorrect details may result in payout failures and delays.
             </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? "Submitting..." : <><Upload className="w-5 h-5" /> Submit KYC Details</>}
          </button>
        </form>
      )}
    </div>
  );
}
