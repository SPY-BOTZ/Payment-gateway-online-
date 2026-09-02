import React from "react";
import { Link } from "react-router";
import { ArrowRight, ShieldCheck, Zap, Bot, CreditCard } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="py-20 lg:py-32 flex-1 flex flex-col justify-center items-center text-center px-4 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          <span>The Next-Gen Digital Product Platform</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight">
          Automate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Telegram Business</span> in seconds.
        </h1>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          SPY Botz offers seamless Razorpay checkout, instant Telegram access, robust referral programs, and secure 24-hour payouts.
        </p>
        <div className="mt-10 flex gap-4 flex-col sm:flex-row">
          <Link to="/register" className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2">
            Start Selling <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/products" className="px-8 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
            Browse Products
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-gray-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
              title="Secure KYC & Payouts"
              desc="Bank-grade KYC verification ensures compliance. Get your earnings transferred securely."
            />
            <FeatureCard 
              icon={<Bot className="w-8 h-8 text-indigo-500" />}
              title="Instant Telegram Access"
              desc="Customers receive secure, unique invite links instantly via our advanced bot integration."
            />
            <FeatureCard 
              icon={<CreditCard className="w-8 h-8 text-purple-500" />}
              title="Razorpay Integrated"
              desc="Accept UPI, Cards, and NetBanking effortlessly. Real-time webhook processing."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-shadow">
      <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
