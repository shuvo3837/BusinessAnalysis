import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/common/AuthScreen.tsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=04431d04"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=04431d04"; const useState = __vite__cjsImport1_react["useState"]; const useMemo = __vite__cjsImport1_react["useMemo"];
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
  Check
} from "/node_modules/.vite/deps/lucide-react.js?v=04431d04";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/motion_react.js?v=04431d04";
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
  "Other"
];
const BUSINESS_TYPES = [
  "E-commerce / Marketplace Seller",
  "Dropshipping",
  "Wholesale & Distribution",
  "Retail Store",
  "Manufacturing",
  "Agency / Service",
  "Other"
];
function PasswordStrength({ value }) {
  _s();
  const score = useMemo(() => {
    let s = 0;
    if (value.length >= 8) s += 1;
    if (/[A-Z]/.test(value)) s += 1;
    if (/[0-9]/.test(value)) s += 1;
    if (/[^A-Za-z0-9]/.test(value)) s += 1;
    return s;
  }, [value]);
  const label = ["Too weak", "Weak", "Fair", "Good", "Strong"][score];
  const color = score <= 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : score === 3 ? "bg-blue-500" : "bg-emerald-500";
  return /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 h-1.5 rounded-full bg-[#2A2A3A] overflow-hidden", children: /* @__PURE__ */ jsxDEV(
      motion.div,
      {
        className: `h-full ${color}`,
        initial: { width: 0 },
        animate: { width: `${score / 4 * 100}%` },
        transition: { duration: 0.25 }
      },
      void 0,
      false,
      {
        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
        lineNumber: 74,
        columnNumber: 9
      },
      this
    ) }, void 0, false, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 73,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] uppercase tracking-wider text-slate-400 font-semibold min-w-[64px] text-right", children: value ? label : "" }, void 0, false, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 81,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
    lineNumber: 72,
    columnNumber: 5
  }, this);
}
_s(PasswordStrength, "g4dqVa6x0hPchhBNJbt/lbW6dms=");
_c = PasswordStrength;
export default function AuthScreen({ onSuccess, onBack }) {
  _s2();
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
  const passwordsMatch = !confirmPassword || password === confirmPassword;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { name, email, password };
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
      localStorage.setItem("partner_token", data.token);
      localStorage.setItem("partner_user", JSON.stringify(data.user));
      if (rememberMe) {
        localStorage.setItem("partner_remember", "1");
      } else {
        localStorage.removeItem("partner_remember");
      }
      if (!isLogin) {
        localStorage.setItem(
          "partner_profile",
          JSON.stringify({ name, country, businessType })
        );
      }
      setTimeout(() => {
        onSuccess(data.token);
      }, 400);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const switchMode = (next) => {
    setIsLogin(next);
    setError("");
    setMessage("");
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-[#0D0D0D] text-[#F1F5F9] font-sans overflow-x-hidden relative", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-[#0D0D0D] to-[#0D0D0D] -z-10" }, void 0, false, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 178,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "pointer-events-none absolute top-[-15%] left-[-10%] w-[520px] h-[520px] bg-blue-600/15 rounded-full blur-[140px]" }, void 0, false, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 181,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "pointer-events-none bottom-[-15%] right-[-10%] w-[520px] h-[520px] bg-indigo-600/15 rounded-full blur-[140px]" }, void 0, false, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 182,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("nav", { className: "flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full relative z-10", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]", children: "BM" }, void 0, false, {
          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
          lineNumber: 187,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "font-bold text-2xl tracking-tight font-syne text-white", children: "BizMind AI" }, void 0, false, {
          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
          lineNumber: 190,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
        lineNumber: 186,
        columnNumber: 9
      }, this),
      onBack && /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: onBack,
          className: "text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "w-4 h-4 rotate-180" }, void 0, false, {
              fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
              lineNumber: 200,
              columnNumber: 13
            }, this),
            "Back to home"
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
          lineNumber: 196,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 185,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { className: "relative z-10 flex items-center justify-center px-4 py-10 sm:py-16", children: /* @__PURE__ */ jsxDEV(
      motion.div,
      {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.5, ease: "easeOut" },
        className: "w-full max-w-md",
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "relative rounded-2xl bg-[#1A1A26]/70 backdrop-blur-xl border border-[#2A2A3A] shadow-2xl shadow-black/60 overflow-hidden", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[260px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" }, void 0, false, {
              fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
              lineNumber: 217,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative p-7 sm:p-9", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "text-center mb-8", children: [
                /* @__PURE__ */ jsxDEV(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.1, duration: 0.4 },
                    className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4",
                    children: [
                      /* @__PURE__ */ jsxDEV(Sparkles, { className: "w-3.5 h-3.5" }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 228,
                        columnNumber: 19
                      }, this),
                      "AI-Powered Business Workspace"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 222,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxDEV(
                  motion.h1,
                  {
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -8 },
                    transition: { duration: 0.25 },
                    className: "font-syne text-3xl sm:text-4xl font-bold text-white tracking-tight",
                    children: isLogin ? "Welcome Back" : "Create Your Account"
                  },
                  isLogin ? "login-title" : "register-title",
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 233,
                    columnNumber: 19
                  },
                  this
                ) }, void 0, false, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 232,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxDEV(
                  motion.p,
                  {
                    initial: { opacity: 0, y: 6 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -6 },
                    transition: { duration: 0.25, delay: 0.05 },
                    className: "mt-2 text-sm sm:text-[15px] text-slate-400 font-dm-sans",
                    children: isLogin ? "Sign in to continue growing your business with AI." : "Join thousands of sellers turning data into growth."
                  },
                  isLogin ? "login-sub" : "register-sub",
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 246,
                    columnNumber: 19
                  },
                  this
                ) }, void 0, false, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 245,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                lineNumber: 221,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV(AnimatePresence, { children: [
                error && /* @__PURE__ */ jsxDEV(
                  motion.div,
                  {
                    initial: { opacity: 0, y: -6 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -6 },
                    className: "mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-3 py-2",
                    role: "alert",
                    children: error
                  },
                  void 0,
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 264,
                    columnNumber: 17
                  },
                  this
                ),
                message && /* @__PURE__ */ jsxDEV(
                  motion.div,
                  {
                    initial: { opacity: 0, y: -6 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -6 },
                    className: "mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm px-3 py-2",
                    children: message
                  },
                  void 0,
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 275,
                    columnNumber: 17
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                lineNumber: 262,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
                /* @__PURE__ */ jsxDEV(AnimatePresence, { initial: false, children: !isLogin && /* @__PURE__ */ jsxDEV(
                  motion.div,
                  {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    exit: { opacity: 0, height: 0 },
                    transition: { duration: 0.3 },
                    className: "space-y-4 overflow-hidden",
                    children: [
                      /* @__PURE__ */ jsxDEV(
                        Field,
                        {
                          label: "Company Name",
                          icon: /* @__PURE__ */ jsxDEV(Building2, { className: "w-4 h-4" }, void 0, false, {
                            fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                            lineNumber: 299,
                            columnNumber: 29
                          }, this),
                          children: /* @__PURE__ */ jsxDEV(
                            "input",
                            {
                              type: "text",
                              required: true,
                              placeholder: "Apex Vendors",
                              value: name,
                              onChange: (e) => setName(e.target.value),
                              className: inputCls
                            },
                            void 0,
                            false,
                            {
                              fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                              lineNumber: 301,
                              columnNumber: 25
                            },
                            this
                          )
                        },
                        void 0,
                        false,
                        {
                          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                          lineNumber: 297,
                          columnNumber: 23
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(Field, { label: "Country", icon: /* @__PURE__ */ jsxDEV(Globe2, { className: "w-4 h-4" }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 311,
                        columnNumber: 52
                      }, this), children: /* @__PURE__ */ jsxDEV(
                        "select",
                        {
                          required: true,
                          value: country,
                          onChange: (e) => setCountry(e.target.value),
                          className: `${inputCls} appearance-none cursor-pointer`,
                          children: COUNTRIES.map(
                            (c) => /* @__PURE__ */ jsxDEV(
                              "option",
                              {
                                value: c,
                                className: "bg-[#1A1A26] text-white",
                                children: c
                              },
                              c,
                              false,
                              {
                                fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                                lineNumber: 319,
                                columnNumber: 25
                              },
                              this
                            )
                          )
                        },
                        void 0,
                        false,
                        {
                          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                          lineNumber: 312,
                          columnNumber: 25
                        },
                        this
                      ) }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 311,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        Field,
                        {
                          label: "Business Type",
                          icon: /* @__PURE__ */ jsxDEV(Briefcase, { className: "w-4 h-4" }, void 0, false, {
                            fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                            lineNumber: 332,
                            columnNumber: 29
                          }, this),
                          children: /* @__PURE__ */ jsxDEV(
                            "select",
                            {
                              required: true,
                              value: businessType,
                              onChange: (e) => setBusinessType(e.target.value),
                              className: `${inputCls} appearance-none cursor-pointer`,
                              children: BUSINESS_TYPES.map(
                                (b) => /* @__PURE__ */ jsxDEV(
                                  "option",
                                  {
                                    value: b,
                                    className: "bg-[#1A1A26] text-white",
                                    children: b
                                  },
                                  b,
                                  false,
                                  {
                                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                                    lineNumber: 341,
                                    columnNumber: 25
                                  },
                                  this
                                )
                              )
                            },
                            void 0,
                            false,
                            {
                              fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                              lineNumber: 334,
                              columnNumber: 25
                            },
                            this
                          )
                        },
                        void 0,
                        false,
                        {
                          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                          lineNumber: 330,
                          columnNumber: 23
                        },
                        this
                      )
                    ]
                  },
                  "register-fields",
                  true,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 289,
                    columnNumber: 19
                  },
                  this
                ) }, void 0, false, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 287,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV(Field, { label: "Business Email", icon: /* @__PURE__ */ jsxDEV(Mail, { className: "w-4 h-4" }, void 0, false, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 355,
                  columnNumber: 53
                }, this), children: /* @__PURE__ */ jsxDEV(
                  "input",
                  {
                    type: "email",
                    required: true,
                    autoComplete: "email",
                    placeholder: "name@company.com",
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    className: inputCls
                  },
                  void 0,
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 356,
                    columnNumber: 19
                  },
                  this
                ) }, void 0, false, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 355,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV(Field, { label: "Password", icon: /* @__PURE__ */ jsxDEV(Lock, { className: "w-4 h-4" }, void 0, false, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 367,
                  columnNumber: 47
                }, this), children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxDEV(
                      "input",
                      {
                        type: showPassword ? "text" : "password",
                        required: true,
                        autoComplete: isLogin ? "current-password" : "new-password",
                        placeholder: "••••••••",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        className: `${inputCls} pr-11`
                      },
                      void 0,
                      false,
                      {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 369,
                        columnNumber: 21
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowPassword((s) => !s),
                        "aria-label": showPassword ? "Hide password" : "Show password",
                        className: "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
                        children: showPassword ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                          lineNumber: 385,
                          columnNumber: 23
                        }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                          lineNumber: 387,
                          columnNumber: 23
                        }, this)
                      },
                      void 0,
                      false,
                      {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 378,
                        columnNumber: 21
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 368,
                    columnNumber: 19
                  }, this),
                  !isLogin && /* @__PURE__ */ jsxDEV(PasswordStrength, { value: password }, void 0, false, {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 391,
                    columnNumber: 32
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 367,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV(AnimatePresence, { initial: false, children: !isLogin && /* @__PURE__ */ jsxDEV(
                  motion.div,
                  {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    exit: { opacity: 0, height: 0 },
                    transition: { duration: 0.3 },
                    className: "overflow-hidden",
                    children: [
                      /* @__PURE__ */ jsxDEV(
                        Field,
                        {
                          label: "Confirm Password",
                          icon: /* @__PURE__ */ jsxDEV(Lock, { className: "w-4 h-4" }, void 0, false, {
                            fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                            lineNumber: 406,
                            columnNumber: 29
                          }, this),
                          children: /* @__PURE__ */ jsxDEV(
                            "input",
                            {
                              type: showPassword ? "text" : "password",
                              required: true,
                              autoComplete: "new-password",
                              placeholder: "••••••••",
                              value: confirmPassword,
                              onChange: (e) => setConfirmPassword(e.target.value),
                              className: `${inputCls} ${!passwordsMatch ? "border-red-500/50 focus:ring-red-500/40" : ""}`
                            },
                            void 0,
                            false,
                            {
                              fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                              lineNumber: 408,
                              columnNumber: 25
                            },
                            this
                          )
                        },
                        void 0,
                        false,
                        {
                          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                          lineNumber: 404,
                          columnNumber: 23
                        },
                        this
                      ),
                      !passwordsMatch && /* @__PURE__ */ jsxDEV("p", { className: "mt-1 text-xs text-red-400", children: "Passwords do not match." }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 421,
                        columnNumber: 21
                      }, this)
                    ]
                  },
                  "confirm-password",
                  true,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 396,
                    columnNumber: 19
                  },
                  this
                ) }, void 0, false, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 394,
                  columnNumber: 17
                }, this),
                isLogin && /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between pt-1", children: [
                  /* @__PURE__ */ jsxDEV("label", { className: "flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none group", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "relative inline-flex items-center", children: [
                      /* @__PURE__ */ jsxDEV(
                        "input",
                        {
                          type: "checkbox",
                          checked: rememberMe,
                          onChange: (e) => setRememberMe(e.target.checked),
                          className: "peer sr-only"
                        },
                        void 0,
                        false,
                        {
                          fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                          lineNumber: 434,
                          columnNumber: 25
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV("span", { className: "w-4 h-4 rounded border border-[#3A3A4A] bg-[#0F0F16] peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors flex items-center justify-center", children: rememberMe && /* @__PURE__ */ jsxDEV(Check, { className: "w-3 h-3 text-white", strokeWidth: 3 }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 442,
                        columnNumber: 25
                      }, this) }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 440,
                        columnNumber: 25
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                      lineNumber: 433,
                      columnNumber: 23
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "group-hover:text-white transition-colors", children: "Remember me" }, void 0, false, {
                      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                      lineNumber: 446,
                      columnNumber: 23
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 432,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      type: "button",
                      onClick: () => setError(
                        "Password reset is coming soon. Please contact support in the meantime."
                      ),
                      className: "text-sm text-blue-400 hover:text-blue-300 transition-colors",
                      children: "Forgot password?"
                    },
                    void 0,
                    false,
                    {
                      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                      lineNumber: 451,
                      columnNumber: 21
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                  lineNumber: 431,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    type: "submit",
                    disabled: loading,
                    className: "w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]",
                    children: loading ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                      /* @__PURE__ */ jsxDEV(Loader2, { className: "w-4 h-4 animate-spin" }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 473,
                        columnNumber: 23
                      }, this),
                      isLogin ? "Signing in..." : "Creating account..."
                    ] }, void 0, true, {
                      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                      lineNumber: 472,
                      columnNumber: 19
                    }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
                      isLogin ? "Sign In" : "Create Account",
                      /* @__PURE__ */ jsxDEV(ArrowRight, { className: "w-4 h-4" }, void 0, false, {
                        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                        lineNumber: 479,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                      lineNumber: 477,
                      columnNumber: 19
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 466,
                    columnNumber: 17
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                lineNumber: 286,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "mt-7 text-center text-sm text-slate-400", children: isLogin ? /* @__PURE__ */ jsxDEV("p", { children: [
                "Don't have an account?",
                " ",
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    type: "button",
                    onClick: () => switchMode(false),
                    className: "text-blue-400 hover:text-blue-300 font-semibold transition-colors",
                    children: "Create Free Account"
                  },
                  void 0,
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 490,
                    columnNumber: 21
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                lineNumber: 488,
                columnNumber: 17
              }, this) : /* @__PURE__ */ jsxDEV("p", { children: [
                "Already have an account?",
                " ",
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    type: "button",
                    onClick: () => switchMode(true),
                    className: "text-blue-400 hover:text-blue-300 font-semibold transition-colors",
                    children: "Sign in instead"
                  },
                  void 0,
                  false,
                  {
                    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                    lineNumber: 501,
                    columnNumber: 21
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                lineNumber: 499,
                columnNumber: 17
              }, this) }, void 0, false, {
                fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
                lineNumber: 486,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
              lineNumber: 219,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
            lineNumber: 215,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-6 text-center text-[12px] text-slate-500 font-dm-sans", children: "Secure authentication. Your business data stays yours." }, void 0, false, {
            fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
            lineNumber: 515,
            columnNumber: 11
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
        lineNumber: 208,
        columnNumber: 9
      },
      this
    ) }, void 0, false, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 207,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
    lineNumber: 176,
    columnNumber: 5
  }, this);
}
_s2(AuthScreen, "00s0d77e7EGXgrEub0Nqq+eoQd4=");
_c2 = AuthScreen;
const inputCls = "w-full bg-[#0F0F16] border border-[#2A2A3A] text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all shadow-inner";
function Field({
  label,
  icon,
  children
}) {
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("label", { className: "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "text-blue-400", children: icon }, void 0, false, {
        fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
        lineNumber: 539,
        columnNumber: 9
      }, this),
      label
    ] }, void 0, true, {
      fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
      lineNumber: 538,
      columnNumber: 7
    }, this),
    children
  ] }, void 0, true, {
    fileName: "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx",
    lineNumber: 537,
    columnNumber: 5
  }, this);
}
_c3 = Field;
var _c, _c2, _c3;
$RefreshReg$(_c, "PasswordStrength");
$RefreshReg$(_c2, "AuthScreen");
$RefreshReg$(_c3, "Field");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, "C:/projects/BusinessAnalysis/src/components/common/AuthScreen.tsx " + id);
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}

