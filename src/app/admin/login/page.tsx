"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { loginAdmin } from "@/src/services/auth_services";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginAdmin(email, password);
      console.log("Response dari backend:", res);

      if (!res.token) {
        setError("Token tidak ditemukan di response");
        return;
      }

      localStorage.setItem("token", res.token);
      router.push("/admin/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Axios Error:", err.response?.data);
        setError(
          (err.response?.data as { error?: string })?.error || "Login gagal"
        );
      } else {
        console.error("Unexpected Error:", err);
        setError("Unexpected error");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold dark:black mb-2">
          Sign In
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Enter your email and password to sign in!
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-500 font-medium">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="info@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-sm"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}

              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-gray-600 dark:text-gray-400">
                Keep me logged in
              </span>
            </label>
            <a
              href="/reset-password"
              className="text-brand-500 hover:text-brand-600"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-brand-600 text-white rounded-lg py-2 font-medium"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-5">
          Don’t have an account?{" "}
          <a href="/signup" className="text-brand-500 hover:text-brand-600">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
