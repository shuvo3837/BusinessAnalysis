/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Sparkles, LogIn, UserPlus, HelpCircle } from "lucide-react";
import { UserRole } from "../../types";

interface AuthScreenProps {
  onSuccess: (token: string) => void;
  onBack?: () => void;
}

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("seller@partner.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<UserRole>("Seller");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin 
      ? { email, password }
      : { name, email, password, role };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setMessage(data.message);
      
      // Store token
      localStorage.setItem("partner_token", data.token);
      localStorage.setItem("partner_user", JSON.stringify(data.user));

      setTimeout(() => {
        onSuccess(data.token);
      }, 500);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = () => {
    // Convenience quick login with standard seller account
    setEmail("seller@partner.com");
    setPassword("password123");
    setIsLogin(true);
    
    // Auto submit simulated
    setName("");
    setLoading(true);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "seller@partner.com", password: "password123" })
    })
      .then(r => r.json())
      .then(data => {
        localStorage.setItem("partner_token", data.token);
        localStorage.setItem("partner_user", JSON.stringify(data.user));
        onSuccess(data.token);
      })
      .catch(err => {
        setError("Demo login blocked: " + err.message);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-1%] w-[450px] h-[450px] bg-sky-100/50 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 relative z-10">
        
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-slate-500 hover:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            &larr; Back
          </button>
        )}

        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-teal-700 rounded-xl flex items-center justify-center mb-3">
             <span className="text-white font-bold text-xl tracking-tighter">SS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">StockSense BD</h1>
          <p className="text-sm text-slate-500 mt-1">AI Inventory Intelligence for Sellers</p>
        </div>

        {/* Info alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3 mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Company / Seller Name</label>
              <input
                type="text"
                required
                placeholder="Apex Vendors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Business Email Address</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Secure Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-all"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Business Scale Tier</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 transition-all"
              >
                <option value="Seller">Standard Multi-Platform Seller</option>
                <option value="Business">Registered Brand / Corporate Business</option>
                <option value="Admin">Administrator Controls</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-6"
          >
            {isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                {loading ? "Logging in..." : "Enter Workspace"}
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                {loading ? "Registering account..." : "Initialize SaaS Workspace"}
              </>
            )}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider px-3">or fast track</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <button
          onClick={handleQuickDemoAccess}
          className="w-full bg-white hover:bg-slate-50 text-teal-700 text-xs py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Access Instant Sandbox (Demo Store)
        </button>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isLogin ? (
            <p>
              New vendor?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-teal-700 hover:underline hover:text-teal-800 font-medium"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-teal-700 hover:underline hover:text-teal-800 font-medium"
              >
                Sign In Instead
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 text-[11px] text-slate-500 flex items-center gap-2">
        <Shield className="w-3 h-3" />
        <span>Enterprise JWT Authorized Session Block</span>
      </div>
    </div>
  );
}
