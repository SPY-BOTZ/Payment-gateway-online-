import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, XCircle, UserCheck, Search, Database } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [kycRes, usersRes] = await Promise.all([
        axios.get("/api/admin/kyc-queue").catch(() => ({ data: { queue: [] } })),
        axios.get("/api/admin/users").catch(() => ({ data: { users: [] } }))
      ]);
      setKycQueue(kycRes.data.queue || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycStatus = async (userId: string, status: "VERIFIED" | "REJECTED") => {
    try {
      await axios.put(`/api/admin/kyc-status`, { userId, status });
      // Remove from local queue
      setKycQueue(kycQueue.filter(k => k.userId !== userId));
      alert(`KYC marked as ${status}`);
    } catch (err) {
      console.error("Failed to update KYC", err);
      alert("Failed to update KYC status");
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    try {
      const res = await axios.post('/api/admin/broadcast', { message: broadcastMessage });
      alert(res.data.message || "Broadcast sent successfully!");
      setBroadcastMessage("");
    } catch (err) {
      console.error("Broadcast failed", err);
      alert("Failed to send broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Admin Panel...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Mission Control</h1>
          <p className="text-gray-500 mt-1">Manage users, approve KYC, and monitor platform health.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg font-bold text-sm border border-indigo-100 dark:border-indigo-800">
          Super Admin Access
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telegram Configuration */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
            Telegram Automation Setup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Default Private Channel/Group ID</label>
              <input type="text" placeholder="-1001234567890" className="w-full px-4 py-2 mt-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
              <p className="text-xs text-gray-500 mt-1">Bot must be an Admin with "Add/Remove Members" & "Invite Users" permissions.</p>
            </div>
            <div className="flex items-end">
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                Save Channel Config
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-bold text-gray-900 dark:text-white mb-2">Broadcast Message</h4>
            <div className="flex gap-4">
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write a message to broadcast to all Telegram-linked users..."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none"
                rows={2}
              ></textarea>
              <button 
                onClick={handleBroadcast}
                disabled={isBroadcasting || !broadcastMessage.trim()}
                className="px-6 py-2 bg-indigo-600 disabled:bg-gray-400 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center min-w-[120px]"
              >
                {isBroadcasting ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* KYC Queue */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-500" />
              Pending KYC Approvals
            </h3>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 text-xs font-bold rounded-full">
              {kycQueue.length} Pending
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {kycQueue.length > 0 ? (
              kycQueue.map((item) => (
                <div key={item.userId} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.username || "User"} ({item.fullName})</h4>
                    <div className="mt-1 space-y-1 text-sm text-gray-500">
                      <p><span className="font-semibold text-gray-700 dark:text-gray-300">Bank:</span> {item.bankAccountName}</p>
                      <p><span className="font-semibold text-gray-700 dark:text-gray-300">A/c No:</span> {item.bankAccountNumber}</p>
                      <p><span className="font-semibold text-gray-700 dark:text-gray-300">IFSC:</span> {item.ifscCode}</p>
                      <p><span className="font-semibold text-gray-700 dark:text-gray-300">Submitted:</span> {new Date(item.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleKycStatus(item.userId, "VERIFIED")}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleKycStatus(item.userId, "REJECTED")}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                <p>All caught up! No pending KYC requests.</p>
              </div>
            )}
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Registered Users
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.slice(0, 10).map((u, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                      {u.username} <br />
                      <span className="text-xs text-gray-500 font-normal">{u.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {u.role || "USER"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
