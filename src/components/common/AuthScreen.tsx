/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Building2,
  Globe2,
  Briefcase,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthScreenProps {
  onSuccess: (token: string) => void;
  onBack?: () => void;
}

const COUNTRIES = [
  "Bangladesh",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Singapore",
  "United Arab Emirates",
  "Germany",
  "France",
  "Other",
];

const BUSINESS_TYPES = [
  "E-commerce / Marketplace Seller",
  "Dropshipping",
  "Wholesale & Distribution",
  "Retail Store",
  "Manufacturing",
  "Agency / Service",
  "Other",
];

function PasswordStrength({ value }: { value: string }) {
  const score = useMemo(() => {
    let s = 0;
    if (value.length >= 8) s += 1;
    if (/[A-Z]/.test(value)) s += 1;
    if (/[0-9]/.test(value)) s += 1;
    if (/[^A-Za-z0-9]/.test(value)) s += 1;
    return s;
  }, [value]);

  const label = ["Too weak", "Weak", "Fair", "Good", "Strong"][score];
  const color =
    score <= 1
      ? "bg-red-500"
      : score === 2
      ? "bg-amber-500"
      : score === 3
      ? "bg-blue-500"
      : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#2A2A3A] overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(score / 4) * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold min-w-[64px] text-right">
        {value ? label : ""}
      </span>
    </div>
  );
}

