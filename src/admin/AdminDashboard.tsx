/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin-only dashboard. Pulls stats and the user list from the
 * `/api/admin/*` endpoints, gated by the admin JWT in localStorage.
 * Logs out by clearing the admin token + navigating to /admin/login.
 */

import React, { useEffect, useState } from "react";
import { LogOut, RefreshCw, Users, Box, ShoppingCart, Receipt, MessageSquare } from "lucide-react";
import {
  ADMIN_TOKEN_STORAGE_KEY,
  ADMIN_USER_STORAGE_KEY,
} from "./AdminLogin";

interface AdminIdentity {
  email: string;
  name: string;
  role: "ADMIN";
}

interface Stats {
  users: number;
  products: number;
  sales: number;
  expenses: number;
  chats: number;
}

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

async function adminFetch(path: string): Promise<Response> {
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  return fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export default function AdminDashboard() {
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
    const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }
    if (raw) {
      try {
        setIdentity(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminFetch("/api/admin/stats"),
        adminFetch("/api/admin/users"),
      ]);
      if (statsRes.status === 401 || usersRes.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
        window.location.href = "/admin/login";
        return;
      }
      if (!statsRes.ok || !usersRes.ok) {
        throw new Error("Failed to load admin data.");
      }
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      setStats(statsData);
      setUsers(usersData.users || []);
    } catch (err: any) {
      setError(err.message || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-200 font-sans">
      <header className="border-b border-[#1F1F2E] bg-[#0D0D17]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">BizMind Operator</h1>
              <p className="text-[10px] text-slate-500">
                {identity ? `Signed in as ${identity.email}` : "Admin session"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="text-xs px-3 py-1.5 rounded-md bg-[#1A1A28] hover:bg-[#22222F] border border-[#2A2A3A] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-md bg-rose-600/90 hover:bg-rose-500 text-white flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg p-3">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={<Users className="w-4 h-4" />} label="Users" value={stats?.users} />
          <StatCard icon={<Box className="w-4 h-4" />} label="Products" value={stats?.products} />
          <StatCard icon={<ShoppingCart className="w-4 h-4" />} label="Sales" value={stats?.sales} />
          <StatCard icon={<Receipt className="w-4 h-4" />} label="Expenses" value={stats?.expenses} />
          <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Chats" value={stats?.chats} />
        </section>

        <section className="bg-[#12121A] border border-[#1F1F2E] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1F1F2E] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Registered users</h2>
            <span className="text-[10px] text-slate-500">{users.length} total</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No users yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#0D0D17] text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[#1F1F2E] hover:bg-[#16161F]">
                    <td className="px-5 py-3 text-slate-200">{u.name}</td>
                    <td className="px-5 py-3 text-slate-400">{u.email}</td>
                    <td className="px-5 py-3 text-slate-400">{u.role}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value?: number }) {
  return (
    <div className="bg-[#12121A] border border-[#1F1F2E] rounded-xl p-4">
      <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{value ?? "—"}</div>
    </div>
  );
}