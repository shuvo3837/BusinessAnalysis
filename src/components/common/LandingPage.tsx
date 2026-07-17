import React from "react";
import { ArrowRight, BarChart2, Bell, Box, Shield, Activity, TrendingUp, UploadCloud, MessageSquare, Check, Sparkles, Crown, Zap } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onLoginClick: () => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F1F5F9] font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            BM
          </div>
          <span className="font-bold text-2xl tracking-tight font-syne text-white">BizMind AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
          <button className="hover:text-blue-400 transition-colors">Features</button>
          <button className="hover:text-blue-400 transition-colors">How it works</button>
          <button className="hover:text-blue-400 transition-colors">Testimonials</button>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <button 
            onClick={onLoginClick}
            className="text-slate-300 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onLoginClick}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
          >
            Start For Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 pt-20 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0D0D0D] to-[#0D0D0D] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Meet Your AI-Powered Business Partner
            </div>
            
            <h1 className="font-syne text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
              Turn Business Data Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Actionable Growth</span>
            </h1>
            
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-dm-sans">
              BizMind AI acts as your personal business analyst. Upload your sales data and let AI identify dead stock, forecast demand, and build targeted marketing strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center">
              <button 
                onClick={onLoginClick}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 text-lg"
              >
                Start For Free <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-[#12121A] relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-syne text-4xl font-bold mb-16 text-white tracking-tight">Everything a growing business needs</h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
          >
            {[
              { icon: UploadCloud, title: "Upload Data", desc: "Instantly parse CSV, PDF, and Excel sheets with 1-click." },
              { icon: BarChart2, title: "Smart Analytics", desc: "Discover best sellers, dead stock, and real performance." },
              { icon: MessageSquare, title: "AI Chatbot", desc: "Talk directly to your data. Ask what to restock next." },
              { icon: TrendingUp, title: "Market Trends", desc: "AI builds strategies based entirely on your specific market." },
              { icon: Activity, title: "Customer Insights", desc: "Understand buyer personas automatically generated from sales." },
              { icon: Box, title: "Sales Forecast", desc: "Predict the next 3 months revenue with machine learning." }
            ].map((f, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-[#1A1A26] border border-[#2A2A3A] p-8 rounded-2xl hover:border-blue-500/50 transition-colors group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-syne">{f.title}</h3>
                <p className="text-slate-400 font-dm-sans">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-syne text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400">Your AI analyst is ready in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: 1, title: "Upload your data", desc: "Drop your CSV or Excel file containing your recent sales history." },
              { step: 2, title: "AI Analyzes", desc: "BizMind dynamically processes trends, stock levels, and revenue." },
              { step: 3, title: "Grow your business", desc: "Receive targeted marketing strategies and chat with the AI for advice." }
            ].map((w, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mb-6 font-syne shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  {w.step}
                </div>
                <h3 className="text-2xl font-bold text-[#F59E0B] mb-3 font-syne">{w.title}</h3>
                <p className="text-slate-400 font-dm-sans max-w-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[#12121A] relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> Pricing built for sellers
          </div>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Pick a plan that scales with your store
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16 font-dm-sans">
            From a single TikTok Shop stall to multi-channel empires on Shopify, Daraz
            and Facebook — BizMind AI grows when you grow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Starter — hobbyist seller */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="bg-[#1A1A26] border border-[#2A2A3A] p-8 rounded-2xl flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Starter</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-syne text-5xl font-bold text-white">$0</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">For first-time sellers testing the waters on one channel.</p>

              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                {[
                  "1 connected marketplace (TikTok Shop or Daraz)",
                  "Up to 200 orders / month tracked",
                  "Basic sales dashboard & profit summary",
                  "20 AI chat messages with BizMind assistant",
                  "CSV / Excel upload — manual sync",
                  "Email support",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onLoginClick}
                className="w-full bg-[#0D0D0D] border border-[#2A2A3A] hover:border-blue-500/60 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Start free
              </button>
            </motion.div>

            {/* Growth — most popular */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="bg-gradient-to-b from-[#1E2A4A] to-[#1A1A26] border border-blue-500/50 p-8 rounded-2xl flex flex-col relative shadow-[0_0_30px_rgba(59,130,246,0.25)]"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Most popular
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-blue-400">Growth</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-syne text-5xl font-bold text-white">$29</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">For sellers running daily ops across 2–3 channels.</p>

              <ul className="space-y-3 text-sm text-slate-200 mb-8 flex-1">
                {[
                  "Up to 3 marketplaces (Shopify + TikTok Shop + Daraz + Facebook)",
                  "Up to 5,000 orders / month tracked",
                  "Full AI Business Scanner — receipts, ledgers, khata pages (OCR)",
                  "Dead-stock detection & 30-day demand forecast",
                  "Unlimited AI chat for growth & ad-budget advice",
                  "Marketing strategist with channel-specific plans",
                  "Priority chat support",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onLoginClick}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]"
              >
                Start 7-day trial
              </button>
            </motion.div>

            {/* Scale — agencies / power sellers */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="bg-[#1A1A26] border border-[#2A2A3A] p-8 rounded-2xl flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-amber-400">Scale</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-syne text-5xl font-bold text-white">$79</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">For agencies & sellers managing multiple brands at scale.</p>

              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                {[
                  "Unlimited connected marketplaces & brands",
                  "Unlimited orders / month tracked",
                  "Team seats — up to 10 staff members",
                  "Multi-store analytics & cross-channel inventory view",
                  "Custom AI models tuned to your categories",
                  "Auto-generated weekly strategy reports (PDF)",
                  "Dedicated success manager + onboarding",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onLoginClick}
                className="w-full bg-[#0D0D0D] border border-amber-500/40 hover:border-amber-400 text-amber-300 py-3 rounded-xl font-bold transition-colors"
              >
                Talk to sales
              </button>
            </motion.div>
          </div>

          <p className="text-slate-500 text-xs mt-10">
            Prices in USD. BDT / local-currency billing available. Cancel anytime — no
            long-term lock-in.
          </p>
        </div>
      </section>

      <footer className="bg-[#05050A] text-slate-500 py-12 text-center text-sm font-dm-sans">
        © 2026 BizMind AI. Built for modern digital sellers.
      </footer>
    </div>
  );
}