export default function AuthScreen({ onSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const passwordsMatch =
    !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    // Role is not selectable — the server always assigns "Seller" on register.
    // Client-side fields (country, businessType) are captured here for UX but
    // are NOT sent in the auth payload because the existing backend contract
    // accepts {name, email, password} only. They live as local state to be
    // surfaced in the workspace after login.
    const body = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setMessage(data.message);

      // Persist token + remember-me preference. The existing auth contract
      // stores under `partner_token` / `partner_user` — keep that exact key.
      localStorage.setItem("partner_token", data.token);
      localStorage.setItem("partner_user", JSON.stringify(data.user));
      if (rememberMe) {
        localStorage.setItem("partner_remember", "1");
      } else {
        localStorage.removeItem("partner_remember");
      }

      // Cache business profile for later steps in the workspace.
      if (!isLogin) {
        localStorage.setItem(
          "partner_profile",
          JSON.stringify({ name, country, businessType })
        );
      }

      // If the signed-in account is Admin (env-driven credentials), jump
      // straight to the admin dashboard — no separate /admin/login needed.
      const isAdmin = data?.user?.role === "Admin";
      if (isAdmin) {
        // Seed the keys AdminDashboard reads (`bizmind_admin_token` /
        // `bizmind_admin_user`) so the hidden /admin/* routes authenticate
        // without requiring the separate /admin/login page.
        try {
          localStorage.setItem("bizmind_admin_token", data.token);
          localStorage.setItem(
            "bizmind_admin_user",
            JSON.stringify({
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
            })
          );
        } catch {}
      }

      setTimeout(() => {
        if (isAdmin) {
          window.location.href = "/admin/dashboard";
        } else {
          onSuccess(data.token);
        }
      }, 400);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: boolean) => {
    setIsLogin(next);
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen h-screen w-full bg-[#0D0D0D] text-[#F1F5F9] font-sans overflow-hidden relative">
      {/* Radial blue gradient glow — matches the landing page hero exactly */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-[#0D0D0D] to-[#0D0D0D]" />

      {/* Soft floating accents for depth (mirrors LandingPage aesthetic) */}
      <div className="pointer-events-none absolute top-[-15%] left-[-10%] w-[520px] h-[520px] bg-blue-600/15 rounded-full blur-[140px]" />
      <div className="pointer-events-none bottom-[-15%] right-[-10%] w-[520px] h-[520px] bg-indigo-600/15 rounded-full blur-[140px]" />

      {/* Brand — absolutely positioned in the top-left, removed from the centered flow */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 pointer-events-none">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          BM
        </div>
        <span className="font-bold text-xl tracking-tight font-syne text-white">
          BizMind AI
        </span>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 z-20 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to home
        </button>
      )}

      {/* Centered card — dedicated inner wrapper owns the flex centering so absolutely positioned siblings don't influence it */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
          style={{ maxWidth: 440 }}
        >
          {/* Glassmorphism card — translucent over dark bg, blurred, soft ring */}
          <div className="relative rounded-2xl bg-[#1A1A26]/70 backdrop-blur-xl border border-[#2A2A3A] shadow-2xl shadow-black/60 overflow-hidden">
            {/* Top blue glow inside the card */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[260px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-7 sm:p-9">
              {/* Header — eyebrow chip + heading + subtitle */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Business Workspace
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.h1
                    key={isLogin ? "login-title" : "register-title"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="font-syne text-3xl sm:text-4xl font-bold text-white tracking-tight"
                  >
                    {isLogin ? "Welcome Back" : "Create Your Account"}
                  </motion.h1>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={isLogin ? "login-sub" : "register-sub"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                    className="mt-2 text-sm sm:text-[15px] text-slate-400 font-dm-sans"
                  >
                    {isLogin
                      ? "Sign in to continue growing your business with AI."
                      : "Join thousands of sellers turning data into growth."}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-3 py-2"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm px-3 py-2"
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence initial={false}>
                  {!isLogin && (
                    <motion.div
                      key="register-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <Field
                        label="Company Name"
                        icon={<Building2 className="w-4 h-4" />}
                      >
                        <input
                          type="text"
                          required
                          placeholder="Apex Vendors"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputCls}
                        />
                      </Field>

                      <Field label="Country" icon={<Globe2 className="w-4 h-4" />}>
                        <select
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className={`${inputCls} appearance-none cursor-pointer`}
                        >
                          {COUNTRIES.map((c) => (
                            <option
                              key={c}
                              value={c}
                              className="bg-[#1A1A26] text-white"
                            >
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field
                        label="Business Type"
                        icon={<Briefcase className="w-4 h-4" />}
                      >
                        <select
                          required
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className={`${inputCls} appearance-none cursor-pointer`}
                        >
                          {BUSINESS_TYPES.map((b) => (
                            <option
                              key={b}
                              value={b}
                              className="bg-[#1A1A26] text-white"
                            >
                              {b}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field label="Business Email" icon={<Mail className="w-4 h-4" />}>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="Password" icon={<Lock className="w-4 h-4" />}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {!isLogin && <PasswordStrength value={password} />}
                </Field>

                <AnimatePresence initial={false}>
                  {!isLogin && (
                    <motion.div
                      key="confirm-password"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <Field
                        label="Confirm Password"
                        icon={<Lock className="w-4 h-4" />}
                      >
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`${inputCls} ${
                            !passwordsMatch ? "border-red-500/50 focus:ring-red-500/40" : ""
                          }`}
                        />
                      </Field>
                      {!passwordsMatch && (
                        <p className="mt-1 text-xs text-red-400">
                          Passwords do not match.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login-only: remember me + forgot password */}
                {isLogin && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none group">
                      <span className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="w-4 h-4 rounded border border-[#3A3A4A] bg-[#0F0F16] peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors flex items-center justify-center">
                          {rememberMe && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                        </span>
                      </span>
                      <span className="group-hover:text-white transition-colors">
                        Remember me
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Password reset is coming soon. Please contact support in the meantime."
                        )
                      }
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer — switch mode */}
              <div className="mt-7 text-center text-sm text-slate-400">
                {isLogin ? (
                  <p>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode(false)}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Create Free Account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode(true)}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Sign in instead
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subtle reassurance footer — no enterprise/demo chrome */}
          <p className="mt-6 text-center text-[12px] text-slate-500 font-dm-sans">
            Secure authentication. Your business data stays yours.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-[#0F0F16] border border-[#2A2A3A] text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all shadow-inner";

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        <span className="text-blue-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