//# sourceMappingURL=data:application/json;base64,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QTtBQUFBLG1CQVJGO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBU0EsS0F0Qko7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkF3QkE7QUFBQSxpQkFuU0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFvU0E7QUFBQSxlQXhTRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQXlTQTtBQUFBLFVBR0EsdUJBQUMsT0FBRSxXQUFVLDREQUEyRCxzRUFBeEU7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFFQTtBQUFBO0FBQUE7QUFBQSxNQXJURjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFzVEEsS0F2VEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQXdUQTtBQUFBLE9BdlZGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0F3VkE7QUFFSjtBQUFDaEQsSUFsYnVCSCxZQUFVO0FBQUEsTUFBVkE7QUFvYnhCLE1BQU00RCxXQUNKO0FBRUYsU0FBU0ssTUFBTTtBQUFBLEVBQ2JyRTtBQUFBQSxFQUNBc0U7QUFBQUEsRUFDQUM7QUFLRixHQUFHO0FBQ0QsU0FDRSx1QkFBQyxTQUNDO0FBQUEsMkJBQUMsV0FBTSxXQUFVLHNHQUNmO0FBQUEsNkJBQUMsVUFBSyxXQUFVLGlCQUFpQkQsa0JBQWpDO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFBc0M7QUFBQSxNQUNyQ3RFO0FBQUFBLFNBRkg7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUdBO0FBQUEsSUFDQ3VFO0FBQUFBLE9BTEg7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQU1BO0FBRUo7QUFBQ0MsTUFsQlFIO0FBQUssSUFBQUksSUFBQUMsS0FBQUY7QUFBQSxhQUFBQyxJQUFBO0FBQUEsYUFBQUMsS0FBQTtBQUFBLGFBQUFGLEtBQUEiLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZU1lbW8iLCJBcnJvd1JpZ2h0IiwiRXllIiwiRXllT2ZmIiwiTG9hZGVyMiIsIkxvY2siLCJNYWlsIiwiU3BhcmtsZXMiLCJCdWlsZGluZzIiLCJHbG9iZTIiLCJCcmllZmNhc2UiLCJDaGVjayIsIm1vdGlvbiIsIkFuaW1hdGVQcmVzZW5jZSIsIkNPVU5UUklFUyIsIkJVU0lORVNTX1RZUEVTIiwiUGFzc3dvcmRTdHJlbmd0aCIsInZhbHVlIiwiX3MiLCJzY29yZSIsInMiLCJsZW5ndGgiLCJ0ZXN0IiwibGFiZWwiLCJjb2xvciIsIndpZHRoIiwiZHVyYXRpb24iLCJBdXRoU2NyZWVuIiwib25TdWNjZXNzIiwib25CYWNrIiwiX3MyIiwiaXNMb2dpbiIsInNldElzTG9naW4iLCJuYW1lIiwic2V0TmFtZSIsImNvdW50cnkiLCJzZXRDb3VudHJ5IiwiYnVzaW5lc3NUeXBlIiwic2V0QnVzaW5lc3NUeXBlIiwiZW1haWwiLCJzZXRFbWFpbCIsInBhc3N3b3JkIiwic2V0UGFzc3dvcmQiLCJjb25maXJtUGFzc3dvcmQiLCJzZXRDb25maXJtUGFzc3dvcmQiLCJzaG93UGFzc3dvcmQiLCJzZXRTaG93UGFzc3dvcmQiLCJyZW1lbWJlck1lIiwic2V0UmVtZW1iZXJNZSIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZXJyb3IiLCJzZXRFcnJvciIsIm1lc3NhZ2UiLCJzZXRNZXNzYWdlIiwicGFzc3dvcmRzTWF0Y2giLCJoYW5kbGVTdWJtaXQiLCJlIiwicHJldmVudERlZmF1bHQiLCJ1cmwiLCJib2R5IiwicmVzIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGEiLCJqc29uIiwib2siLCJFcnJvciIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJ0b2tlbiIsInVzZXIiLCJyZW1vdmVJdGVtIiwic2V0VGltZW91dCIsImVyciIsInN3aXRjaE1vZGUiLCJuZXh0Iiwib3BhY2l0eSIsInkiLCJzY2FsZSIsImVhc2UiLCJkZWxheSIsImhlaWdodCIsInRhcmdldCIsImlucHV0Q2xzIiwibWFwIiwiYyIsImIiLCJjaGVja2VkIiwiRmllbGQiLCJpY29uIiwiY2hpbGRyZW4iLCJfYzMiLCJfYyIsIl9jMiJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJBdXRoU2NyZWVuLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcclxuICovXHJcblxyXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcclxuaW1wb3J0IHtcclxuICBBcnJvd1JpZ2h0LFxyXG4gIEV5ZSxcclxuICBFeWVPZmYsXHJcbiAgTG9hZGVyMixcclxuICBMb2NrLFxyXG4gIE1haWwsXHJcbiAgU3BhcmtsZXMsXHJcbiAgQnVpbGRpbmcyLFxyXG4gIEdsb2JlMixcclxuICBCcmllZmNhc2UsXHJcbiAgQ2hlY2ssXHJcbn0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xyXG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJtb3Rpb24vcmVhY3RcIjtcclxuXHJcbmludGVyZmFjZSBBdXRoU2NyZWVuUHJvcHMge1xyXG4gIG9uU3VjY2VzczogKHRva2VuOiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgb25CYWNrPzogKCkgPT4gdm9pZDtcclxufVxyXG5cclxuY29uc3QgQ09VTlRSSUVTID0gW1xyXG4gIFwiQmFuZ2xhZGVzaFwiLFxyXG4gIFwiVW5pdGVkIFN0YXRlc1wiLFxyXG4gIFwiVW5pdGVkIEtpbmdkb21cIixcclxuICBcIkNhbmFkYVwiLFxyXG4gIFwiQXVzdHJhbGlhXCIsXHJcbiAgXCJJbmRpYVwiLFxyXG4gIFwiU2luZ2Fwb3JlXCIsXHJcbiAgXCJVbml0ZWQgQXJhYiBFbWlyYXRlc1wiLFxyXG4gIFwiR2VybWFueVwiLFxyXG4gIFwiRnJhbmNlXCIsXHJcbiAgXCJPdGhlclwiLFxyXG5dO1xyXG5cclxuY29uc3QgQlVTSU5FU1NfVFlQRVMgPSBbXHJcbiAgXCJFLWNvbW1lcmNlIC8gTWFya2V0cGxhY2UgU2VsbGVyXCIsXHJcbiAgXCJEcm9wc2hpcHBpbmdcIixcclxuICBcIldob2xlc2FsZSAmIERpc3RyaWJ1dGlvblwiLFxyXG4gIFwiUmV0YWlsIFN0b3JlXCIsXHJcbiAgXCJNYW51ZmFjdHVyaW5nXCIsXHJcbiAgXCJBZ2VuY3kgLyBTZXJ2aWNlXCIsXHJcbiAgXCJPdGhlclwiLFxyXG5dO1xyXG5cclxuZnVuY3Rpb24gUGFzc3dvcmRTdHJlbmd0aCh7IHZhbHVlIH06IHsgdmFsdWU6IHN0cmluZyB9KSB7XHJcbiAgY29uc3Qgc2NvcmUgPSB1c2VNZW1vKCgpID0+IHtcclxuICAgIGxldCBzID0gMDtcclxuICAgIGlmICh2YWx1ZS5sZW5ndGggPj0gOCkgcyArPSAxO1xyXG4gICAgaWYgKC9bQS1aXS8udGVzdCh2YWx1ZSkpIHMgKz0gMTtcclxuICAgIGlmICgvWzAtOV0vLnRlc3QodmFsdWUpKSBzICs9IDE7XHJcbiAgICBpZiAoL1teQS1aYS16MC05XS8udGVzdCh2YWx1ZSkpIHMgKz0gMTtcclxuICAgIHJldHVybiBzO1xyXG4gIH0sIFt2YWx1ZV0pO1xyXG5cclxuICBjb25zdCBsYWJlbCA9IFtcIlRvbyB3ZWFrXCIsIFwiV2Vha1wiLCBcIkZhaXJcIiwgXCJHb29kXCIsIFwiU3Ryb25nXCJdW3Njb3JlXTtcclxuICBjb25zdCBjb2xvciA9XHJcbiAgICBzY29yZSA8PSAxXHJcbiAgICAgID8gXCJiZy1yZWQtNTAwXCJcclxuICAgICAgOiBzY29yZSA9PT0gMlxyXG4gICAgICA/IFwiYmctYW1iZXItNTAwXCJcclxuICAgICAgOiBzY29yZSA9PT0gM1xyXG4gICAgICA/IFwiYmctYmx1ZS01MDBcIlxyXG4gICAgICA6IFwiYmctZW1lcmFsZC01MDBcIjtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4LTEgaC0xLjUgcm91bmRlZC1mdWxsIGJnLVsjMkEyQTNBXSBvdmVyZmxvdy1oaWRkZW5cIj5cclxuICAgICAgICA8bW90aW9uLmRpdlxyXG4gICAgICAgICAgY2xhc3NOYW1lPXtgaC1mdWxsICR7Y29sb3J9YH1cclxuICAgICAgICAgIGluaXRpYWw9e3sgd2lkdGg6IDAgfX1cclxuICAgICAgICAgIGFuaW1hdGU9e3sgd2lkdGg6IGAkeyhzY29yZSAvIDQpICogMTAwfSVgIH19XHJcbiAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjI1IH19XHJcbiAgICAgICAgLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LXNsYXRlLTQwMCBmb250LXNlbWlib2xkIG1pbi13LVs2NHB4XSB0ZXh0LXJpZ2h0XCI+XHJcbiAgICAgICAge3ZhbHVlID8gbGFiZWwgOiBcIlwifVxyXG4gICAgICA8L3NwYW4+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBdXRoU2NyZWVuKHsgb25TdWNjZXNzLCBvbkJhY2sgfTogQXV0aFNjcmVlblByb3BzKSB7XHJcbiAgY29uc3QgW2lzTG9naW4sIHNldElzTG9naW5dID0gdXNlU3RhdGUodHJ1ZSk7XHJcbiAgY29uc3QgW25hbWUsIHNldE5hbWVdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW2NvdW50cnksIHNldENvdW50cnldID0gdXNlU3RhdGUoQ09VTlRSSUVTWzBdKTtcclxuICBjb25zdCBbYnVzaW5lc3NUeXBlLCBzZXRCdXNpbmVzc1R5cGVdID0gdXNlU3RhdGUoQlVTSU5FU1NfVFlQRVNbMF0pO1xyXG4gIGNvbnN0IFtlbWFpbCwgc2V0RW1haWxdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZShcIlwiKTtcclxuICBjb25zdCBbY29uZmlybVBhc3N3b3JkLCBzZXRDb25maXJtUGFzc3dvcmRdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW3Nob3dQYXNzd29yZCwgc2V0U2hvd1Bhc3N3b3JkXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbcmVtZW1iZXJNZSwgc2V0UmVtZW1iZXJNZV0gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShcIlwiKTtcclxuICBjb25zdCBbbWVzc2FnZSwgc2V0TWVzc2FnZV0gPSB1c2VTdGF0ZShcIlwiKTtcclxuXHJcbiAgY29uc3QgcGFzc3dvcmRzTWF0Y2ggPVxyXG4gICAgIWNvbmZpcm1QYXNzd29yZCB8fCBwYXNzd29yZCA9PT0gY29uZmlybVBhc3N3b3JkO1xyXG5cclxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSBhc3luYyAoZTogUmVhY3QuRm9ybUV2ZW50KSA9PiB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBzZXRFcnJvcihcIlwiKTtcclxuICAgIHNldE1lc3NhZ2UoXCJcIik7XHJcblxyXG4gICAgaWYgKCFpc0xvZ2luICYmIHBhc3N3b3JkICE9PSBjb25maXJtUGFzc3dvcmQpIHtcclxuICAgICAgc2V0RXJyb3IoXCJQYXNzd29yZHMgZG8gbm90IG1hdGNoLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcblxyXG4gICAgY29uc3QgdXJsID0gaXNMb2dpbiA/IFwiL2FwaS9hdXRoL2xvZ2luXCIgOiBcIi9hcGkvYXV0aC9yZWdpc3RlclwiO1xyXG4gICAgLy8gUm9sZSBpcyBub3Qgc2VsZWN0YWJsZSDigJQgdGhlIHNlcnZlciBhbHdheXMgYXNzaWducyBcIlNlbGxlclwiIG9uIHJlZ2lzdGVyLlxyXG4gICAgLy8gQ2xpZW50LXNpZGUgZmllbGRzIChjb3VudHJ5LCBidXNpbmVzc1R5cGUpIGFyZSBjYXB0dXJlZCBoZXJlIGZvciBVWCBidXRcclxuICAgIC8vIGFyZSBOT1Qgc2VudCBpbiB0aGUgYXV0aCBwYXlsb2FkIGJlY2F1c2UgdGhlIGV4aXN0aW5nIGJhY2tlbmQgY29udHJhY3RcclxuICAgIC8vIGFjY2VwdHMge25hbWUsIGVtYWlsLCBwYXNzd29yZH0gb25seS4gVGhleSBsaXZlIGFzIGxvY2FsIHN0YXRlIHRvIGJlXHJcbiAgICAvLyBzdXJmYWNlZCBpbiB0aGUgd29ya3NwYWNlIGFmdGVyIGxvZ2luLlxyXG4gICAgY29uc3QgYm9keSA9IGlzTG9naW5cclxuICAgICAgPyB7IGVtYWlsLCBwYXNzd29yZCB9XHJcbiAgICAgIDogeyBuYW1lLCBlbWFpbCwgcGFzc3dvcmQgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHtcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXMuanNvbigpO1xyXG5cclxuICAgICAgaWYgKCFyZXMub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZFwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2V0TWVzc2FnZShkYXRhLm1lc3NhZ2UpO1xyXG5cclxuICAgICAgLy8gUGVyc2lzdCB0b2tlbiArIHJlbWVtYmVyLW1lIHByZWZlcmVuY2UuIFRoZSBleGlzdGluZyBhdXRoIGNvbnRyYWN0XHJcbiAgICAgIC8vIHN0b3JlcyB1bmRlciBgcGFydG5lcl90b2tlbmAgLyBgcGFydG5lcl91c2VyYCDigJQga2VlcCB0aGF0IGV4YWN0IGtleS5cclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwYXJ0bmVyX3Rva2VuXCIsIGRhdGEudG9rZW4pO1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInBhcnRuZXJfdXNlclwiLCBKU09OLnN0cmluZ2lmeShkYXRhLnVzZXIpKTtcclxuICAgICAgaWYgKHJlbWVtYmVyTWUpIHtcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInBhcnRuZXJfcmVtZW1iZXJcIiwgXCIxXCIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwicGFydG5lcl9yZW1lbWJlclwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2FjaGUgYnVzaW5lc3MgcHJvZmlsZSBmb3IgbGF0ZXIgc3RlcHMgaW4gdGhlIHdvcmtzcGFjZS5cclxuICAgICAgaWYgKCFpc0xvZ2luKSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXHJcbiAgICAgICAgICBcInBhcnRuZXJfcHJvZmlsZVwiLFxyXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoeyBuYW1lLCBjb3VudHJ5LCBidXNpbmVzc1R5cGUgfSlcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBvblN1Y2Nlc3MoZGF0YS50b2tlbik7XHJcbiAgICAgIH0sIDQwMCk7XHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSB8fCBcIlNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHN3aXRjaE1vZGUgPSAobmV4dDogYm9vbGVhbikgPT4ge1xyXG4gICAgc2V0SXNMb2dpbihuZXh0KTtcclxuICAgIHNldEVycm9yKFwiXCIpO1xyXG4gICAgc2V0TWVzc2FnZShcIlwiKTtcclxuICB9O1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctWyMwRDBEMERdIHRleHQtWyNGMUY1RjldIGZvbnQtc2FucyBvdmVyZmxvdy14LWhpZGRlbiByZWxhdGl2ZVwiPlxyXG4gICAgICB7LyogUmFkaWFsIGJsdWUgZ3JhZGllbnQgZ2xvdyDigJQgbWF0Y2hlcyB0aGUgbGFuZGluZyBwYWdlIGhlcm8gZXhhY3RseSAqL31cclxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIGJnLVtyYWRpYWwtZ3JhZGllbnQoZWxsaXBzZV9hdF90b3AsX3ZhcigtLXR3LWdyYWRpZW50LXN0b3BzKSldIGZyb20tYmx1ZS05MDAvMjUgdmlhLVsjMEQwRDBEXSB0by1bIzBEMEQwRF0gLXotMTBcIiAvPlxyXG5cclxuICAgICAgey8qIFNvZnQgZmxvYXRpbmcgYWNjZW50cyBmb3IgZGVwdGggKG1pcnJvcnMgTGFuZGluZ1BhZ2UgYWVzdGhldGljKSAqL31cclxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwb2ludGVyLWV2ZW50cy1ub25lIGFic29sdXRlIHRvcC1bLTE1JV0gbGVmdC1bLTEwJV0gdy1bNTIwcHhdIGgtWzUyMHB4XSBiZy1ibHVlLTYwMC8xNSByb3VuZGVkLWZ1bGwgYmx1ci1bMTQwcHhdXCIgLz5cclxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwb2ludGVyLWV2ZW50cy1ub25lIGJvdHRvbS1bLTE1JV0gcmlnaHQtWy0xMCVdIHctWzUyMHB4XSBoLVs1MjBweF0gYmctaW5kaWdvLTYwMC8xNSByb3VuZGVkLWZ1bGwgYmx1ci1bMTQwcHhdXCIgLz5cclxuXHJcbiAgICAgIHsvKiBUb3AgbmF2IOKAlCBzYW1lIGxvZ28gKyBicmFuZCBhcyB0aGUgbGFuZGluZyBwYWdlICovfVxyXG4gICAgICA8bmF2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC02IHB5LTUgbWF4LXctN3hsIG14LWF1dG8gdy1mdWxsIHJlbGF0aXZlIHotMTBcIj5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCBiZy1ibHVlLTYwMCByb3VuZGVkLXhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtd2hpdGUgZm9udC1ib2xkIHRleHQtbGcgc2hhZG93LVswXzBfMTVweF9yZ2JhKDU5LDEzMCwyNDYsMC41KV1cIj5cclxuICAgICAgICAgICAgQk1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtMnhsIHRyYWNraW5nLXRpZ2h0IGZvbnQtc3luZSB0ZXh0LXdoaXRlXCI+XHJcbiAgICAgICAgICAgIEJpek1pbmQgQUlcclxuICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAge29uQmFjayAmJiAoXHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9e29uQmFja31cclxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXdoaXRlIHRyYW5zaXRpb24tY29sb3JzIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCJcclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPEFycm93UmlnaHQgY2xhc3NOYW1lPVwidy00IGgtNCByb3RhdGUtMTgwXCIgLz5cclxuICAgICAgICAgICAgQmFjayB0byBob21lXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICApfVxyXG4gICAgICA8L25hdj5cclxuXHJcbiAgICAgIHsvKiBDZW50ZXJlZCBjYXJkICovfVxyXG4gICAgICA8bWFpbiBjbGFzc05hbWU9XCJyZWxhdGl2ZSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB4LTQgcHktMTAgc206cHktMTZcIj5cclxuICAgICAgICA8bW90aW9uLmRpdlxyXG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAyNCwgc2NhbGU6IDAuOTggfX1cclxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCwgc2NhbGU6IDEgfX1cclxuICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDAuNSwgZWFzZTogXCJlYXNlT3V0XCIgfX1cclxuICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBtYXgtdy1tZFwiXHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgey8qIEdsYXNzbW9ycGhpc20gY2FyZCDigJQgdHJhbnNsdWNlbnQgb3ZlciBkYXJrIGJnLCBibHVycmVkLCBzb2Z0IHJpbmcgKi99XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIHJvdW5kZWQtMnhsIGJnLVsjMUExQTI2XS83MCBiYWNrZHJvcC1ibHVyLXhsIGJvcmRlciBib3JkZXItWyMyQTJBM0FdIHNoYWRvdy0yeGwgc2hhZG93LWJsYWNrLzYwIG92ZXJmbG93LWhpZGRlblwiPlxyXG4gICAgICAgICAgICB7LyogVG9wIGJsdWUgZ2xvdyBpbnNpZGUgdGhlIGNhcmQgKi99XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgLXRvcC0yNCBsZWZ0LTEvMiAtdHJhbnNsYXRlLXgtMS8yIHctWzQyMHB4XSBoLVsyNjBweF0gYmctYmx1ZS01MDAvMjAgcm91bmRlZC1mdWxsIGJsdXItM3hsIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxyXG5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBwLTcgc206cC05XCI+XHJcbiAgICAgICAgICAgICAgey8qIEhlYWRlciDigJQgZXllYnJvdyBjaGlwICsgaGVhZGluZyArIHN1YnRpdGxlICovfVxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbWItOFwiPlxyXG4gICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcclxuICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxyXG4gICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cclxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4xLCBkdXJhdGlvbjogMC40IH19XHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC0zIHB5LTEgcm91bmRlZC1mdWxsIGJnLWJsdWUtNTAwLzEwIGJvcmRlciBib3JkZXItYmx1ZS01MDAvMjAgdGV4dC1ibHVlLTQwMCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgbWItNFwiXHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIDxTcGFya2xlcyBjbGFzc05hbWU9XCJ3LTMuNSBoLTMuNVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgIEFJLVBvd2VyZWQgQnVzaW5lc3MgV29ya3NwYWNlXHJcbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPEFuaW1hdGVQcmVzZW5jZSBtb2RlPVwid2FpdFwiPlxyXG4gICAgICAgICAgICAgICAgICA8bW90aW9uLmgxXHJcbiAgICAgICAgICAgICAgICAgICAga2V5PXtpc0xvZ2luID8gXCJsb2dpbi10aXRsZVwiIDogXCJyZWdpc3Rlci10aXRsZVwifVxyXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogOCB9fVxyXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxyXG4gICAgICAgICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCwgeTogLTggfX1cclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjI1IH19XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9udC1zeW5lIHRleHQtM3hsIHNtOnRleHQtNHhsIGZvbnQtYm9sZCB0ZXh0LXdoaXRlIHRyYWNraW5nLXRpZ2h0XCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIHtpc0xvZ2luID8gXCJXZWxjb21lIEJhY2tcIiA6IFwiQ3JlYXRlIFlvdXIgQWNjb3VudFwifVxyXG4gICAgICAgICAgICAgICAgICA8L21vdGlvbi5oMT5cclxuICAgICAgICAgICAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxyXG5cclxuICAgICAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2UgbW9kZT1cIndhaXRcIj5cclxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5wXHJcbiAgICAgICAgICAgICAgICAgICAga2V5PXtpc0xvZ2luID8gXCJsb2dpbi1zdWJcIiA6IFwicmVnaXN0ZXItc3ViXCJ9XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiA2IH19XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XHJcbiAgICAgICAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCB5OiAtNiB9fVxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDAuMjUsIGRlbGF5OiAwLjA1IH19XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXQtMiB0ZXh0LXNtIHNtOnRleHQtWzE1cHhdIHRleHQtc2xhdGUtNDAwIGZvbnQtZG0tc2Fuc1wiXHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICB7aXNMb2dpblxyXG4gICAgICAgICAgICAgICAgICAgICAgPyBcIlNpZ24gaW4gdG8gY29udGludWUgZ3Jvd2luZyB5b3VyIGJ1c2luZXNzIHdpdGggQUkuXCJcclxuICAgICAgICAgICAgICAgICAgICAgIDogXCJKb2luIHRob3VzYW5kcyBvZiBzZWxsZXJzIHR1cm5pbmcgZGF0YSBpbnRvIGdyb3d0aC5cIn1cclxuICAgICAgICAgICAgICAgICAgPC9tb3Rpb24ucD5cclxuICAgICAgICAgICAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICB7LyogQWxlcnRzICovfVxyXG4gICAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2U+XHJcbiAgICAgICAgICAgICAgICB7ZXJyb3IgJiYgKFxyXG4gICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxyXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogLTYgfX1cclxuICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cclxuICAgICAgICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHk6IC02IH19XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibWItNCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItcmVkLTUwMC8zMCBiZy1yZWQtNTAwLzEwIHRleHQtcmVkLTMwMCB0ZXh0LXNtIHB4LTMgcHktMlwiXHJcbiAgICAgICAgICAgICAgICAgICAgcm9sZT1cImFsZXJ0XCJcclxuICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgIHtlcnJvcn1cclxuICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxyXG4gICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgIHttZXNzYWdlICYmIChcclxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcclxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IC02IH19XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XHJcbiAgICAgICAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCB5OiAtNiB9fVxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1iLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWVtZXJhbGQtNTAwLzMwIGJnLWVtZXJhbGQtNTAwLzEwIHRleHQtZW1lcmFsZC0zMDAgdGV4dC1zbSBweC0zIHB5LTJcIlxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAge21lc3NhZ2V9XHJcbiAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cclxuICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XHJcblxyXG4gICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVTdWJtaXR9IGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxyXG4gICAgICAgICAgICAgICAgPEFuaW1hdGVQcmVzZW5jZSBpbml0aWFsPXtmYWxzZX0+XHJcbiAgICAgICAgICAgICAgICAgIHshaXNMb2dpbiAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcclxuICAgICAgICAgICAgICAgICAgICAgIGtleT1cInJlZ2lzdGVyLWZpZWxkc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBoZWlnaHQ6IFwiYXV0b1wiIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC4zIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzcGFjZS15LTQgb3ZlcmZsb3ctaGlkZGVuXCJcclxuICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJDb21wYW55IE5hbWVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPXs8QnVpbGRpbmcyIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPn1cclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJBcGV4IFZlbmRvcnNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtuYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0TmFtZShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtpbnB1dENsc31cclxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvRmllbGQ+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgPEZpZWxkIGxhYmVsPVwiQ291bnRyeVwiIGljb249ezxHbG9iZTIgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2NvdW50cnl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRDb3VudHJ5KGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Ake2lucHV0Q2xzfSBhcHBlYXJhbmNlLW5vbmUgY3Vyc29yLXBvaW50ZXJgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge0NPVU5UUklFUy5tYXAoKGMpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17Y31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmctWyMxQTFBMjZdIHRleHQtd2hpdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvRmllbGQ+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiQnVzaW5lc3MgVHlwZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb249ezxCcmllZmNhc2UgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17YnVzaW5lc3NUeXBlfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0QnVzaW5lc3NUeXBlKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Ake2lucHV0Q2xzfSBhcHBlYXJhbmNlLW5vbmUgY3Vyc29yLXBvaW50ZXJgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge0JVU0lORVNTX1RZUEVTLm1hcCgoYikgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2J9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtifVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJiZy1bIzFBMUEyNl0gdGV4dC13aGl0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtifVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9GaWVsZD5cclxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XHJcbiAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cclxuXHJcbiAgICAgICAgICAgICAgICA8RmllbGQgbGFiZWw9XCJCdXNpbmVzcyBFbWFpbFwiIGljb249ezxNYWlsIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPn0+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRcclxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJlbWFpbFwiXHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJuYW1lQGNvbXBhbnkuY29tXCJcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17ZW1haWx9XHJcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRFbWFpbChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtpbnB1dENsc31cclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvRmllbGQ+XHJcblxyXG4gICAgICAgICAgICAgICAgPEZpZWxkIGxhYmVsPVwiUGFzc3dvcmRcIiBpY29uPXs8TG9jayBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz59PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPXtzaG93UGFzc3dvcmQgPyBcInRleHRcIiA6IFwicGFzc3dvcmRcIn1cclxuICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9e2lzTG9naW4gPyBcImN1cnJlbnQtcGFzc3dvcmRcIiA6IFwibmV3LXBhc3N3b3JkXCJ9XHJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIuKAouKAouKAouKAouKAouKAouKAouKAolwiXHJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFzc3dvcmR9XHJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFBhc3N3b3JkKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YCR7aW5wdXRDbHN9IHByLTExYH1cclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd1Bhc3N3b3JkKChzKSA9PiAhcyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzaG93UGFzc3dvcmQgPyBcIkhpZGUgcGFzc3dvcmRcIiA6IFwiU2hvdyBwYXNzd29yZFwifVxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgcmlnaHQtMiB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgcC0xLjUgcm91bmRlZC1tZCB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXdoaXRlIGhvdmVyOmJnLXdoaXRlLzUgdHJhbnNpdGlvbi1jb2xvcnNcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIHtzaG93UGFzc3dvcmQgPyAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxFeWVPZmYgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8RXllIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIHshaXNMb2dpbiAmJiA8UGFzc3dvcmRTdHJlbmd0aCB2YWx1ZT17cGFzc3dvcmR9IC8+fVxyXG4gICAgICAgICAgICAgICAgPC9GaWVsZD5cclxuXHJcbiAgICAgICAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlIGluaXRpYWw9e2ZhbHNlfT5cclxuICAgICAgICAgICAgICAgICAgeyFpc0xvZ2luICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxyXG4gICAgICAgICAgICAgICAgICAgICAga2V5PVwiY29uZmlybS1wYXNzd29yZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBoZWlnaHQ6IFwiYXV0b1wiIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC4zIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJvdmVyZmxvdy1oaWRkZW5cIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIkNvbmZpcm0gUGFzc3dvcmRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPXs8TG9jayBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz59XHJcbiAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9e3Nob3dQYXNzd29yZCA/IFwidGV4dFwiIDogXCJwYXNzd29yZFwifVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIuKAouKAouKAouKAouKAouKAouKAouKAolwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2NvbmZpcm1QYXNzd29yZH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldENvbmZpcm1QYXNzd29yZChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtpbnB1dENsc30gJHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFwYXNzd29yZHNNYXRjaCA/IFwiYm9yZGVyLXJlZC01MDAvNTAgZm9jdXM6cmluZy1yZWQtNTAwLzQwXCIgOiBcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L0ZpZWxkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgeyFwYXNzd29yZHNNYXRjaCAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIm10LTEgdGV4dC14cyB0ZXh0LXJlZC00MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBQYXNzd29yZHMgZG8gbm90IG1hdGNoLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cclxuICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxyXG5cclxuICAgICAgICAgICAgICAgIHsvKiBMb2dpbi1vbmx5OiByZW1lbWJlciBtZSArIGZvcmdvdCBwYXNzd29yZCAqL31cclxuICAgICAgICAgICAgICAgIHtpc0xvZ2luICYmIChcclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHQtMVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNtIHRleHQtc2xhdGUtMzAwIGN1cnNvci1wb2ludGVyIHNlbGVjdC1ub25lIGdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtyZW1lbWJlck1lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0UmVtZW1iZXJNZShlLnRhcmdldC5jaGVja2VkKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwZWVyIHNyLW9ubHlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3LTQgaC00IHJvdW5kZWQgYm9yZGVyIGJvcmRlci1bIzNBM0E0QV0gYmctWyMwRjBGMTZdIHBlZXItY2hlY2tlZDpiZy1ibHVlLTYwMCBwZWVyLWNoZWNrZWQ6Ym9yZGVyLWJsdWUtNjAwIHRyYW5zaXRpb24tY29sb3JzIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge3JlbWVtYmVyTWUgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENoZWNrIGNsYXNzTmFtZT1cInctMyBoLTMgdGV4dC13aGl0ZVwiIHN0cm9rZVdpZHRoPXszfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImdyb3VwLWhvdmVyOnRleHQtd2hpdGUgdHJhbnNpdGlvbi1jb2xvcnNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgUmVtZW1iZXIgbWVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiUGFzc3dvcmQgcmVzZXQgaXMgY29taW5nIHNvb24uIFBsZWFzZSBjb250YWN0IHN1cHBvcnQgaW4gdGhlIG1lYW50aW1lLlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1ibHVlLTQwMCBob3Zlcjp0ZXh0LWJsdWUtMzAwIHRyYW5zaXRpb24tY29sb3JzXCJcclxuICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICBGb3Jnb3QgcGFzc3dvcmQ/XHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICAgICAgICB7LyogU3VibWl0ICovfVxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcclxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBtdC0zIGJnLWJsdWUtNjAwIGhvdmVyOmJnLWJsdWUtNTAwIGRpc2FibGVkOm9wYWNpdHktNjAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkIHRleHQtd2hpdGUgZm9udC1ib2xkIHJvdW5kZWQteGwgcHktMyB0ZXh0LXNtIHNtOnRleHQtYmFzZSB0cmFuc2l0aW9uLWFsbCBzaGFkb3ctWzBfMF8yMHB4X3JnYmEoNTksMTMwLDI0NiwwLjMpXSBob3ZlcjpzaGFkb3ctWzBfMF8zMHB4X3JnYmEoNTksMTMwLDI0NiwwLjYpXSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBjdXJzb3ItcG9pbnRlciBhY3RpdmU6c2NhbGUtWzAuOTldXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAge2xvYWRpbmcgPyAoXHJcbiAgICAgICAgICAgICAgICAgICAgPD5cclxuICAgICAgICAgICAgICAgICAgICAgIDxMb2FkZXIyIGNsYXNzTmFtZT1cInctNCBoLTQgYW5pbWF0ZS1zcGluXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgIHtpc0xvZ2luID8gXCJTaWduaW5nIGluLi4uXCIgOiBcIkNyZWF0aW5nIGFjY291bnQuLi5cIn1cclxuICAgICAgICAgICAgICAgICAgICA8Lz5cclxuICAgICAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2lzTG9naW4gPyBcIlNpZ24gSW5cIiA6IFwiQ3JlYXRlIEFjY291bnRcIn1cclxuICAgICAgICAgICAgICAgICAgICAgIDxBcnJvd1JpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvPlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9mb3JtPlxyXG5cclxuICAgICAgICAgICAgICB7LyogRm9vdGVyIOKAlCBzd2l0Y2ggbW9kZSAqL31cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTcgdGV4dC1jZW50ZXIgdGV4dC1zbSB0ZXh0LXNsYXRlLTQwMFwiPlxyXG4gICAgICAgICAgICAgICAge2lzTG9naW4gPyAoXHJcbiAgICAgICAgICAgICAgICAgIDxwPlxyXG4gICAgICAgICAgICAgICAgICAgIERvbiZhcG9zO3QgaGF2ZSBhbiBhY2NvdW50P3tcIiBcIn1cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHN3aXRjaE1vZGUoZmFsc2UpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1ibHVlLTQwMCBob3Zlcjp0ZXh0LWJsdWUtMzAwIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbi1jb2xvcnNcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIENyZWF0ZSBGcmVlIEFjY291bnRcclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgICAgPHA+XHJcbiAgICAgICAgICAgICAgICAgICAgQWxyZWFkeSBoYXZlIGFuIGFjY291bnQ/e1wiIFwifVxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc3dpdGNoTW9kZSh0cnVlKX1cclxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtYmx1ZS00MDAgaG92ZXI6dGV4dC1ibHVlLTMwMCBmb250LXNlbWlib2xkIHRyYW5zaXRpb24tY29sb3JzXCJcclxuICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICBTaWduIGluIGluc3RlYWRcclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogU3VidGxlIHJlYXNzdXJhbmNlIGZvb3RlciDigJQgbm8gZW50ZXJwcmlzZS9kZW1vIGNocm9tZSAqL31cclxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIm10LTYgdGV4dC1jZW50ZXIgdGV4dC1bMTJweF0gdGV4dC1zbGF0ZS01MDAgZm9udC1kbS1zYW5zXCI+XHJcbiAgICAgICAgICAgIFNlY3VyZSBhdXRoZW50aWNhdGlvbi4gWW91ciBidXNpbmVzcyBkYXRhIHN0YXlzIHlvdXJzLlxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgIDwvbW90aW9uLmRpdj5cclxuICAgICAgPC9tYWluPlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufVxyXG5cclxuY29uc3QgaW5wdXRDbHMgPVxyXG4gIFwidy1mdWxsIGJnLVsjMEYwRjE2XSBib3JkZXIgYm9yZGVyLVsjMkEyQTNBXSB0ZXh0LXdoaXRlIHBsYWNlaG9sZGVyOnRleHQtc2xhdGUtNTAwIHJvdW5kZWQteGwgcHgtNCBweS0yLjUgdGV4dC1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAvNTAgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwLzYwIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1pbm5lclwiO1xyXG5cclxuZnVuY3Rpb24gRmllbGQoe1xyXG4gIGxhYmVsLFxyXG4gIGljb24sXHJcbiAgY2hpbGRyZW4sXHJcbn06IHtcclxuICBsYWJlbDogc3RyaW5nO1xyXG4gIGljb246IFJlYWN0LlJlYWN0Tm9kZTtcclxuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlO1xyXG59KSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXY+XHJcbiAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHRleHQtWzExcHhdIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtc2xhdGUtNDAwIG1iLTEuNVwiPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtYmx1ZS00MDBcIj57aWNvbn08L3NwYW4+XHJcbiAgICAgICAge2xhYmVsfVxyXG4gICAgICA8L2xhYmVsPlxyXG4gICAgICB7Y2hpbGRyZW59XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59XHJcbiJdLCJmaWxlIjoiQzovcHJvamVjdHMvQnVzaW5lc3NBbmFseXNpcy9zcmMvY29tcG9uZW50cy9jb21tb24vQXV0aFNjcmVlbi50c3gifQ==