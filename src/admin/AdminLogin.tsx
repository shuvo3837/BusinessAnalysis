/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hidden admin login. This page is NOT linked from anywhere in the public
 * app — entry is by URL only (`/admin/login`). Admin credentials are
 * configured server-side via env vars; this form just POSTs them.
 */

import React, { useState } from "react";
import { apiFetch } from "../lib/api";

const ADMIN_TOKEN_KEY = "bizmind_admin_token";
const ADMIN_USER_KEY = "bizmind_admin_user";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Admin authentication failed.");
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-200 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#12121A] border border-[#2A2A3A] rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">BizMind Operator</h1>
            <p className="text-xs text-slate-500">Restricted access</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Operator email
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Operator password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0F] border border-[#2A2A3A] text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-all shadow-sm"
          >
            {loading ? "Authenticating…" : "Authenticate"}
          </button>
        </form>

        <p className="text-[10px] text-slate-600 mt-6 text-center">
          This surface is not linked from the user app.
        </p>
      </div>
    </div>
  );
}

export const ADMIN_TOKEN_STORAGE_KEY = ADMIN_TOKEN_KEY;
export const ADMIN_USER_STORAGE_KEY = ADMIN_USER_KEY;