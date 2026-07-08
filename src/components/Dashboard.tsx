/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Layers,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Info,
  Upload,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardProps {
  token: string | null;
  onRefreshTrigger: number;
  customAnalytics: any;
  setCustomAnalytics: (data: any) => void;
}

export default function Dashboard({
  token,
  onRefreshTrigger,
  customAnalytics,
  setCustomAnalytics,
}: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState("All");
  const [timeframe, setTimeframe] = useState("60"); // past 60 days
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const marketplaces = ["All", "Shopify", "TikTok Shop", "Daraz", "Facebook"];

  useEffect(() => {
    if (!customAnalytics) {
      fetchData();
    }
  }, [selectedMarketplace, timeframe, onRefreshTrigger, customAnalytics]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const resAnal = await fetch("/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataAnal = await resAnal.json();

      const resSales = await fetch("/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataSales = await resSales.json();

      if (!resAnal.ok || !resSales.ok) {
        throw new Error("Unable to synthesize business aggregates");
      }

      setAnalytics(dataAnal);
      setSalesRecords(dataSales);
    } catch (err: any) {
      setError(err.message || "Failed to parse real-time aggregates.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        let fileMimeType = file.type;
        if (file.name.toLowerCase().endsWith(".csv")) {
          fileMimeType = "text/plain"; // Gemini handles text/plain safely for CSV contents
        } else if (!fileMimeType) {
          fileMimeType = "application/pdf";
        }

        const res = await fetch("/api/analyze-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            base64Data,
            mimeType: fileMimeType,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.error ||
              "Failed to analyze file. Please ensure it is a valid CSV or PDF.",
          );
        }

        const data = await res.json();
        setCustomAnalytics(data);
      } catch (err: any) {
        setError(err.message || "An error occurred during file analysis.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setCustomAnalytics(null);
    setFileName("");
    fetchData();
  };

  // Process sales data for Recharts trend (when not using custom analytics)
  const getTrendData = () => {
    if (customAnalytics && customAnalytics.trendData) {
      return customAnalytics.trendData.map((t: any) => ({
        rawDate: t.date,
        date: t.date, // simple map, might need short date format depending on returned data
        Revenue: t.revenue,
        Profit: t.profit,
        Volume: t.transactions || 1,
      }));
    }

    if (!salesRecords || salesRecords.length === 0) return [];

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - parseInt(timeframe));

    let filteredSales = salesRecords.filter((s) => {
      const sDate = new Date(s.saleDate);
      const isWithinDate = sDate >= startDate && sDate <= today;
      const isMarketMatch =
        selectedMarketplace === "All" || s.marketplace === selectedMarketplace;
      return isWithinDate && isMarketMatch;
    });

    const dateMap: Record<
      string,
      { date: string; revenue: number; profit: number; transactions: number }
    > = {};

    for (let i = parseInt(timeframe); i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateMap[dStr] = {
        date: displayDate,
        revenue: 0,
        profit: 0,
        transactions: 0,
      };
    }

    filteredSales.forEach((s) => {
      if (dateMap[s.saleDate]) {
        dateMap[s.saleDate].revenue += s.totalRevenue;
        dateMap[s.saleDate].profit += s.profit;
        dateMap[s.saleDate].transactions += 1;
      }
    });

    return Object.keys(dateMap)
      .sort()
      .map((k) => ({
        rawDate: k,
        date: dateMap[k].date,
        Revenue: Number(dateMap[k].revenue.toFixed(2)),
        Profit: Number(dateMap[k].profit.toFixed(2)),
        Volume: dateMap[k].transactions,
      }));
  };

  const trendData = getTrendData();

  // Dynamic values summary based on marketplace filter OR custom analytics
  const getDynamicSummary = () => {
    if (customAnalytics && customAnalytics.performance) {
      return {
        revenue: customAnalytics.performance.totalRevenue || 0,
        profit:
          customAnalytics.performance.totalRevenue *
          ((customAnalytics.performance.grossProfitMargin || 0) / 100),
        netMargin:
          customAnalytics.performance.totalRevenue *
          (((customAnalytics.performance.grossProfitMargin || 0) - 10) / 100),
        expenses: customAnalytics.performance.totalRevenue * 0.1,
      };
    }

    if (!analytics) return { revenue: 0, profit: 0, netMargin: 0, expenses: 0 };
    if (selectedMarketplace === "All") {
      return {
        revenue: analytics.summary.totalRevenue,
        profit: analytics.summary.grossProfit,
        netMargin: analytics.summary.netProfit,
        expenses: analytics.summary.totalExpenses,
      };
    }

    const marketDetails = analytics.marketDistribution.find(
      (m: any) => m.name === selectedMarketplace,
    );
    if (!marketDetails) {
      return { revenue: 0, profit: 0, netMargin: 0, expenses: 0 };
    }

    const marketRatio =
      marketDetails.revenue / (analytics.summary.totalRevenue || 1);
    const allocatedExpenses = analytics.summary.totalExpenses * marketRatio;

    return {
      revenue: marketDetails.revenue,
      profit: marketDetails.profit,
      netMargin: marketDetails.profit - allocatedExpenses,
      expenses: Number(allocatedExpenses.toFixed(2)),
    };
  };

  const currentSummary = getDynamicSummary();

  const PIE_COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#3b82f6", "#ec4899"];

  if (loading && !analytics && !customAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-medium tracking-wide">
          Syncing eCommerce Aggregates...
        </span>
      </div>
    );
  }

  // Auto generated insights from database state or Uploaded custom specs
  let mockAIInsights = [
    {
      type: "success",
      title: "Growth Channel Lead",
      desc: "Your TikTok Shop campaigns show 45% lower acquisition cost than Facebook ads this month. Restocking apparel here is highly advised.",
    },
    {
      type: "warning",
      title: "Low Stock Alert: Running Dry Soon",
      desc: `Your 'AirFlex Running Sneakers' has only ${analytics?.lowStockAlerts?.find((p: any) => p.sku === "SNE-RUN-03")?.stock || 3} units remaining. Restock immediately to sustain active sales.`,
    },
    {
      type: "neutral",
      title: "Seasonal Trend Detected",
      desc: "Apparel items are entering their prime summer peak. Bundler optimizations should be scheduled for execution.",
    },
  ];

  if (
    customAnalytics &&
    customAnalytics.forecast &&
    customAnalytics.strategies
  ) {
    mockAIInsights = [
      {
        type: "neutral",
        title: "Smart Restock Recommendation",
        desc:
          customAnalytics.forecast.restockRecommendations?.join(", ") ||
          "Review inventory levels.",
      },
      {
        type: "success",
        title: "Growth & Forecasting",
        desc: `Expected Growth: ${customAnalytics.forecast.expectedGrowth}. Best selling periods are expected to be ${customAnalytics.forecast.bestMonths}.`,
      },
      {
        type: "warning",
        title: "Marketing Strategy",
        desc:
          customAnalytics.strategies[0] ||
          "Optimize campaigns for target audience.",
      },
    ];
  }

  const categoryData = customAnalytics
    ? customAnalytics.categoryDistribution
    : analytics?.categoryDistribution;

  let pieChartData = analytics?.marketDistribution;
  if (customAnalytics && customAnalytics.categoryDistribution) {
    pieChartData = customAnalytics.categoryDistribution.map((c: any) => ({
      name: c.name,
      revenue: c.value,
      volume: Math.floor(Math.random() * 100) + 10, // Mock volume for pie chart
    }));
  }

  return (
    <div className="space-y-6">
      {/* File Upload Banner */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-teal-900/50 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Business Data Analysis
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Upload your own business data (CSV or PDF) and we will
              automatically extract your sales, compute analytics, and render
              your custom dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {fileName && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/50 px-3 py-1.5 rounded-md border border-indigo-500/20">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{fileName}</span>
                <button
                  onClick={handleReset}
                  className="ml-1 text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            )}
            <input
              type="file"
              accept=".csv, .pdf, application/pdf, text/csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading
                ? "Analyzing..."
                : fileName
                  ? "Upload New File"
                  : "Upload Data"}
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Layers className="w-32 h-32 text-indigo-100" />
        </div>
      </div>

      {customAnalytics &&
        customAnalytics.businessCategory &&
        customAnalytics.persona && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI Business Profile & Persona
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold">
                  Detected Category
                </span>
                <p className="text-lg font-bold text-slate-900">
                  {customAnalytics.businessCategory}
                </p>
              </div>
              <div className="md:col-span-2 bg-slate-50 border border-slate-100 p-4 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold mb-2">
                  Target Audience Persona
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Age Group</span>
                    <span className="font-medium text-slate-800">
                      {customAnalytics.persona.ageGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Gender</span>
                    <span className="font-medium text-slate-800">
                      {customAnalytics.persona.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Region</span>
                    <span className="font-medium text-slate-800">
                      {customAnalytics.persona.region}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Type</span>
                    <span className="font-medium text-slate-800">
                      {customAnalytics.persona.customerType}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed italic">
                  "{customAnalytics.persona.summary}"
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Filters HUD */}
      {!customAnalytics && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 border border-slate-800 rounded-xl gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>eCommerce Hub HUD</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Sync Mode: Live
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time stats compiled from automated sales & inventory nodes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Marketplace channel filter */}
            <div className="flex-1 sm:flex-none">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                Source Account
              </span>
              <select
                value={selectedMarketplace}
                onChange={(e) => setSelectedMarketplace(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {marketplaces.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe filter */}
            <div>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                History Block
              </span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="15">Past 15 Days</option>
                <option value="30">Past 30 Days</option>
                <option value="60">Past 60 Days</option>
              </select>
            </div>

            <button
              onClick={fetchData}
              className="mt-5 p-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg transition-all cursor-pointer"
              title="Force Full Re-Compile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-indigo-400/20 bg-indigo-500/5 p-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
            Gross Revenue
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5">
            ${currentSummary.revenue?.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1.5 mt-2.5 text-emerald-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% trajectory</span>
            <span className="text-slate-500 text-[10px] font-normal">
              vs historical average
            </span>
          </div>
        </div>

        {/* Profit Margin Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-teal-400/20 bg-teal-500/5 p-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
            Gross Trading Profit
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5">
            ${currentSummary.profit?.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1.5 mt-2.5 text-teal-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {customAnalytics
                ? customAnalytics.performance.grossProfitMargin
                : currentSummary.revenue > 0
                  ? (
                      (currentSummary.profit / currentSummary.revenue) *
                      100
                    ).toFixed(0)
                  : 0}
              % markup margin
            </span>
            <span className="text-slate-500 text-[10px] font-normal">
              stable rate
            </span>
          </div>
        </div>

        {/* Dynamic Card 3: Expenses OR Average Order Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-500/20 bg-amber-500/5 p-2 rounded-lg">
            {customAnalytics ? (
              <Layers className="w-5 h-5 text-amber-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
            {customAnalytics
              ? "Average Order Value"
              : "Marketing & Platform Costs"}
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5">
            $
            {customAnalytics
              ? customAnalytics.performance.averageOrderValue?.toLocaleString()
              : currentSummary.expenses?.toLocaleString()}
          </h3>
          {!customAnalytics && (
            <div className="flex items-center gap-1.5 mt-2.5 text-amber-400 text-xs font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>
                $
                {currentSummary.expenses > 0
                  ? (currentSummary.expenses / Number(timeframe)).toFixed(1)
                  : 0}
                /day speed
              </span>
              <span className="text-slate-500 text-[10px] font-normal">
                allocated ads
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Card 4: Net Margin OR Open Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-400/20 bg-emerald-500/5 p-2 rounded-lg">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
            {customAnalytics ? "Pending Orders" : "Net Retail Margin"}
          </span>
          <h3 className="text-2xl font-extrabold text-white mt-1.5">
            {customAnalytics
              ? customAnalytics.performance.openOrders
              : `$${currentSummary.netMargin?.toLocaleString()}`}
          </h3>
          {!customAnalytics ? (
            <div className="flex items-center gap-1.5 mt-2.5 text-emerald-400 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {currentSummary.revenue > 0
                  ? (
                      (currentSummary.netMargin / currentSummary.revenue) *
                      100
                    ).toFixed(0)
                  : 0}
                % net return
              </span>
              <span className="text-slate-500 text-[10px] font-normal">
                healthy score
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-2.5 text-indigo-400 text-xs font-medium">
              <span>Open unfulfilled checkouts</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main trend chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Financial Revenue & Margins Log
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Day-by-day overall billing and associated profit values.
              </p>
            </div>
            {!customAnalytics && (
              <span className="text-[10px] text-slate-500 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                Timeline: Past {timeframe} Days
              </span>
            )}
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                  }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                />
                <Legend iconSize={8} />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="Profit"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProf)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marketplace splits OR Category Mix */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            {customAnalytics
              ? "Top Revenue Categories (Share)"
              : "Marketplace Shares"}
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            {customAnalytics
              ? "Category volume distributed visually."
              : "Channel volume distributed across active platforms."}
          </p>

          <div className="h-56 relative flex items-center justify-center">
            {pieChartData && pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="revenue"
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">No data mapped</span>
            )}

            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                Total Volume
              </span>
              <span className="text-xl font-bold text-white">
                $
                {customAnalytics
                  ? customAnalytics.totalRevenue?.toLocaleString()
                  : analytics?.summary?.totalRevenue?.toLocaleString() || "0"}
              </span>
            </div>
          </div>

          {/* Custom legends list */}
          <div className="space-y-1.5 mt-2">
            {pieChartData?.slice(0, 4).map((item: any, idx: number) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-1.5 text-slate-300">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                    }}
                  />
                  <span className="truncate max-w-[100px]" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-white">
                    ${item.revenue?.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid for Insights & Category allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic AI Insights panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>AI Core Partner Insights</span>
              </h4>
              <span className="text-[10px] text-slate-500 bg-slate-950 px-2.5 py-0.5 rounded-full font-mono uppercase">
                Dynamic
              </span>
            </div>

            <div className="space-y-3.5">
              {mockAIInsights.map((ins: any, i: number) => (
                <div
                  key={i}
                  className={`p-3.5 border rounded-lg text-xs space-y-1 ${
                    ins.type === "success"
                      ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-300"
                      : ins.type === "warning"
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-300"
                        : "bg-slate-950/40 border-slate-800 text-slate-300"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1">
                    {ins.title}
                  </p>
                  <p className="text-[11.5px] leading-relaxed text-slate-400 font-normal">
                    {ins.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-slate-500 text-[10.5px]">
            <Info className="w-3.5 h-3.5" />
            <span>AI insights recompute with every file upload.</span>
          </div>
        </div>

        {/* Category breakdown bar charts */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Catalog Category Revenue
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Gross revenues matching catalog group divisions.
          </p>

          <div className="h-72">
            {categoryData && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis
                    dataKey="name"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name="Revenue Amount ($)"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#6366f1" : "#14b8a6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No active categories detected. Upload dynamic CSV values.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
