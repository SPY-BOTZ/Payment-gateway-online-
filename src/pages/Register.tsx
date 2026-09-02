import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || "";
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    mobile: "",
    telegramId: "",
    password: "",
    confirmPassword: "",
    ref
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    try {
      const res = await axios.post("/api/auth/register", formData);
      login("default-token", res.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create an account
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="appearance-none block w-full px-3 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="appearance-none block w-full px-3 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="appearance-none block w-full px-3 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
            <input type="tel" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="appearance-none block w-full px-3 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram Username / ID</label>
            <input type="text" value={formData.telegramId} onChange={e => setFormData({...formData, telegramId: e.target.value})} className="appearance-none block w-full px-3 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" placeholder="@username" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="appearance-none block w-full px-3 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="appearance-none block w-full px-3 py-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div>
            <button type="submit" className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Create Account
            </button>
          </div>
          <div className="text-center text-sm mt-4">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
