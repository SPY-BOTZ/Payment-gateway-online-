import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  ShieldCheck, 
  Send, 
  CreditCard, 
  Headphones, 
  Bell, 
  User as UserIcon,
  MessageCircle,
  Clock,
  Sparkles
} from "lucide-react";

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Memberships & Telegram", path: "/dashboard/membership", icon: Send },
    { label: "Wallet & Ledger", path: "/dashboard/wallet", icon: Wallet },
    { label: "KYC & Bank Account", path: "/dashboard/kyc", icon: ShieldCheck },
    { label: "Payout Withdrawals", path: "/dashboard/payouts", icon: CreditCard },
    { label: "My Profile", path: "/dashboard/profile", icon: UserIcon }
  ];

  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
    navItems.push({ label: "Admin Panel", path: "/admin", icon: ShieldCheck });
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.username?.slice(0, 2).toUpperCase() || "SP"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role?.toLowerCase() || "user"}
                </span>
                {user?.kycStatus === "VERIFIED" && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    KYC
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 24-hour holding note card in sidebar */}
        <div className="m-4 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            24h Payout Policy
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[11px]">
            Eligible commissions enter Pending balance and clear to Available after 24h compliance validation.
          </p>
        </div>

        {/* Telegram Official CTA */}
        <div className="px-4 pb-4">
          <a
            href="https://t.me/SpyBotzAdmin"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            Telegram Official Admin
          </a>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
